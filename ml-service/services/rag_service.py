"""
Enhanced RAG service — indexes ALL student data into ChromaDB for context-aware AI responses.
Handles marks, attendance, skills, projects, tasks, and academic performance.
"""
import os
import json

_use_chroma = False
_chroma_collection = None
_memory_store: dict = {}

try:
    import chromadb
    persist_dir = os.getenv("CHROMA_PERSIST_DIR", "./vectorstore/chroma_db")
    os.makedirs(persist_dir, exist_ok=True)
    chroma_client = chromadb.PersistentClient(path=persist_dir)
    _chroma_collection = chroma_client.get_or_create_collection(name="neev_students")
    _use_chroma = True
    print("✅ ChromaDB initialized")
except Exception as e:
    print(f"⚠️ ChromaDB unavailable, using in-memory RAG: {e}")


def index_student_data(student_id: str, data: dict) -> bool:
    """Index comprehensive student data into ChromaDB for RAG retrieval."""
    documents, metadatas, ids = [], [], []
    idx = 0
    name = data.get("name", student_id)

    # ── Profile ──
    if "cgpa" in data:
        doc = f"{name}: Sem {data.get('semester','?')}, Branch {data.get('branch','?')}, CGPA {data['cgpa']}, Goal: {data.get('careerGoal','Not Decided')}, Backlogs: {data.get('backlogs',0)}, Placement Readiness: {data.get('placementReadiness',0)}%, Streak: {data.get('currentStreak',0)} days"
        documents.append(doc)
        metadatas.append({"student_id": student_id, "type": "profile"})
        ids.append(f"{student_id}_profile"); idx += 1

    # ── Marks (per subject) ──
    marks = data.get("marks", [])
    if marks:
        for m in marks:
            sub = m.get("subject", "Unknown")
            internal = m.get("internal", m.get("internalMarks", 0))
            external = m.get("external", m.get("externalMarks", 0))
            practical = m.get("practical", m.get("practicalMarks", 0))
            max_i = m.get("maxInternal", 30)
            max_e = m.get("maxExternal", 70)
            max_p = m.get("maxPractical", 25)
            total = internal + external + practical
            max_total = max_i + max_e + max_p
            pct = round((total / max_total * 100) if max_total > 0 else 0, 1)
            doc = f"{name} marks in {sub}: Internal {internal}/{max_i}, External {external}/{max_e}, Practical {practical}/{max_p}, Total {total}/{max_total} ({pct}%), Semester {m.get('semester', '?')}"
            documents.append(doc)
            metadatas.append({"student_id": student_id, "type": "marks", "subject": sub})
            ids.append(f"{student_id}_mark_{idx}"); idx += 1

        # Overall marks summary
        if marks:
            subjects = [m.get("subject", "") for m in marks]
            avg_pct = sum((m.get("internal",0)+m.get("external",0))/(m.get("maxInternal",30)+m.get("maxExternal",70))*100 for m in marks) / len(marks)
            weak = [m.get("subject","") for m in marks if (m.get("internal",0)+m.get("external",0))/(m.get("maxInternal",30)+m.get("maxExternal",70))*100 < 50]
            strong = [m.get("subject","") for m in marks if (m.get("internal",0)+m.get("external",0))/(m.get("maxInternal",30)+m.get("maxExternal",70))*100 > 70]
            doc = f"{name} academic summary: {len(marks)} subjects, Average {round(avg_pct,1)}%, Strong: {', '.join(strong) or 'none'}, Weak: {', '.join(weak) or 'none'}"
            documents.append(doc)
            metadatas.append({"student_id": student_id, "type": "academic_summary"})
            ids.append(f"{student_id}_acad_{idx}"); idx += 1

    # ── Attendance ──
    attendance = data.get("attendance", [])
    if attendance:
        for a in attendance:
            sub = a.get("subject", "Unknown")
            total_c = a.get("totalClasses", 0)
            attended = a.get("attended", 0)
            pct = round((attended / total_c * 100) if total_c > 0 else 0, 1)
            doc = f"{name} attendance in {sub}: {attended}/{total_c} classes ({pct}%)"
            documents.append(doc)
            metadatas.append({"student_id": student_id, "type": "attendance", "subject": sub})
            ids.append(f"{student_id}_att_{idx}"); idx += 1

    # ── Skills ──
    skills = data.get("skills", [])
    if skills:
        skill_names = [s.get("name", s.get("skillName", "")) for s in skills if s.get("name") or s.get("skillName")]
        skill_details = [f"{s.get('name', s.get('skillName',''))}: {s.get('completionPercent', s.get('progress',0))}%" for s in skills]
        doc = f"{name} skills: {', '.join(skill_details)}"
        documents.append(doc)
        metadatas.append({"student_id": student_id, "type": "skills"})
        ids.append(f"{student_id}_skills_{idx}"); idx += 1

    # ── Projects ──
    for p in data.get("projects", []):
        tech = ', '.join(p.get('techStack', []))
        doc = f"{name} project: {p.get('title','')} - {p.get('description','')[:100]} [Tech: {tech}] Status: {p.get('status','in-progress')}"
        documents.append(doc)
        metadatas.append({"student_id": student_id, "type": "project"})
        ids.append(f"{student_id}_proj_{idx}"); idx += 1

    # ── Tasks/Planner ──
    tasks = data.get("tasks", [])
    if tasks:
        completed = sum(1 for t in tasks if t.get("completed"))
        doc = f"{name} weekly tasks: {completed}/{len(tasks)} completed. Tasks: {', '.join([t.get('title','') for t in tasks[:5]])}"
        documents.append(doc)
        metadatas.append({"student_id": student_id, "type": "tasks"})
        ids.append(f"{student_id}_tasks_{idx}"); idx += 1

    if not documents:
        return False

    if _use_chroma and _chroma_collection:
        try:
            existing = _chroma_collection.get(where={"student_id": student_id})
            if existing and existing["ids"]:
                _chroma_collection.delete(ids=existing["ids"])
            _chroma_collection.add(documents=documents, metadatas=metadatas, ids=ids)
            return True
        except Exception as e:
            print(f"ChromaDB index error: {e}")

    _memory_store[student_id] = [{"text": d, "type": m["type"]} for d, m in zip(documents, metadatas)]
    return True


def retrieve_context(query: str, student_context: dict = {}) -> str:
    """Retrieve relevant context from ChromaDB for RAG-powered responses."""
    sid = student_context.get("_id", student_context.get("studentId", ""))

    if _use_chroma and _chroma_collection:
        try:
            where = {"student_id": sid} if sid else None
            results = _chroma_collection.query(query_texts=[query], n_results=6, where=where)
            if results and results.get("documents"):
                return "\n".join(results["documents"][0])
        except Exception as e:
            print(f"ChromaDB query error: {e}")

    # Fallback: in-memory keyword search
    query_words = set(query.lower().split())
    results = []
    for s_id, docs in _memory_store.items():
        if sid and s_id != sid:
            continue
        for doc in docs:
            score = sum(1 for w in query_words if w in doc["text"].lower())
            if score > 0:
                results.append((score, doc["text"]))
    results.sort(key=lambda x: x[0], reverse=True)
    return "\n".join([r[1] for r in results[:6]])


def get_all_indexed_students():
    """Get count of indexed students."""
    if _use_chroma and _chroma_collection:
        try:
            return _chroma_collection.count()
        except:
            pass
    return len(_memory_store)

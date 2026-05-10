import os
from groq import Groq

client = None


def get_groq_client():
    global client
    if client is None:
        api_key = os.getenv("GROQ_API_KEY", "")
        if api_key:
            client = Groq(api_key=api_key)
    return client


SAARTHI_SYSTEM_PROMPT = """You are Saarthi (साथी) — an intelligent AI mentor built into the NEEV platform for engineering students.

Your personality:
- Communicate in a mix of Hindi and English (Hinglish) naturally
- Supportive, realistic, slightly funny, GenZ-friendly tone
- You KNOW the student's actual data (provided in context)
- Give specific, personalized advice — never generic
- Reference their actual weak subjects, skills, goals
- Use examples like: "Bhai tera attendance 60% hai aur FAANG ka sapna 😭"
- Be encouraging but honest: "Tiny progress still counts 👀"
- NEVER be robotic or sound like ChatGPT
- Always end with 1 actionable next step
- Use emojis occasionally, but stay professional
- You speak like a supportive senior who's been through it all

Your role:
- Academic guidance (study strategies, exam prep, backlog recovery)
- Career counseling (Web Dev, AI/ML, Data Science, Cybersecurity, etc.)
- Placement preparation (DSA, aptitude, communication, mock interviews)
- Motivation and mental health awareness
- Skill development roadmaps

Rules:
- Always personalize advice based on the student's data (semester, CGPA, skills, goals)
- Give actionable, specific advice — not generic motivation
- If student's CGPA < 5, be extra supportive but honest about the situation
- Recommend specific resources (free courses, YouTube channels, books)
- Keep responses concise (2-3 paragraphs max unless asked for detail)
- If asked about roadmap, skills, placement, projects — give actual guidance based on their semester and goal
- You have their full profile — USE IT

Fallback if you can't answer: "Saarthi thodi der baad milega, abhi busy hai 😅"
"""


def get_saarthi_response(message: str, history: list, student_context: dict, rag_context: str = "") -> str:
    groq_client = get_groq_client()

    # Build context string from student data
    ctx_parts = []
    if student_context:
        ctx_parts.append(f"Student: {student_context.get('name', 'Student')}")
        ctx_parts.append(f"Semester: {student_context.get('semester', '?')}")
        ctx_parts.append(f"Branch: {student_context.get('branch', '?')}")
        ctx_parts.append(f"CGPA: {student_context.get('cgpa', '?')}")
        ctx_parts.append(f"Career Goal: {student_context.get('careerGoal', 'Not Decided')}")
        if student_context.get('backlogs'):
            ctx_parts.append(f"Backlogs: {student_context.get('backlogs')}")
        if student_context.get('placementReadiness'):
            ctx_parts.append(f"Placement Readiness: {student_context.get('placementReadiness')}%")
        skills = student_context.get('skills', [])
        if skills:
            skill_names = [s.get('name', '') for s in skills[:8] if s.get('name')]
            ctx_parts.append(f"Skills: {', '.join(skill_names)}")
        if student_context.get('currentStreak'):
            ctx_parts.append(f"Current Streak: {student_context.get('currentStreak')} days")
        if student_context.get('weakSubjects'):
            ctx_parts.append(f"Weak Subjects: {', '.join(student_context.get('weakSubjects', []))}")

    context_str = "\n".join(ctx_parts)

    system_msg = SAARTHI_SYSTEM_PROMPT
    if context_str:
        system_msg += f"\n\n--- STUDENT PROFILE ---\n{context_str}"
    if rag_context:
        system_msg += f"\n\n--- RELEVANT CONTEXT FROM DATABASE ---\n{rag_context}"

    messages = [{"role": "system", "content": system_msg}]

    # Include last 10 conversation turns for context
    for h in history[-10:]:
        role = h.get("role", "user") if isinstance(h, dict) else h.role
        content = h.get("content", "") if isinstance(h, dict) else h.content
        messages.append({"role": role, "content": content})

    messages.append({"role": "user", "content": message})

    if not groq_client:
        return generate_fallback_response(message, student_context)

    try:
        completion = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            temperature=0.7,
            max_tokens=1024,
            top_p=0.9,
        )
        return completion.choices[0].message.content
    except Exception as e:
        print(f"Groq API error: {e}")
        return generate_fallback_response(message, student_context)


def generate_fallback_response(message: str, ctx: dict) -> str:
    name = ctx.get("name", "there") if ctx else "there"
    sem = ctx.get("semester", "?") if ctx else "?"
    cgpa = ctx.get("cgpa", "?") if ctx else "?"
    goal = ctx.get("careerGoal", "Not Decided") if ctx else "Not Decided"

    msg_lower = message.lower()

    if any(w in msg_lower for w in ["dsa", "coding", "leetcode", "algorithm"]):
        return f"Hey {name}! 🧑‍💻 DSA ke liye yeh plan follow kar:\n\nArrays → Strings → Linked Lists → Trees → Graphs → DP\n\nDaily 2-3 problems solve kar LeetCode pe. Sem {sem} mein consistency > volume. Striver's SDE Sheet try kar — it's absolute gold! 🔥\n\n**Next step:** Aaj hi LeetCode pe jaake ek Easy Array problem solve kar."

    elif any(w in msg_lower for w in ["placement", "job", "company", "interview"]):
        return f"Hey {name}! 🎯 Placement prep ka formula:\n\nDSA (40%) + Projects (25%) + Aptitude (20%) + Communication (15%)\n\nTera CGPA {cgpa} hai — focus on building strong projects and DSA skills. InfyTQ/TCS NQT patterns se start kar!\n\n**Next step:** Aaj 1 aptitude set solve kar aur 2 DSA problems khatam kar."

    elif any(w in msg_lower for w in ["backlog", "fail", "kt", "arrear"]):
        return f"Hey {name}, backlogs end nahi hai — they're a detour. 💪\n\nFocus on supplementary exam prep. Previous year papers padh, marking scheme samajh, aur 3 focused weeks de. Tu kar sakta hai!\n\n**Next step:** Backlog wale subject ka syllabus download kar aur aaj 1 chapter complete kar."

    elif any(w in msg_lower for w in ["motivat", "depress", "stress", "anxiety", "give up"]):
        return f"Hey {name}, sun — engineering tough hai, but CGPA doesn't define you. 🌱\n\nBreaks le, friends se baat kar, aur big goals ko tiny daily tasks mein tod. Even 30 mins of focused study > 5 hours of stressed scrolling. Tu akela nahi hai isme!\n\n**Next step:** Abhi 15 min ka timer laga aur sirf ek topic padh. Bas itna."

    elif any(w in msg_lower for w in ["project", "build", "portfolio"]):
        goal_projects = {
            "Full Stack": "MERN e-commerce app ya social media clone",
            "AI/ML": "sentiment analysis tool ya image classifier",
            "Data Science": "dashboard with real dataset from Kaggle",
            "Cybersecurity": "port scanner ya vulnerability checker",
        }
        suggestion = goal_projects.get(goal, "ek problem-solving app jo tera skill showcase kare")
        return f"Hey {name}! 💻 Tera goal {goal} hai, toh try kar: {suggestion}\n\nGitHub pe push kar, README likh, aur live deploy kar (Vercel/Railway free hai). Recruiters projects dekhte hai > certificates!\n\n**Next step:** Aaj project ka folder bana, git init kar, aur README.md likh."

    elif any(w in msg_lower for w in ["roadmap", "plan", "what should", "kya karu"]):
        return f"Hey {name}! 🗺️ Sem {sem} ke liye tera roadmap:\n\n1. DSA daily practice (2 problems)\n2. Goal-specific skill building ({goal})\n3. 1 project har semester\n4. Aptitude + English practice weekly\n5. GitHub green rakh!\n\nConsistency > intensity. Chhote steps, dangerous growth. 👀\n\n**Next step:** Aaj ka ek achievable target set kar aur complete karke yahan bata."

    else:
        return f"Hey {name}! Main Saarthi hoon, tera AI mentor on NEEV. 😊\n\nMujhse pooch — study plans, DSA roadmaps, placement prep, backlog recovery, ya kuch bhi. Tera data mere paas hai (Sem {sem}, CGPA {cgpa}, Goal: {goal}), toh personalized advice milega!\n\n**Next step:** Bata kya chal raha hai aaj?"

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Any, Dict, List, Optional
from services.cgpa_model import predict_cgpa
from services.backlog_model import assess_backlog_risk
from services.ai_predictions import analyze_skill_gap, predict_placement, generate_roadmap, generate_weekly_plan
from services.llm_service import get_saarthi_response
from services.rag_service import index_student_data, retrieve_context, get_all_indexed_students
from services.streaming_llm import stream_saarthi_response
from services.linear_model import linear_model
from services.insight_generator import generate_ai_insights, generate_ml_interpretation, generate_comparative_insight

# Import routers
from routers.sentiment import router as sentiment_router
from routers.deep_analysis import router as deep_analysis_router
from routers.guidance import router as guidance_router
from routers.interview import router as interview_router
from routers.trends import router as trends_router

app = FastAPI(title="NEEV ML Service", version="3.0")

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True,
                   allow_methods=["*"], allow_headers=["*"])

# Include routers
app.include_router(sentiment_router)
app.include_router(deep_analysis_router)
app.include_router(guidance_router)
app.include_router(interview_router)
app.include_router(trends_router)


class PredictionRequest(BaseModel):
    data: Dict[str, Any] = {}

class ChatRequest(BaseModel):
    message: str
    history: List[Dict] = []
    studentContext: Dict[str, Any] = {}

class IndexRequest(BaseModel):
    studentId: str
    data: Dict[str, Any] = {}


@app.get("/health")
def health():
    return {"status": "ok", "service": "NEEV ML Service v3.0", "features": ["cgpa", "backlog", "skills", "placement", "roadmap", "streaming", "sentiment", "clustering", "anomaly"]}


# ═══════ CGPA PREDICTION ═══════
@app.post("/ml/predict/cgpa")
def api_predict_cgpa(req: PredictionRequest):
    return predict_cgpa(req.data)


# ═══════ BACKLOG RISK ═══════
@app.post("/ml/predict/backlog")
def api_predict_backlog(req: PredictionRequest):
    return assess_backlog_risk(req.data)


# ═══════ SKILL GAP ANALYSIS ═══════
@app.post("/ml/predict/skills")
def api_predict_skills(req: PredictionRequest):
    return analyze_skill_gap(req.data)


# ═══════ PLACEMENT READINESS ═══════
@app.post("/ml/predict/placement")
def api_predict_placement(req: PredictionRequest):
    return predict_placement(req.data)


# ═══════ AI ROADMAP ═══════
@app.post("/ml/predict/roadmap")
def api_predict_roadmap(req: PredictionRequest):
    return generate_roadmap(req.data)


# ═══════ WEEKLY PLAN ═══════
@app.post("/ml/predict/weekly-plan")
def api_weekly_plan(req: PredictionRequest):
    return generate_weekly_plan(req.data)


# ═══════ WHAT-IF SIMULATOR ═══════
@app.post("/ml/whatif/simulate")
def api_whatif(req: PredictionRequest):
    data = req.data
    scenario = data.get("scenario", "improve_marks")
    current_cgpa = data.get("currentCGPA", 7.0)
    semester = data.get("currentSemester", 4)
    params = data.get("params", {})

    if scenario == "improve_marks":
        improvement = float(params.get("improvement_percent", 15))
        projected = min(10, round(current_cgpa + (improvement / 100) * (10 - current_cgpa), 2))
        return {"currentCGPA": current_cgpa, "projectedCGPA": projected,
                "impact": "positive", "message": f"Improving marks by {improvement}% could raise CGPA to {projected}! 📈",
                "tips": ["Focus on weak subjects first", "Consistent daily study > last-minute cramming"]}

    elif scenario == "drop_subject":
        subject = params.get("subject", "Mathematics")
        projected = max(0, round(current_cgpa - 0.4, 2))
        return {"currentCGPA": current_cgpa, "projectedCGPA": projected,
                "impact": "negative", "message": f"Failing {subject} could drop CGPA to {projected} and add a backlog. 😟",
                "tips": [f"Dedicate extra time to {subject} NOW", "Get help from seniors/teachers", "Solve previous year papers"]}

    elif scenario == "change_goal":
        new_goal = params.get("new_goal", "AI/ML")
        roadmap = generate_roadmap({"semester": semester, "careerGoal": new_goal, "hoursPerWeek": 10})
        return {"currentCGPA": current_cgpa, "newGoal": new_goal,
                "impact": "neutral", "message": f"Switching to {new_goal}! You'll need ~{roadmap['totalWeeks']} weeks of focused learning.",
                "requirements": {"phases": len(roadmap["phases"]), "totalWeeks": roadmap["totalWeeks"]},
                "tips": [f"Start with: {roadmap['phases'][0]['items'][0]}" if roadmap['phases'] else "Begin with basics"]}

    return {"message": "Unknown scenario", "impact": "neutral"}


# ═══════ SAARTHI CHAT ═══════
@app.post("/ml/saarthi/chat")
def api_saarthi_chat(req: ChatRequest):
    rag_context = retrieve_context(req.message, req.studentContext)
    response = get_saarthi_response(req.message, req.history, req.studentContext, rag_context)
    return {"role": "assistant", "content": response}


# ═══════ SAARTHI STREAMING ═══════
@app.post("/ml/saarthi/stream")
def api_saarthi_stream(req: ChatRequest):
    context = retrieve_context(req.message, req.studentContext)
    context_str = str(req.studentContext) + "\n" + str(context) if context else str(req.studentContext)

    def generate():
        for token in stream_saarthi_response(req.message, context_str, req.history):
            yield token

    return StreamingResponse(generate(), media_type="text/plain")


# ═══════ RAG INDEXING ═══════
@app.post("/ml/rag/index")
def api_rag_index(req: IndexRequest):
    success = index_student_data(req.studentId, req.data)
    return {"indexed": success}


# ═══════ PATTERN DETECTION ═══════
@app.post("/ml/patterns/detect")
def api_detect_patterns(req: PredictionRequest):
    marks = req.data.get("marks", [])
    patterns = []

    subject_scores = {}
    for m in marks:
        sub = m.get("subject", "")
        total = m.get("internal", 0) + m.get("external", 0) + m.get("practical", 0)
        max_t = m.get("maxInternal", 30) + m.get("maxExternal", 70) + m.get("maxPractical", 25)
        pct = (total / max_t * 100) if max_t > 0 else 0
        subject_scores[sub] = pct

    for sub, pct in subject_scores.items():
        if pct < 40:
            patterns.append({"type": "critical", "risk": "high",
                             "message": f"🚨 {sub}: {round(pct)}% — Critical! Needs immediate attention."})
        elif pct < 55:
            patterns.append({"type": "warning", "risk": "medium",
                             "message": f"⚠️ {sub}: {round(pct)}% — Below average. Extra practice needed."})

    theory = [v for k, v in subject_scores.items() if any(w in k.lower() for w in ["math", "discrete", "theory"])]
    practical = [v for k, v in subject_scores.items() if any(w in k.lower() for w in ["web", "programming", "lab", "java", "python"])]

    if theory and practical:
        theory_avg = sum(theory) / len(theory)
        practical_avg = sum(practical) / len(practical)
        if practical_avg - theory_avg > 15:
            patterns.append({"type": "insight", "risk": "medium",
                             "message": f"📊 Theory ({round(theory_avg)}%) much weaker than practical ({round(practical_avg)}%). Focus on conceptual understanding."})

    return {"patterns": patterns, "totalSubjects": len(subject_scores)}


# ═══════ LINEAR REGRESSION TREND ═══════
@app.post("/ml/predict/trend")
def api_predict_trend(req: PredictionRequest):
    semester_data = req.data.get("semester_data", [])
    current_semester = req.data.get("current_semester", req.data.get("semester", 4))
    return linear_model.predict_trend(semester_data, current_semester)


# ═══════ AI INSIGHTS ═══════
@app.post("/ml/insights/generate")
def api_generate_insights(req: PredictionRequest):
    student_data = req.data.get("student", req.data)
    ml_predictions = req.data.get("predictions", {})
    return generate_ai_insights(student_data, ml_predictions)


# ═══════ COMPARATIVE INSIGHTS ═══════
@app.post("/ml/insights/compare")
def api_compare_insights(req: PredictionRequest):
    student = req.data.get("student", {})
    class_avg = req.data.get("class_avg", {"avgCgpa": 6.8, "avgAttendance": 74})
    return generate_comparative_insight(student, class_avg)


# ═══════ ML INTERPRETATION ═══════
@app.post("/ml/insights/interpret")
def api_interpret(req: PredictionRequest):
    prediction = req.data.get("prediction", {})
    patterns = req.data.get("patterns", [])
    student = req.data.get("student", {})
    interpretation = generate_ml_interpretation(prediction, patterns, student)
    return {"interpretation": interpretation}


# ═══════ RAG STATUS ═══════
@app.get("/ml/rag/status")
def api_rag_status():
    return {"indexed_documents": get_all_indexed_students(), "status": "active"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

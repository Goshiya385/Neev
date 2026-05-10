from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from services.cgpa_model import predict_cgpa
from services.backlog_model import predict_backlog_risk

router = APIRouter()

class MarksInput(BaseModel):
    semester: int
    subject: str
    internalMarks: float = 0
    practicalMarks: float = 0
    externalMarks: float = 0
    maxInternal: float = 30
    maxPractical: float = 25
    maxExternal: float = 70

class PredictionRequest(BaseModel):
    marks: List[MarksInput]
    currentCGPA: float = 0
    semester: int = 1
    backlogs: int = 0

class PlacementPredictionRequest(BaseModel):
    cgpa: float = 0
    dsaSkills: float = 0
    projectCount: int = 0
    communication: float = 0
    aptitude: float = 0
    semester: int = 1

@router.post("/cgpa")
def predict_next_cgpa(req: PredictionRequest):
    sem_data = {}
    for m in req.marks:
        if m.semester not in sem_data:
            sem_data[m.semester] = []
        total = m.internalMarks + m.externalMarks + m.practicalMarks
        mx = m.maxInternal + m.maxExternal + m.maxPractical
        sem_data[m.semester].append(total / mx * 10 if mx > 0 else 0)
    
    sgpas = []
    for sem in sorted(sem_data.keys()):
        avg = sum(sem_data[sem]) / len(sem_data[sem]) if sem_data[sem] else 0
        sgpas.append({"semester": sem, "sgpa": round(avg, 2)})
    
    predicted = predict_cgpa(sgpas)
    return {
        "currentCGPA": req.currentCGPA,
        "predictedNextSGPA": predicted["predicted_sgpa"],
        "predictedCGPA": predicted["predicted_cgpa"],
        "trend": predicted["trend"],
        "confidence": predicted["confidence"],
        "sgpaHistory": sgpas
    }

@router.post("/backlog")
def predict_backlog(req: PredictionRequest):
    subject_risks = []
    for m in req.marks:
        if m.semester == req.semester:
            total = m.internalMarks + m.externalMarks + m.practicalMarks
            mx = m.maxInternal + m.maxExternal + m.maxPractical
            pct = (total / mx * 100) if mx > 0 else 0
            risk = predict_backlog_risk(pct, req.backlogs, req.semester)
            subject_risks.append({"subject": m.subject, "percentage": round(pct, 1), "backlogRisk": risk["risk_percent"], "riskLevel": risk["level"]})
    
    overall = max([s["backlogRisk"] for s in subject_risks]) if subject_risks else 0
    return {"overallRisk": overall, "subjectRisks": subject_risks}

@router.post("/placement")
def predict_placement(req: PlacementPredictionRequest):
    base = (req.cgpa / 10) * 25 + req.dsaSkills * 0.25 + min(req.projectCount * 10, 20) + req.communication * 0.15 + req.aptitude * 0.15
    sem_bonus = max(0, (req.semester - 2) * 3)
    score = min(round(base + sem_bonus), 100)
    tier = "dream" if score >= 80 else "product" if score >= 60 else "mass" if score >= 40 else "at-risk"
    return {"placementScore": score, "tier": tier, "breakdown": {"academics": round((req.cgpa/10)*25), "dsa": round(req.dsaSkills*0.25), "projects": min(req.projectCount*10, 20), "communication": round(req.communication*0.15), "aptitude": round(req.aptitude*0.15)}}

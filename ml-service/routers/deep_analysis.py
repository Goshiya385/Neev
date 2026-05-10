"""
Deep Analysis router — RF CGPA prediction, K-Means clustering, Anomaly detection.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any

from services.rf_model import cgpa_predictor
from services.clustering import clustering_engine
from services.anomaly import anomaly_detector

router = APIRouter(prefix="/ml/analysis", tags=["Deep Analysis"])


class StudentAnalysisRequest(BaseModel):
    student_data: Dict[str, Any] = {}


class BatchAnalysisRequest(BaseModel):
    students: List[Dict[str, Any]] = []


@router.post("/deep-report")
async def deep_report(request: StudentAnalysisRequest):
    try:
        student = request.student_data
        cgpa_prediction = cgpa_predictor.predict(student)
        risk_level = _compute_risk_level(student, cgpa_prediction)

        return {
            "prediction": cgpa_prediction,
            "risk_level": risk_level,
            "priority_action": cgpa_prediction.get("feature_importance", {}),
            "message": cgpa_prediction.get("message", "")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/cluster/students")
async def cluster_students(request: BatchAnalysisRequest):
    try:
        clusters = clustering_engine.fit_and_classify(request.students)
        cluster_summary = {}
        for student in clusters:
            cid = student['cluster_id']
            if cid not in cluster_summary:
                cluster_summary[cid] = {"name": student['name'], "color": student['color'], "students": [], "count": 0}
            cluster_summary[cid]['students'].append(student.get('name', ''))
            cluster_summary[cid]['count'] += 1
        return {"clusters": clusters, "summary": cluster_summary, "total": len(clusters)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/anomaly/detect")
async def detect_anomalies(request: BatchAnalysisRequest):
    try:
        anomalies = anomaly_detector.detect_anomalies(request.students)
        return {"anomalies": anomalies, "total_flagged": len(anomalies), "total_students": len(request.students)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def _compute_risk_level(student: dict, prediction: dict) -> str:
    score = 0
    if student.get('cgpa', 7) < 5: score += 3
    elif student.get('cgpa', 7) < 6: score += 2
    if student.get('attendancePct', 80) < 60: score += 3
    elif student.get('attendancePct', 80) < 75: score += 1
    if student.get('backlogs', 0) > 2: score += 2
    if prediction.get('trend') == 'declining': score += 2
    return "high" if score >= 5 else "moderate" if score >= 3 else "stable"

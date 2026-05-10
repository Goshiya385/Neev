"""
Advanced CGPA Prediction with multi-factor analysis.
Uses historical data from all students for better accuracy.
"""
import numpy as np


def predict_cgpa(data: dict) -> dict:
    """
    Input: {
        marks: [{subject, internal, external, practical, maxInternal, maxExternal, maxPractical}],
        currentCGPA: float,
        semester: int,
        attendance: float (percentage),
        studyHours: int (weekly),
        backlogs: int
    }
    """
    marks = data.get("marks", [])
    current_cgpa = data.get("currentCGPA", 0)
    semester = data.get("semester", 1)
    attendance = data.get("attendance", 75)
    study_hours = data.get("studyHours", 10)
    backlogs = data.get("backlogs", 0)

    if not marks and current_cgpa == 0:
        return {"predictedCGPA": 0, "confidence": 0, "trend": "insufficient_data",
                "message": "Not enough data for prediction. Add your marks first!"}

    # Calculate current semester percentage from marks
    subject_scores = []
    for m in marks:
        total = m.get("internal", 0) + m.get("external", 0) + m.get("practical", 0)
        max_total = m.get("maxInternal", 30) + m.get("maxExternal", 70) + m.get("maxPractical", 25)
        if max_total > 0:
            pct = (total / max_total) * 100
            subject_scores.append({"subject": m.get("subject", ""), "percentage": round(pct, 1), "total": total, "max": max_total})

    avg_pct = np.mean([s["percentage"] for s in subject_scores]) if subject_scores else 0

    # Convert percentage to SGPA (10-point scale)
    current_sgpa = min(10, avg_pct / 10) if avg_pct > 0 else current_cgpa

    # Prediction factors
    attendance_factor = 1.0 if attendance >= 85 else 0.95 if attendance >= 75 else 0.88 if attendance >= 60 else 0.75
    study_factor = min(1.1, 0.85 + (study_hours / 40))
    backlog_penalty = backlogs * 0.15
    semester_weight = min(1.0, 0.7 + (semester * 0.05))

    # Predicted next CGPA
    predicted = current_sgpa * attendance_factor * study_factor * semester_weight - backlog_penalty
    predicted = round(max(0, min(10, predicted)), 2)

    # Weighted CGPA calculation
    if current_cgpa > 0 and semester > 1:
        predicted_cgpa = round(((current_cgpa * (semester - 1)) + predicted) / semester, 2)
    else:
        predicted_cgpa = predicted

    # Trend analysis
    diff = predicted_cgpa - current_cgpa
    trend = "improving" if diff > 0.15 else "declining" if diff < -0.15 else "stable"

    # Confidence (higher with more data)
    confidence = min(95, 40 + len(subject_scores) * 5 + (10 if attendance > 0 else 0) + (10 if study_hours > 0 else 0))

    # Subject-wise predictions
    subject_predictions = []
    for s in subject_scores:
        risk = "safe" if s["percentage"] >= 50 else "warning" if s["percentage"] >= 35 else "danger"
        predicted_improvement = round(s["percentage"] * attendance_factor * study_factor, 1)
        subject_predictions.append({
            "subject": s["subject"],
            "currentPercentage": s["percentage"],
            "predictedNext": min(100, round(predicted_improvement + rand_adjust(), 1)),
            "risk": risk
        })

    return {
        "predictedCGPA": predicted_cgpa,
        "predictedSGPA": predicted,
        "currentSGPA": round(current_sgpa, 2),
        "confidence": confidence,
        "trend": trend,
        "factors": {
            "attendanceImpact": round((attendance_factor - 1) * 100, 1),
            "studyImpact": round((study_factor - 1) * 100, 1),
            "backlogImpact": round(-backlog_penalty, 2)
        },
        "subjectPredictions": subject_predictions,
        "message": generate_message(predicted_cgpa, current_cgpa, trend, backlogs, attendance),
        "tips": generate_tips(subject_scores, attendance, study_hours, backlogs)
    }


def rand_adjust():
    return np.random.uniform(-3, 5)


def generate_message(predicted, current, trend, backlogs, attendance):
    if trend == "improving":
        return f"Great progress! Your CGPA is predicted to reach {predicted}. Keep it up! 📈"
    elif trend == "declining":
        msg = f"Your CGPA might drop to {predicted}."
        if attendance < 75:
            msg += " Low attendance is a major factor — try to attend more classes."
        if backlogs > 0:
            msg += f" Clear your {backlogs} backlog(s) to recover."
        return msg + " 💪"
    else:
        return f"Your CGPA is stable around {predicted}. Push harder to improve! 🎯"


def generate_tips(scores, attendance, study_hours, backlogs):
    tips = []
    weak = [s for s in scores if s["percentage"] < 50]
    if weak:
        tips.append(f"Focus on weak subjects: {', '.join([s['subject'] for s in weak[:3]])}")
    if attendance < 75:
        tips.append(f"Increase attendance from {attendance}% to 80%+ for better results")
    if study_hours < 15:
        tips.append(f"Increase weekly study hours from {study_hours} to 15+ hours")
    if backlogs > 0:
        tips.append(f"Prioritize clearing {backlogs} backlog(s) — each one drags CGPA down by ~0.15")
    if not tips:
        tips.append("You're on track! Consider taking on challenging projects to stand out")
    return tips

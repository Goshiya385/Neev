"""
Backlog Risk Assessment — per-subject risk analysis with actionable advice.
"""


def assess_backlog_risk(data: dict) -> dict:
    """
    Input: {
        marks: [{subject, internal, external, practical, maxInternal, maxExternal, maxPractical}],
        attendance: float,
        backlogs: int,
        semester: int
    }
    """
    marks = data.get("marks", [])
    attendance = data.get("attendance", 75)
    existing_backlogs = data.get("backlogs", 0)
    semester = data.get("semester", 1)

    at_risk_subjects = []
    safe_subjects = []
    overall_risk = 0

    for m in marks:
        total = m.get("internal", 0) + m.get("external", 0) + m.get("practical", 0)
        max_total = m.get("maxInternal", 30) + m.get("maxExternal", 70) + m.get("maxPractical", 25)
        pct = (total / max_total * 100) if max_total > 0 else 0
        subject = m.get("subject", "Unknown")

        # Risk calculation
        risk_score = 0
        reasons = []

        if pct < 35:
            risk_score += 50
            reasons.append(f"Score {round(pct)}% is below passing (35%)")
        elif pct < 45:
            risk_score += 30
            reasons.append(f"Score {round(pct)}% is borderline")
        elif pct < 55:
            risk_score += 15
            reasons.append(f"Score {round(pct)}% needs improvement")

        # Internal marks check
        internal_pct = (m.get("internal", 0) / max(m.get("maxInternal", 30), 1)) * 100
        if internal_pct < 40:
            risk_score += 15
            reasons.append(f"Internal marks weak ({round(internal_pct)}%)")

        # Attendance impact
        if attendance < 60:
            risk_score += 20
            reasons.append("Very low attendance (<60%)")
        elif attendance < 75:
            risk_score += 10
            reasons.append("Attendance below requirement (<75%)")

        # Existing backlogs increase risk
        if existing_backlogs > 0:
            risk_score += existing_backlogs * 5
            reasons.append(f"{existing_backlogs} existing backlog(s) add pressure")

        risk_level = "high" if risk_score >= 40 else "medium" if risk_score >= 20 else "low"

        entry = {
            "subject": subject,
            "percentage": round(pct, 1),
            "riskScore": min(100, risk_score),
            "riskLevel": risk_level,
            "reasons": reasons,
            "suggestion": get_suggestion(subject, pct, risk_level)
        }

        if risk_level in ("high", "medium"):
            at_risk_subjects.append(entry)
        else:
            safe_subjects.append(entry)

        overall_risk += risk_score

    num_subjects = max(len(marks), 1)
    overall_risk_pct = min(100, round(overall_risk / num_subjects))

    return {
        "overallRisk": overall_risk_pct,
        "riskLevel": "high" if overall_risk_pct >= 50 else "medium" if overall_risk_pct >= 25 else "low",
        "atRiskSubjects": sorted(at_risk_subjects, key=lambda x: x["riskScore"], reverse=True),
        "safeSubjects": safe_subjects,
        "totalSubjects": len(marks),
        "atRiskCount": len(at_risk_subjects),
        "message": get_overall_message(overall_risk_pct, len(at_risk_subjects), existing_backlogs),
        "actionPlan": get_action_plan(at_risk_subjects, attendance, existing_backlogs)
    }


def get_suggestion(subject, pct, risk):
    sub_lower = subject.lower()
    if risk == "high":
        if "math" in sub_lower or "discrete" in sub_lower:
            return "Daily practice problems + Khan Academy. Focus on solved examples first."
        elif "data structure" in sub_lower or "algorithm" in sub_lower or "dsa" in sub_lower:
            return "Visual learning: watch Abdul Bari / Jenny's Lectures. Code each concept."
        else:
            return f"Dedicate 1 hour daily to {subject}. Use previous year papers for practice."
    elif risk == "medium":
        return f"Revise weak topics in {subject}. Solve at least 10 practice problems this week."
    return "Keep it up! You're doing well in this subject."


def get_overall_message(risk_pct, at_risk_count, backlogs):
    if risk_pct >= 50:
        return f"⚠️ High risk! {at_risk_count} subjects need immediate attention. Focus on weak areas NOW."
    elif risk_pct >= 25:
        return f"⚡ Moderate risk — {at_risk_count} subject(s) need work. You have time to fix this!"
    else:
        return "✅ Looking good! Keep your consistency and you'll clear all subjects."


def get_action_plan(at_risk, attendance, backlogs):
    plan = []
    if at_risk:
        plan.append(f"Priority 1: Focus on {at_risk[0]['subject']} (highest risk)")
    if len(at_risk) > 1:
        plan.append(f"Priority 2: Improve {at_risk[1]['subject']}")
    if attendance < 75:
        plan.append("Attend ALL classes from now — attendance directly impacts passing")
    if backlogs > 0:
        plan.append(f"Clear existing {backlogs} backlog(s) — prepare for supplementary exams")
    plan.append("Solve previous year papers for each at-risk subject")
    return plan

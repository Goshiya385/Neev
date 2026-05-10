def detect_patterns(marks: list, attendance: list) -> list:
    """Detect academic weakness patterns from marks and attendance data."""
    patterns = []

    # 1. Subject-wise weakness detection
    subject_scores = {}
    for m in marks:
        subj = m.get("subject", "")
        total = m.get("internalMarks", 0) + m.get("externalMarks", 0) + m.get("practicalMarks", 0)
        mx = m.get("maxInternal", 30) + m.get("maxExternal", 70) + m.get("maxPractical", 25)
        if subj not in subject_scores:
            subject_scores[subj] = {"totals": [], "maxes": []}
        subject_scores[subj]["totals"].append(total)
        subject_scores[subj]["maxes"].append(mx)

    for subj, data in subject_scores.items():
        total = sum(data["totals"])
        mx = sum(data["maxes"])
        pct = (total / mx * 100) if mx > 0 else 0
        if pct < 35:
            patterns.append({"type": "critical_weakness", "subject": subj, "percentage": round(pct, 1),
                "message": f"🚨 {subj} is critically low at {round(pct,1)}% — backlog risk is very high",
                "risk": "high", "recommendation": f"Immediately focus on {subj}. Consider extra coaching."})
        elif pct < 50:
            patterns.append({"type": "weak_subject", "subject": subj, "percentage": round(pct, 1),
                "message": f"⚠️ {subj} at {round(pct,1)}% — needs attention before externals",
                "risk": "moderate", "recommendation": f"Dedicate 1 hour daily to {subj} revision."})

    # 2. Internal vs External gap
    for m in marks:
        subj = m.get("subject", "")
        int_pct = (m.get("internalMarks", 0) / m.get("maxInternal", 30) * 100) if m.get("maxInternal", 30) > 0 else 0
        ext_pct = (m.get("externalMarks", 0) / m.get("maxExternal", 70) * 100) if m.get("maxExternal", 70) > 0 else 0
        if int_pct > 0 and ext_pct > 0 and abs(int_pct - ext_pct) > 25:
            if ext_pct < int_pct:
                patterns.append({"type": "internal_external_gap", "subject": subj,
                    "message": f"📊 {subj}: Good internals ({round(int_pct)}%) but weak externals ({round(ext_pct)}%)",
                    "risk": "moderate", "recommendation": "Practice previous year papers for exam preparation."})

    # 3. Attendance pattern
    if attendance:
        subj_att = {}
        for a in attendance:
            subj = a.get("subject", "")
            if subj not in subj_att:
                subj_att[subj] = {"total": 0, "present": 0}
            subj_att[subj]["total"] += 1
            if a.get("status") in ["present", "late"]:
                subj_att[subj]["present"] += 1

        for subj, data in subj_att.items():
            pct = (data["present"] / data["total"] * 100) if data["total"] > 0 else 100
            if pct < 65:
                patterns.append({"type": "low_attendance", "subject": subj, "percentage": round(pct, 1),
                    "message": f"❌ {subj} attendance at {round(pct,1)}% — detention risk!",
                    "risk": "high", "recommendation": "Attend all remaining classes without fail."})
            elif pct < 75:
                patterns.append({"type": "attendance_warning", "subject": subj, "percentage": round(pct, 1),
                    "message": f"⚠️ {subj} attendance at {round(pct,1)}% — borderline",
                    "risk": "moderate", "recommendation": "Don't miss any more classes this month."})

    # 4. Semester-over-semester decline
    sem_avgs = {}
    for m in marks:
        sem = m.get("semester", 1)
        total = m.get("internalMarks", 0) + m.get("externalMarks", 0) + m.get("practicalMarks", 0)
        mx = m.get("maxInternal", 30) + m.get("maxExternal", 70) + m.get("maxPractical", 25)
        if sem not in sem_avgs:
            sem_avgs[sem] = {"total": 0, "max": 0}
        sem_avgs[sem]["total"] += total
        sem_avgs[sem]["max"] += mx

    sorted_sems = sorted(sem_avgs.keys())
    for i in range(1, len(sorted_sems)):
        prev = sem_avgs[sorted_sems[i-1]]
        curr = sem_avgs[sorted_sems[i]]
        prev_pct = (prev["total"] / prev["max"] * 100) if prev["max"] > 0 else 0
        curr_pct = (curr["total"] / curr["max"] * 100) if curr["max"] > 0 else 0
        if prev_pct - curr_pct > 15:
            patterns.append({"type": "semester_decline", "message": f"📉 Performance dropped {round(prev_pct-curr_pct)}% from Sem {sorted_sems[i-1]} to Sem {sorted_sems[i]}",
                "risk": "high", "recommendation": "Analyze what changed — workload, motivation, or difficulty level."})

    return patterns

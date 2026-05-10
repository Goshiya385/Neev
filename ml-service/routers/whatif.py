from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class WhatIfRequest(BaseModel):
    currentCGPA: float = 0
    currentSemester: int = 1
    scenario: str = "improve_marks"
    params: dict = {}

@router.post("/simulate")
def simulate(req: WhatIfRequest):
    results = {}
    cgpa = req.currentCGPA
    sem = req.currentSemester

    if req.scenario == "improve_marks":
        improvement = req.params.get("improvement_percent", 10)
        new_sgpa = min(cgpa + (improvement / 10) * 0.8, 10)
        new_cgpa = round((cgpa * sem + new_sgpa) / (sem + 1), 2)
        results = {
            "scenario": "Improve marks by " + str(improvement) + "%",
            "currentCGPA": cgpa,
            "projectedCGPA": new_cgpa,
            "projectedSGPA": round(new_sgpa, 2),
            "impact": "positive",
            "message": f"If you improve by {improvement}%, your CGPA could reach {new_cgpa}"
        }

    elif req.scenario == "drop_subject":
        subject = req.params.get("subject", "Unknown")
        drop_impact = 0.3
        new_cgpa = round(max(cgpa - drop_impact, 0), 2)
        results = {
            "scenario": f"Drop/Fail {subject}",
            "currentCGPA": cgpa,
            "projectedCGPA": new_cgpa,
            "backlogAdded": True,
            "impact": "negative",
            "message": f"Failing {subject} would drop CGPA to ~{new_cgpa} and add 1 backlog"
        }

    elif req.scenario == "change_goal":
        new_goal = req.params.get("new_goal", "Full Stack")
        goal_requirements = {
            "Full Stack": {"minCGPA": 6.5, "keySkills": ["React", "Node.js", "MongoDB", "DSA"], "projectsNeeded": 3},
            "AI/ML": {"minCGPA": 7.0, "keySkills": ["Python", "ML", "Statistics", "Deep Learning"], "projectsNeeded": 2},
            "Data Science": {"minCGPA": 7.0, "keySkills": ["Python", "SQL", "Statistics", "Visualization"], "projectsNeeded": 2},
            "Cybersecurity": {"minCGPA": 6.0, "keySkills": ["Networking", "Linux", "Python", "Security Tools"], "projectsNeeded": 2},
        }
        reqs = goal_requirements.get(new_goal, {"minCGPA": 6.0, "keySkills": ["Programming"], "projectsNeeded": 2})
        gap = max(reqs["minCGPA"] - cgpa, 0)
        results = {
            "scenario": f"Switch goal to {new_goal}",
            "requirements": reqs,
            "cgpaGap": round(gap, 2),
            "feasible": gap < 2,
            "impact": "neutral",
            "message": f"{'Achievable!' if gap < 2 else 'Challenging but possible.'} You need CGPA {reqs['minCGPA']}+ and skills in {', '.join(reqs['keySkills'][:3])}"
        }

    elif req.scenario == "skip_semester":
        new_cgpa = cgpa
        results = {
            "scenario": "Skip/Gap semester",
            "currentCGPA": cgpa,
            "projectedCGPA": cgpa,
            "impact": "warning",
            "message": "CGPA stays same but you lose 6 months. Consider if absolutely necessary."
        }

    else:
        target = req.params.get("target_cgpa", 8.0)
        needed_sgpa = round((target * (sem + 1) - cgpa * sem), 2)
        results = {
            "scenario": f"Reach CGPA {target}",
            "currentCGPA": cgpa,
            "targetCGPA": target,
            "neededSGPA": min(needed_sgpa, 10),
            "achievable": needed_sgpa <= 10,
            "impact": "info",
            "message": f"You need SGPA {min(needed_sgpa, 10)} next semester to reach {target} CGPA"
        }

    return results

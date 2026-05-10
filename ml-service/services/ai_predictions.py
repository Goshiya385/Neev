"""
AI-powered prediction endpoints: Skill Gap, Placement Readiness, Roadmap Generation, Weekly Plan.
"""


# ═══════════════ SKILL GAP ANALYSIS ═══════════════
def analyze_skill_gap(data: dict) -> dict:
    """Takes current skills + career goal → returns gap analysis + suggestions."""
    skills = data.get("skills", [])
    goal = data.get("careerGoal", "Full Stack")
    semester = data.get("semester", 4)

    goal_requirements = {
        "Full Stack": {
            "must_have": ["JavaScript", "React", "Node.js", "MongoDB", "Git", "DSA"],
            "good_to_have": ["TypeScript", "Next.js", "Docker", "PostgreSQL", "System Design", "AWS"],
            "min_proficiency": 60
        },
        "AI/ML": {
            "must_have": ["Python", "NumPy", "Pandas", "TensorFlow", "DSA", "SQL"],
            "good_to_have": ["PyTorch", "R", "Docker", "AWS", "System Design", "Flask"],
            "min_proficiency": 55
        },
        "Data Science": {
            "must_have": ["Python", "SQL", "Pandas", "NumPy", "Statistics", "Git"],
            "good_to_have": ["R", "TensorFlow", "Tableau", "AWS", "Docker", "Flask"],
            "min_proficiency": 55
        },
        "Cybersecurity": {
            "must_have": ["Python", "Linux", "CN", "OS Concepts", "Git", "SQL"],
            "good_to_have": ["Docker", "AWS", "C++", "Java", "System Design"],
            "min_proficiency": 50
        },
        "DevOps": {
            "must_have": ["Linux", "Docker", "Git", "AWS", "Python", "CI/CD"],
            "good_to_have": ["Kubernetes", "Terraform", "Node.js", "PostgreSQL", "System Design"],
            "min_proficiency": 55
        },
        "UI/UX": {
            "must_have": ["Figma", "JavaScript", "React", "CSS", "Git", "TypeScript"],
            "good_to_have": ["Next.js", "Framer Motion", "Tailwind", "Node.js"],
            "min_proficiency": 50
        }
    }

    reqs = goal_requirements.get(goal, goal_requirements["Full Stack"])
    skill_map = {s.get("name", s.get("skillName", "")).lower(): s for s in skills}

    missing = []
    weak = []
    strong = []
    next_to_learn = []

    for req_skill in reqs["must_have"]:
        found = skill_map.get(req_skill.lower())
        if not found:
            missing.append({"skill": req_skill, "priority": "critical", "reason": f"Required for {goal}"})
            next_to_learn.append(req_skill)
        elif (found.get("completionPercent") or found.get("progress", 0)) < reqs["min_proficiency"]:
            weak.append({"skill": req_skill, "current": found.get("completionPercent") or found.get("progress", 0),
                         "target": reqs["min_proficiency"], "gap": reqs["min_proficiency"] - (found.get("completionPercent") or found.get("progress", 0))})
        else:
            strong.append({"skill": req_skill, "level": found.get("completionPercent") or found.get("progress", 0)})

    for req_skill in reqs["good_to_have"]:
        found = skill_map.get(req_skill.lower())
        if not found:
            next_to_learn.append(req_skill)

    total_required = len(reqs["must_have"])
    covered = len(strong) + len(weak)
    readiness = round((len(strong) / max(total_required, 1)) * 100)

    months_estimate = max(1, len(missing) * 1.5 + len(weak) * 0.5)
    if semester <= 3:
        months_estimate = min(months_estimate, 12)

    return {
        "goal": goal,
        "readiness": readiness,
        "missing": missing[:5],
        "weak": sorted(weak, key=lambda x: x["gap"], reverse=True),
        "strong": strong,
        "nextToLearn": next_to_learn[:3],
        "monthsToReady": round(months_estimate),
        "message": f"You have {len(strong)}/{total_required} must-have skills for {goal}. "
                   f"{'Great progress!' if readiness >= 70 else 'Focus on missing skills!' if readiness < 40 else 'Almost there!'}",
        "weeklyPlan": [
            f"Learn {next_to_learn[0]} — start with basics (Week 1-2)" if next_to_learn else "Polish your strongest skill",
            f"Improve {weak[0]['skill']} from {weak[0]['current']}% to {weak[0]['target']}%" if weak else "Take on an advanced project",
            "Practice DSA daily — 2 problems minimum"
        ]
    }


# ═══════════════ PLACEMENT READINESS ═══════════════
def predict_placement(data: dict) -> dict:
    """Takes all dimensions → returns company-wise readiness."""
    cgpa = data.get("cgpa", 0)
    dsa_solved = data.get("dsaSolved", 0)
    projects_count = data.get("projectsCount", 0)
    mock_score = data.get("mockScore", 0)
    communication = data.get("communication", 5)
    aptitude = data.get("aptitude", 5)
    skills_count = data.get("skillsCount", 0)
    semester = data.get("semester", 4)

    # Dimension scores (0-100)
    dsa_score = min(100, dsa_solved * 0.5) if dsa_solved > 0 else min(100, mock_score)
    project_score = min(100, projects_count * 30)
    comm_score = communication * 10
    apt_score = aptitude * 10
    academic_score = min(100, cgpa * 10)

    total = round(dsa_score * 0.3 + project_score * 0.2 + comm_score * 0.15 + apt_score * 0.15 + academic_score * 0.2)

    companies = {
        "TCS Digital": {"min_cgpa": 6.0, "dsa": 30, "apt": 50, "comm": 40, "difficulty": "Medium"},
        "Infosys SP": {"min_cgpa": 6.0, "dsa": 25, "apt": 45, "comm": 35, "difficulty": "Medium"},
        "Wipro Elite": {"min_cgpa": 6.0, "dsa": 20, "apt": 40, "comm": 30, "difficulty": "Easy"},
        "Amazon": {"min_cgpa": 7.0, "dsa": 70, "apt": 60, "comm": 50, "difficulty": "Hard"},
        "Google": {"min_cgpa": 7.5, "dsa": 80, "apt": 70, "comm": 60, "difficulty": "Very Hard"},
        "Microsoft": {"min_cgpa": 7.0, "dsa": 75, "apt": 65, "comm": 55, "difficulty": "Hard"},
        "Startups": {"min_cgpa": 5.5, "dsa": 40, "apt": 30, "comm": 50, "difficulty": "Medium"},
    }

    company_readiness = []
    for name, req in companies.items():
        eligible = cgpa >= req["min_cgpa"]
        dsa_ready = dsa_score >= req["dsa"]
        apt_ready = apt_score >= req["apt"]
        comm_ready = comm_score >= req["comm"]
        ready = eligible and dsa_ready and apt_ready and comm_ready

        gaps = []
        if not eligible: gaps.append(f"CGPA needs {req['min_cgpa']}+ (you: {cgpa})")
        if not dsa_ready: gaps.append(f"DSA needs {req['dsa']}% (you: {round(dsa_score)}%)")
        if not apt_ready: gaps.append(f"Aptitude needs {req['apt']}% (you: {round(apt_score)}%)")

        company_readiness.append({
            "company": name, "ready": ready, "difficulty": req["difficulty"],
            "matchPercent": min(100, round((int(eligible) * 25 + int(dsa_ready) * 30 + int(apt_ready) * 25 + int(comm_ready) * 20))),
            "gaps": gaps
        })

    company_readiness.sort(key=lambda x: x["matchPercent"], reverse=True)
    ready_count = len([c for c in company_readiness if c["ready"]])

    return {
        "totalScore": total,
        "dimensions": {
            "dsa": round(dsa_score), "projects": round(project_score),
            "communication": round(comm_score), "aptitude": round(apt_score),
            "academic": round(academic_score)
        },
        "companies": company_readiness,
        "readyFor": ready_count,
        "totalCompanies": len(companies),
        "monthsToReady": max(1, round((100 - total) / 15)),
        "topPriority": "DSA" if dsa_score < 50 else "Projects" if project_score < 40 else "Aptitude" if apt_score < 50 else "Communication",
        "message": f"Ready for {ready_count}/{len(companies)} companies. {'Excellent!' if ready_count >= 5 else 'Good progress!' if ready_count >= 3 else 'Keep working!'}"
    }


# ═══════════════ AI ROADMAP GENERATOR ═══════════════
def generate_roadmap(data: dict) -> dict:
    """Takes semester + goal + interests → returns AI-generated roadmap."""
    semester = data.get("semester", 4)
    goal = data.get("careerGoal", "Full Stack")
    interests = data.get("interests", [])
    hours_per_week = data.get("hoursPerWeek", 10)

    roadmaps = {
        "Full Stack": {
            "phases": [
                {"phase": "Foundation", "weeks": "1-4", "items": ["HTML/CSS Advanced", "JavaScript ES6+", "Git & GitHub", "Responsive Design"], "hours": 3},
                {"phase": "Frontend", "weeks": "5-10", "items": ["React.js Fundamentals", "State Management", "React Router", "API Integration"], "hours": 4},
                {"phase": "Backend", "weeks": "11-16", "items": ["Node.js & Express", "MongoDB/PostgreSQL", "REST API Design", "Authentication (JWT)"], "hours": 4},
                {"phase": "Advanced", "weeks": "17-22", "items": ["TypeScript", "Next.js", "Docker", "Deployment (Vercel/AWS)"], "hours": 3},
                {"phase": "Projects", "weeks": "23-26", "items": ["Full Stack Project", "Portfolio Website", "Open Source Contribution"], "hours": 5},
            ]
        },
        "AI/ML": {
            "phases": [
                {"phase": "Math Foundation", "weeks": "1-4", "items": ["Linear Algebra", "Statistics & Probability", "Calculus", "Python for ML"], "hours": 4},
                {"phase": "Core ML", "weeks": "5-10", "items": ["Supervised Learning", "Unsupervised Learning", "Scikit-learn", "Feature Engineering"], "hours": 4},
                {"phase": "Deep Learning", "weeks": "11-16", "items": ["Neural Networks", "CNNs", "RNNs/LSTMs", "TensorFlow/PyTorch"], "hours": 5},
                {"phase": "NLP & Advanced", "weeks": "17-22", "items": ["NLP Basics", "Transformers", "LLMs", "RAG Systems"], "hours": 4},
                {"phase": "Projects", "weeks": "23-26", "items": ["ML Project (Kaggle)", "Research Paper Implementation", "Portfolio"], "hours": 5},
            ]
        },
        "Data Science": {
            "phases": [
                {"phase": "Foundation", "weeks": "1-4", "items": ["Python for Data Science", "Statistics", "SQL Mastery", "Excel/Sheets"], "hours": 3},
                {"phase": "Analysis", "weeks": "5-10", "items": ["Pandas & NumPy", "Data Cleaning", "EDA Techniques", "Matplotlib/Seaborn"], "hours": 4},
                {"phase": "ML Basics", "weeks": "11-16", "items": ["Regression", "Classification", "Clustering", "Model Evaluation"], "hours": 4},
                {"phase": "Tools", "weeks": "17-22", "items": ["Tableau/PowerBI", "BigQuery", "A/B Testing", "Time Series"], "hours": 3},
                {"phase": "Projects", "weeks": "23-26", "items": ["Dashboard Project", "Kaggle Competition", "Portfolio"], "hours": 5},
            ]
        }
    }

    rm = roadmaps.get(goal, roadmaps["Full Stack"])

    # Adjust based on semester
    if semester <= 2:
        rm["phases"].insert(0, {"phase": "Pre-requisite", "weeks": "0", "items": ["Master C/C++", "Basic DSA", "Problem Solving"], "hours": 3})
    if semester >= 5:
        rm["phases"] = rm["phases"][1:]  # Skip foundation for later semesters

    # Add DSA track (always needed)
    dsa_track = [
        {"week": "Every Week", "task": "2-3 DSA problems daily", "platform": "LeetCode/GeeksforGeeks"},
    ]

    # Resources based on goal
    resources = {
        "Full Stack": [
            {"name": "freeCodeCamp", "type": "free", "url": "freecodecamp.org"},
            {"name": "The Odin Project", "type": "free", "url": "theodinproject.com"},
            {"name": "Traversy Media (YouTube)", "type": "free", "url": "youtube.com/@TraversyMedia"},
        ],
        "AI/ML": [
            {"name": "Andrew Ng's ML Course", "type": "free", "url": "coursera.org"},
            {"name": "Fast.ai", "type": "free", "url": "fast.ai"},
            {"name": "3Blue1Brown (YouTube)", "type": "free", "url": "youtube.com/@3blue1brown"},
        ],
        "Data Science": [
            {"name": "Kaggle Learn", "type": "free", "url": "kaggle.com/learn"},
            {"name": "DataCamp", "type": "freemium", "url": "datacamp.com"},
            {"name": "StatQuest (YouTube)", "type": "free", "url": "youtube.com/@statquest"},
        ]
    }

    total_weeks = sum(int(p["weeks"].split("-")[-1]) if "-" in p["weeks"] else 4 for p in rm["phases"])

    return {
        "goal": goal,
        "semester": semester,
        "totalWeeks": total_weeks,
        "hoursPerWeek": hours_per_week,
        "phases": rm["phases"],
        "dsaTrack": dsa_track,
        "resources": resources.get(goal, resources["Full Stack"]),
        "message": f"{'🚀' if semester <= 3 else '⚡'} {goal} roadmap for Sem {semester}. "
                   f"Complete in ~{total_weeks} weeks at {hours_per_week} hrs/week.",
        "weeklyBreakdown": generate_weekly_plan_from_roadmap(rm["phases"], hours_per_week)
    }


def generate_weekly_plan_from_roadmap(phases, hours):
    """Generate a sample weekly plan from roadmap phases."""
    if not phases:
        return []
    current_phase = phases[0]
    tasks = []
    for item in current_phase["items"][:4]:
        tasks.append({"task": item, "hours": round(hours / 4, 1), "priority": "high"})
    tasks.append({"task": "DSA Practice (2 problems)", "hours": 1, "priority": "critical"})
    return tasks


# ═══════════════ WEEKLY PLAN GENERATOR ═══════════════
def generate_weekly_plan(data: dict) -> dict:
    """Takes goals + time + weak areas → returns AI task list."""
    goals = data.get("goals", "")
    hours = data.get("hoursPerWeek", 10)
    career_goal = data.get("careerGoal", "Full Stack")
    weak_subjects = data.get("weakSubjects", [])
    current_skills = data.get("currentSkills", [])
    backlogs = data.get("backlogs", 0)

    tasks = []

    # Priority 1: Backlog recovery
    if backlogs > 0:
        tasks.append({"title": "📚 Backlog Subject Revision", "category": "Academics",
                       "hours": round(hours * 0.3, 1), "priority": "critical",
                       "description": "Focus on backlog subjects — solve previous year papers"})

    # Priority 2: Weak subjects
    for ws in weak_subjects[:2]:
        tasks.append({"title": f"📖 Revise {ws}", "category": "Academics",
                       "hours": round(hours * 0.15, 1), "priority": "high",
                       "description": f"Practice problems and notes for {ws}"})

    # Priority 3: DSA (always)
    tasks.append({"title": "🧮 DSA Practice", "category": "DSA",
                   "hours": max(2, round(hours * 0.2, 1)), "priority": "critical",
                   "description": "Solve 2-3 problems on LeetCode/GFG. Focus on Arrays & Strings."})

    # Priority 4: Goal-specific
    goal_tasks = {
        "Full Stack": {"title": "💻 Build/Improve Project", "desc": "Work on your full-stack project. Push to GitHub."},
        "AI/ML": {"title": "🤖 ML Practice", "desc": "Work through Kaggle notebook or implement an algorithm."},
        "Data Science": {"title": "📊 Data Analysis Practice", "desc": "Analyze a dataset on Kaggle. Create visualizations."},
    }
    gt = goal_tasks.get(career_goal, goal_tasks["Full Stack"])
    tasks.append({"title": gt["title"], "category": "Skills", "hours": round(hours * 0.2, 1),
                   "priority": "high", "description": gt["desc"]})

    # Priority 5: Aptitude & Communication
    tasks.append({"title": "🎯 Aptitude Practice", "category": "Placement",
                   "hours": 1, "priority": "medium",
                   "description": "20 quantitative + 10 logical reasoning questions"})
    tasks.append({"title": "🗣️ English/Communication", "category": "Placement",
                   "hours": 0.5, "priority": "medium",
                   "description": "Read 1 article + practice speaking for 10 mins"})

    total_hours = sum(t["hours"] for t in tasks)

    return {
        "tasks": tasks,
        "totalHours": round(total_hours, 1),
        "availableHours": hours,
        "balance": round(hours - total_hours, 1),
        "message": f"{'Perfect fit!' if abs(hours - total_hours) < 2 else 'Adjusted to fit your schedule.'} "
                   f"{len(tasks)} tasks, {round(total_hours, 1)} hours planned."
    }

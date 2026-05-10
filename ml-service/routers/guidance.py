"""
AI Career & Life Guidance Router — Higher studies, career intelligence, 
motivation, academic weather, study strategies, weekly reflections.
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import os, json

router = APIRouter(prefix="/ml/guidance", tags=["AI Guidance"])

try:
    from groq import Groq
    HAS_GROQ = True
except ImportError:
    HAS_GROQ = False


class GuidanceRequest(BaseModel):
    data: Dict[str, Any] = {}


def _call_llm(prompt: str, max_tokens=600) -> str:
    if not HAS_GROQ or not os.getenv("GROQ_API_KEY"):
        return ""
    try:
        client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        r = client.chat.completions.create(model="llama-3.3-70b-versatile", messages=[{"role": "user", "content": prompt}], max_tokens=max_tokens, temperature=0.4)
        return r.choices[0].message.content.strip()
    except:
        return ""


# ═══════ CAREER PATH GUIDANCE (Higher Studies vs Job) ═══════
@router.post("/career-path")
def career_path_guidance(req: GuidanceRequest):
    d = req.data
    goal = d.get("goal", "undecided")  # "higher_studies", "job", "startup", "undecided"
    interests = d.get("interests", [])
    cgpa = d.get("cgpa", 6.5)
    semester = d.get("semester", 4)
    branch = d.get("branch", "CSE")
    budget = d.get("budget", "moderate")
    country_pref = d.get("countryPreference", "any")
    exam_prep = d.get("examPrep", [])

    prompt = f"""You are an expert career counselor for Indian engineering students. Give personalized career guidance.

Student: Sem {semester}, {branch}, CGPA {cgpa}
Career Goal: {goal}
Interests: {', '.join(interests) if interests else 'not specified'}
Budget: {budget}
Country Preference: {country_pref}
Exams preparing for: {', '.join(exam_prep) if exam_prep else 'none'}

Return ONLY a JSON object (no markdown):
{{
  "recommended_path": "Higher Studies/Job/Startup/Explore",
  "confidence": 0.0-1.0,
  "roadmap": [
    {{"phase": "Phase 1 (Now - 3 months)", "tasks": ["task1", "task2", "task3"]}},
    {{"phase": "Phase 2 (3-6 months)", "tasks": ["task1", "task2"]}},
    {{"phase": "Phase 3 (6-12 months)", "tasks": ["task1", "task2"]}}
  ],
  "exams_to_consider": ["GATE", "GRE", "CAT", etc],
  "colleges": ["IIT Delhi MS", "IIIT Hyderabad", etc],
  "skills_needed": ["skill1", "skill2"],
  "resources": [{{"name": "resource", "url": "https://...", "type": "free/paid"}}],
  "motivation": "1-2 line encouraging message in Hinglish",
  "alternative_paths": ["path1", "path2"]
}}"""

    raw = _call_llm(prompt, 800)
    try:
        return json.loads(raw.replace('```json','').replace('```','').strip())
    except:
        # Fallback
        paths = {
            "higher_studies": {
                "recommended_path": "Higher Studies", "confidence": 0.8,
                "roadmap": [
                    {"phase": "Now - 3 months", "tasks": ["GATE/GRE preparation start karo", "Research papers padho", "Professors ko email karo"]},
                    {"phase": "3-6 months", "tasks": ["Mock tests daily", "SOP/LOR prepare karo", "University shortlist banao"]},
                    {"phase": "6-12 months", "tasks": ["Applications submit karo", "Interview prep", "Funding/scholarship dhundho"]}
                ],
                "exams_to_consider": ["GATE", "GRE", "TOEFL/IELTS"],
                "colleges": ["IIT Delhi", "IIT Bombay", "IIIT Hyderabad", "CMU", "Stanford"],
                "skills_needed": ["Research aptitude", "Strong fundamentals", "Publications"],
                "resources": [{"name": "GATE Pyqs", "url": "https://gate.iitk.ac.in", "type": "free"}, {"name": "GRE Prep", "url": "https://magoosh.com", "type": "paid"}],
                "motivation": f"CGPA {cgpa} se bhi log IITs gaye hai. Consistency rakh, tu bhi jayega! 🎓",
                "alternative_paths": ["Research Assistant", "M.Tech with GATE", "MS abroad with GRE"]
            },
            "job": {
                "recommended_path": "Job/Placement", "confidence": 0.85,
                "roadmap": [
                    {"phase": "Now - 3 months", "tasks": ["DSA daily 2 problems", "1 project complete karo", "Resume ready karo"]},
                    {"phase": "3-6 months", "tasks": ["Mock interviews practice", "Company-specific prep", "Aptitude daily"]},
                    {"phase": "6-12 months", "tasks": ["Off-campus bhi apply karo", "LinkedIn active rakh", "Networking shuru karo"]}
                ],
                "exams_to_consider": ["TCS NQT", "Infosys InfyTQ", "Wipro NLTH", "AMCAT"],
                "skills_needed": ["DSA", "System Design basics", "Communication", "Aptitude"],
                "resources": [{"name": "Striver SDE Sheet", "url": "https://takeuforward.org", "type": "free"}, {"name": "PrepInsta", "url": "https://prepinsta.com", "type": "free"}],
                "motivation": f"Bhai placement season tough hai but tera {branch} background strong hai. Grind karo! 💪",
                "alternative_paths": ["Freelancing", "Startup internship", "Open source contributions"]
            }
        }
        return paths.get(goal, paths["job"])


# ═══════ ANTI-DEPRESSION / SAFE SPACE ═══════
@router.post("/safe-space")
def safe_space(req: GuidanceRequest):
    d = req.data
    mood = d.get("mood", "neutral")  # "stressed", "anxious", "overwhelmed", "sad", "confused", "neutral"
    concern = d.get("concern", "")
    name = d.get("name", "there")
    cgpa = d.get("cgpa", 0)
    backlogs = d.get("backlogs", 0)
    streak = d.get("streak", 0)

    prompt = f"""You are a supportive mental health-aware AI mentor for an Indian engineering student. 
Student: {name}, CGPA {cgpa}, Backlogs {backlogs}, Streak {streak} days
Current mood: {mood}
Their concern: "{concern}"

Respond with ONLY a JSON object:
{{
  "message": "2-3 warm, empathetic sentences in Hinglish. Be like a caring senior. No toxic positivity.",
  "affirmation": "One powerful affirmation specific to them",
  "breathing_exercise": "A quick calming technique (30 seconds)",
  "perspective": "Reframe their situation positively but honestly",
  "small_win": "One tiny achievable task they can do RIGHT NOW to feel better",
  "reminder": "A gentle reminder that their worth isn't their CGPA",
  "resources": ["helpline or resource if needed"]
}}"""

    raw = _call_llm(prompt, 500)
    try:
        return json.loads(raw.replace('```json','').replace('```','').strip())
    except:
        responses = {
            "stressed": {"message": f"Hey {name}, stress matlab tu care karta hai. But zyadaa stress = less productivity. Breathe. 🌿", "affirmation": "Main capable hoon. Ek time pe ek kaam.", "breathing_exercise": "4-7-8: 4 sec inhale, 7 sec hold, 8 sec exhale. 3 baar repeat karo.", "perspective": f"CGPA {cgpa} temporary hai. Skills permanent hai. Aaj ka effort kal ka result hai.", "small_win": "Abhi 5 minute apna favourite song suno. Phir ek page padho.", "reminder": "Tere marks tera worth define nahi karte. Tu ek exam se zyada hai. 💛", "resources": ["iCall: 9152987821", "Vandrevala Foundation: 1860-2662-345"]},
            "anxious": {"message": f"Hey {name}, anxiety future ke baare me sochne se aati hai. Abhi is moment pe focus karo. 🌸", "affirmation": "Jo hoga accha hoga. Main prepared hoon.", "breathing_exercise": "Box breathing: 4 sec in, 4 hold, 4 out, 4 hold. Repeat 5x.", "perspective": "Lakhs of students same feel karte hai. Tu akela nahi hai.", "small_win": "Apne phone pe 10 min timer lagao. Ek topic revise karo. Bas.", "reminder": "Placement nahi mili toh? Life doesn't end. Options infinite hai. 🌈", "resources": ["iCall: 9152987821"]},
        }
        default = {"message": f"Hey {name}, tu yahan hai matlab tu try kar raha hai. That counts. 🌱", "affirmation": "Har chhota step progress hai.", "breathing_exercise": "Deep breath lo. 5 baar. Feel the calm.", "perspective": "Engineering tough hai, but so are you.", "small_win": "Aaj ek cheez complete karo jo pending hai. Ek hi.", "reminder": "Rest is productive. Burnout se bachna bhi skill hai. 💚", "resources": ["iCall: 9152987821"]}
        return responses.get(mood, default)


# ═══════ ACADEMIC WEATHER FORECAST ═══════
@router.post("/academic-weather")
def academic_weather(req: GuidanceRequest):
    d = req.data
    cgpa = d.get("cgpa", 6.5)
    attendance = d.get("attendance", 75)
    streak = d.get("streak", 0)
    backlogs = d.get("backlogs", 0)
    mood = d.get("mood", "neutral")
    tasks_done = d.get("tasksDone", 0)
    tasks_total = d.get("tasksTotal", 5)
    mid_sem_avg = d.get("midSemAvg", 50)

    # Calculate zones
    stress_score = 0
    if cgpa < 5.5: stress_score += 3
    elif cgpa < 6.5: stress_score += 1
    if attendance < 65: stress_score += 3
    elif attendance < 75: stress_score += 1
    if backlogs > 2: stress_score += 3
    elif backlogs > 0: stress_score += 1
    if streak == 0: stress_score += 1
    if mood in ["stressed", "anxious", "overwhelmed"]: stress_score += 2
    if tasks_total > 0 and tasks_done / tasks_total < 0.3: stress_score += 1

    productivity = min(100, streak * 5 + tasks_done * 10 + (1 if attendance > 80 else 0) * 20)

    if stress_score >= 6:
        zone = "storm"
        weather = {"icon": "⛈️", "name": "Storm Zone", "color": "#F87171", "description": "Burnout risk high. Multiple stress factors detected.", "advice": "Step back. Rest. Then tackle ONE thing at a time.", "temperature": f"{min(45, 25 + stress_score * 3)}°C — Overheating"}
    elif stress_score >= 4:
        zone = "heat"
        weather = {"icon": "🌡️", "name": "Heat Zone", "color": "#F5A623", "description": "Academic overload detected. Things are heating up.", "advice": "Prioritize. Drop low-impact tasks. Focus on what matters.", "temperature": f"{30 + stress_score}°C — Getting warm"}
    elif stress_score >= 2:
        zone = "fog"
        weather = {"icon": "🌫️", "name": "Fog Zone", "color": "#94A3B8", "description": "Lack of clarity. Direction unclear but manageable.", "advice": "Set 3 clear goals for this week. Clarity will come.", "temperature": f"18°C — Cool but unclear"}
    elif streak >= 5 and productivity > 50:
        zone = "sunny"
        weather = {"icon": "☀️", "name": "Sunny Streak", "color": "#4ADE80", "description": "High productivity! You're in the zone.", "advice": "Ride the wave! Push for big goals this week.", "temperature": f"25°C — Perfect conditions"}
    else:
        zone = "cloudy"
        weather = {"icon": "⛅", "name": "Partly Cloudy", "color": "#60A5FA", "description": "Steady state. Room for improvement.", "advice": "Build momentum. Small consistent efforts compound.", "temperature": f"22°C — Comfortable"}

    return {
        "zone": zone, "weather": weather,
        "metrics": {"stress_score": stress_score, "productivity": productivity, "streak": streak, "attendance": attendance},
        "forecast": f"Your academic climate this week: {weather['description']}",
        "weekly_outlook": "improving" if streak > 3 else "needs_attention" if stress_score > 4 else "stable"
    }


# ═══════ PLACEMENT SURVIVAL PROBABILITY ═══════
@router.post("/placement-survival")
def placement_survival(req: GuidanceRequest):
    d = req.data
    cgpa = d.get("cgpa", 6.5)
    dsa_solved = d.get("dsaSolved", 0)
    projects = d.get("projectsCount", 0)
    internships = d.get("internships", 0)
    mock_interviews = d.get("mockInterviews", 0)
    aptitude_score = d.get("aptitudeScore", 0)
    communication = d.get("communicationRating", 5)  # 1-10
    github_active = d.get("githubActive", False)
    linkedin_complete = d.get("linkedinComplete", False)
    certifications = d.get("certifications", 0)

    # Calculate survival score
    score = 0
    max_score = 100
    dangers = []
    strengths = []

    # CGPA (15 points)
    cgpa_pts = min(15, cgpa * 1.5)
    score += cgpa_pts
    if cgpa < 6.0: dangers.append({"zone": "CGPA", "severity": "high", "message": f"CGPA {cgpa} — many companies have 6.0 cutoff"})
    elif cgpa >= 8.0: strengths.append(f"Strong CGPA {cgpa} — opens all doors")

    # DSA (25 points)
    dsa_pts = min(25, dsa_solved * 0.1)
    score += dsa_pts
    if dsa_solved < 50: dangers.append({"zone": "DSA", "severity": "critical", "message": f"Only {dsa_solved} problems solved. Need 150+ for confidence"})
    elif dsa_solved >= 200: strengths.append(f"{dsa_solved} DSA problems — strong foundation")

    # Projects (15 points)
    proj_pts = min(15, projects * 5)
    score += proj_pts
    if projects < 2: dangers.append({"zone": "Projects", "severity": "high", "message": "Less than 2 projects. Build at least 2-3 solid ones"})

    # Communication (15 points)
    comm_pts = communication * 1.5
    score += comm_pts
    if communication < 5: dangers.append({"zone": "Communication", "severity": "high", "message": "Communication needs work. Practice daily"})

    # Aptitude (10 points)
    apt_pts = min(10, aptitude_score / 10)
    score += apt_pts
    if aptitude_score < 40: dangers.append({"zone": "Aptitude", "severity": "medium", "message": "Aptitude speed low. Practice quant + logical daily"})

    # Extras (20 points)
    if internships > 0: score += 5; strengths.append(f"{internships} internship(s) — real experience")
    if mock_interviews >= 3: score += 5; strengths.append("Mock interview practice — confidence boost")
    if github_active: score += 4; strengths.append("Active GitHub — shows consistency")
    if linkedin_complete: score += 3; strengths.append("LinkedIn complete — professional presence")
    if certifications > 0: score += 3; strengths.append(f"{certifications} certifications — bonus points")

    survival = min(100, round(score))
    level = "SAFE" if survival >= 75 else "MODERATE" if survival >= 50 else "DANGER" if survival >= 30 else "CRITICAL"

    return {
        "survival_probability": survival,
        "level": level,
        "danger_zones": sorted(dangers, key=lambda x: {"critical": 0, "high": 1, "medium": 2}.get(x["severity"], 3)),
        "strengths": strengths,
        "breakdown": {
            "cgpa": round(cgpa_pts), "dsa": round(dsa_pts), "projects": round(proj_pts),
            "communication": round(comm_pts), "aptitude": round(apt_pts), "extras": round(score - cgpa_pts - dsa_pts - proj_pts - comm_pts - apt_pts)
        },
        "message": f"Placement Survival: {survival}% — {'Tu ready hai! 🎯' if survival >= 70 else 'Grind mode ON karo! 💪' if survival >= 40 else 'Emergency prep shuru karo! 🚨'}",
        "resources": [
            {"name": "Striver SDE Sheet", "url": "https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2", "type": "DSA"},
            {"name": "PrepInsta", "url": "https://prepinsta.com", "type": "Aptitude"},
            {"name": "LeetCode", "url": "https://leetcode.com", "type": "DSA"},
            {"name": "Naukri", "url": "https://naukri.com", "type": "Jobs"},
            {"name": "Love Babbar DSA", "url": "https://youtube.com/@LoveBabbar", "type": "YouTube"},
            {"name": "Apna College", "url": "https://youtube.com/@ApnaCollegeOfficial", "type": "YouTube"},
            {"name": "CodeWithHarry", "url": "https://youtube.com/@CodeWithHarry", "type": "YouTube"},
        ]
    }


# ═══════ AI STUDY STRATEGY ═══════
@router.post("/study-strategy")
def study_strategy(req: GuidanceRequest):
    d = req.data
    prompt = f"""Generate a personalized study strategy for this engineering student:
Semester: {d.get('semester', 4)}, Branch: {d.get('branch', 'CSE')}, CGPA: {d.get('cgpa', 6.5)}
Weak subjects: {d.get('weakSubjects', 'not specified')}
Study style: {d.get('studyStyle', 'not specified')} (visual/reading/practice)
Available hours/day: {d.get('hoursPerDay', 4)}
Exam in: {d.get('examInDays', 30)} days

Return ONLY JSON:
{{"strategy_name": "...", "daily_schedule": [{{"time": "6-8 AM", "task": "...", "subject": "..."}}], "weekly_goals": ["goal1","goal2"], "revision_cycle": "...", "tips": ["tip1","tip2"], "motivation": "Hinglish motivational line"}}"""

    raw = _call_llm(prompt, 500)
    try:
        return json.loads(raw.replace('```json','').replace('```','').strip())
    except:
        hours = d.get("hoursPerDay", 4)
        return {
            "strategy_name": "Focused Sprint Method",
            "daily_schedule": [
                {"time": "Morning (1hr)", "task": "Weak subject revision", "subject": d.get("weakSubjects", "Theory")},
                {"time": "Afternoon (1.5hr)", "task": "Problem solving + practice", "subject": "DSA/Core"},
                {"time": "Evening (1hr)", "task": "New concepts + notes", "subject": "Current topics"},
                {"time": "Night (30min)", "task": "Quick revision + flashcards", "subject": "All"}
            ],
            "weekly_goals": ["Complete 1 chapter weak subject", "Solve 10 practice problems", "Revise 3 old topics", "1 mock test"],
            "revision_cycle": "Day 1 → Learn, Day 3 → Revise, Day 7 → Test, Day 14 → Final review",
            "tips": ["Pomodoro use karo: 25 min study, 5 min break", "Phone door se leke padho", "Teach someone what you learned"],
            "motivation": "Consistency > intensity. Daily 4 ghante > weekly 20 ghante. Tu kar sakta hai! 🔥"
        }


# ═══════ WEEKLY AI REFLECTION ═══════
@router.post("/weekly-reflection")
def weekly_reflection(req: GuidanceRequest):
    d = req.data
    prompt = f"""Generate a weekly AI reflection for this student:
Name: {d.get('name', 'Student')}, CGPA: {d.get('cgpa', 6.5)}, Streak: {d.get('streak', 0)}
Tasks completed: {d.get('tasksDone', 0)}/{d.get('tasksTotal', 5)}
Attendance this week: {d.get('weekAttendance', 75)}%
Subjects studied: {d.get('subjectsStudied', 'not tracked')}
Mood trend: {d.get('moodTrend', 'stable')}

Return ONLY JSON:
{{"wins": ["win1","win2"], "weak_points": ["point1"], "next_week_focus": ["focus1","focus2"], "quote": "motivational quote", "grade": "A/B/C/D", "emoji_summary": "3 emojis summarizing the week"}}"""

    raw = _call_llm(prompt, 300)
    try:
        return json.loads(raw.replace('```json','').replace('```','').strip())
    except:
        streak = d.get("streak", 0)
        tasks = d.get("tasksDone", 0)
        return {
            "wins": [f"{streak}-day streak maintained" if streak > 0 else "New week, fresh start", f"{tasks} tasks completed"],
            "weak_points": ["Need more consistency" if streak < 3 else "Push harder on weak subjects"],
            "next_week_focus": ["Increase study hours by 30 min", "Attempt 1 mock test", "Revise 2 weak topics"],
            "quote": "The secret of getting ahead is getting started. — Mark Twain",
            "grade": "A" if tasks >= 4 and streak >= 5 else "B" if tasks >= 2 else "C",
            "emoji_summary": "🔥📚💪" if streak > 3 else "😤📖🌱"
        }

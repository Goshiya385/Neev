"""
Trending Skills + Resources — AI-powered tech trend analysis with YouTube, docs, and course links.
"""
import os
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
from groq import Groq
import json
import re

router = APIRouter(prefix="/ml/trends", tags=["Trends"])

# Curated resources database
SKILL_RESOURCES = {
    "React": {
        "youtube": ["https://youtube.com/@TraversyMedia", "https://youtube.com/@TheNetNinja", "https://youtube.com/@WebDevSimplified"],
        "docs": "https://react.dev",
        "course": "https://react.dev/learn",
        "trending": True, "demand": "Very High",
        "scope": "Frontend king — used by Meta, Netflix, Airbnb. 40% of all web apps."
    },
    "Next.js": {
        "youtube": ["https://youtube.com/@TheNetNinja", "https://youtube.com/@TraversyMedia"],
        "docs": "https://nextjs.org/docs",
        "course": "https://nextjs.org/learn",
        "trending": True, "demand": "High",
        "scope": "Full-stack React framework — SSR, API routes, deployment on Vercel."
    },
    "Python": {
        "youtube": ["https://youtube.com/@coraboread", "https://youtube.com/@freaboredcamp", "https://youtube.com/@TechWithTim"],
        "docs": "https://docs.python.org/3/",
        "course": "https://www.learnpython.org",
        "trending": True, "demand": "Very High",
        "scope": "AI/ML, Data Science, Automation, Backend — most versatile language in 2024-25."
    },
    "JavaScript": {
        "youtube": ["https://youtube.com/@TraversyMedia", "https://youtube.com/@TheNetNinja"],
        "docs": "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
        "course": "https://javascript.info",
        "trending": True, "demand": "Very High",
        "scope": "Runs the entire web — frontend + backend (Node.js). Universal language."
    },
    "TypeScript": {
        "youtube": ["https://youtube.com/@TheNetNinja", "https://youtube.com/@BenAwad"],
        "docs": "https://www.typescriptlang.org/docs/",
        "course": "https://www.totaltypescript.com",
        "trending": True, "demand": "High",
        "scope": "JavaScript with types — all serious projects use it. FAANG standard."
    },
    "Node.js": {
        "youtube": ["https://youtube.com/@TraversyMedia", "https://youtube.com/@TheNetNinja"],
        "docs": "https://nodejs.org/docs",
        "course": "https://nodejs.dev/learn",
        "trending": True, "demand": "High",
        "scope": "Server-side JS — powers backends at Netflix, LinkedIn, PayPal."
    },
    "MongoDB": {
        "youtube": ["https://youtube.com/@TheNetNinja", "https://youtube.com/@TraversyMedia"],
        "docs": "https://www.mongodb.com/docs/",
        "course": "https://university.mongodb.com",
        "trending": True, "demand": "High",
        "scope": "NoSQL database — flexible schema, great for startups and rapid prototyping."
    },
    "DSA": {
        "youtube": ["https://youtube.com/@takeUforward", "https://youtube.com/@NeetCode", "https://youtube.com/@AbdulBari"],
        "docs": "https://www.geeksforgeeks.org/data-structures/",
        "course": "https://neetcode.io/roadmap",
        "trending": True, "demand": "Critical",
        "scope": "Gate to FAANG — 90% of tech interviews test DSA. Non-negotiable skill."
    },
    "Machine Learning": {
        "youtube": ["https://youtube.com/@3blue1brown", "https://youtube.com/@sentdex", "https://youtube.com/@StatQuest"],
        "docs": "https://scikit-learn.org/stable/documentation.html",
        "course": "https://www.coursera.org/learn/machine-learning",
        "trending": True, "demand": "Very High",
        "scope": "AI revolution — every company needs ML engineers. Median salary 20L+ in India."
    },
    "Docker": {
        "youtube": ["https://youtube.com/@TechWorldwithNana", "https://youtube.com/@TraversyMedia"],
        "docs": "https://docs.docker.com",
        "course": "https://www.docker.com/get-started/",
        "trending": True, "demand": "High",
        "scope": "Containerization — DevOps essential. Required for cloud deployments."
    },
    "Git": {
        "youtube": ["https://youtube.com/@TraversyMedia", "https://youtube.com/@TheNetNinja"],
        "docs": "https://git-scm.com/doc",
        "course": "https://learngitbranching.js.org",
        "trending": False, "demand": "Essential",
        "scope": "Version control — literally cannot work in a team without it."
    },
    "AWS": {
        "youtube": ["https://youtube.com/@TechWorldwithNana", "https://youtube.com/@freaboredcamp"],
        "docs": "https://docs.aws.amazon.com",
        "course": "https://aws.amazon.com/training/",
        "trending": True, "demand": "Very High",
        "scope": "Cloud market leader (32%) — AWS certified engineers earn 30%+ more."
    },
    "SQL": {
        "youtube": ["https://youtube.com/@freaboredcamp", "https://youtube.com/@BroCodez"],
        "docs": "https://www.w3schools.com/sql/",
        "course": "https://sqlbolt.com",
        "trending": False, "demand": "Essential",
        "scope": "Every application uses databases. SQL is a fundamental, non-negotiable skill."
    },
    "Java": {
        "youtube": ["https://youtube.com/@BroCodez", "https://youtube.com/@freaboredcamp"],
        "docs": "https://docs.oracle.com/en/java/",
        "course": "https://dev.java/learn/",
        "trending": False, "demand": "High",
        "scope": "Enterprise standard — Android, Spring Boot, backend at banks and large corps."
    },
    "C++": {
        "youtube": ["https://youtube.com/@TheCherno", "https://youtube.com/@freaboredcamp"],
        "docs": "https://cplusplus.com/doc/",
        "course": "https://www.learncpp.com",
        "trending": False, "demand": "High",
        "scope": "Systems programming, game dev, competitive programming. Performance-critical apps."
    },
}

CAREER_TRENDING = {
    "Full Stack": ["React", "Next.js", "Node.js", "TypeScript", "MongoDB", "Docker", "Git", "DSA"],
    "Web Development": ["React", "Next.js", "JavaScript", "Node.js", "MongoDB", "Git"],
    "AI/ML": ["Python", "Machine Learning", "Docker", "SQL", "Git", "AWS"],
    "Data Science": ["Python", "SQL", "Machine Learning", "Docker", "AWS"],
    "Cybersecurity": ["Python", "Docker", "AWS", "Git", "SQL"],
    "UI/UX": ["JavaScript", "React", "TypeScript", "Git"],
    "Not Decided": ["Python", "JavaScript", "DSA", "Git", "SQL", "React"],
}


class TrendRequest(BaseModel):
    career_goal: str = "Full Stack"
    current_skills: List[str] = []
    semester: int = 4


@router.post("/skills")
def get_trending_skills(req: TrendRequest):
    """Get trending skills for a career goal with resources."""
    goal = req.career_goal
    trending_for_goal = CAREER_TRENDING.get(goal, CAREER_TRENDING["Not Decided"])

    results = []
    for skill_name in trending_for_goal:
        info = SKILL_RESOURCES.get(skill_name, {})
        is_known = skill_name.lower() in [s.lower() for s in req.current_skills]
        results.append({
            "name": skill_name,
            "trending": info.get("trending", False),
            "demand": info.get("demand", "Medium"),
            "scope": info.get("scope", ""),
            "youtube": info.get("youtube", []),
            "docs": info.get("docs", ""),
            "course": info.get("course", ""),
            "already_known": is_known,
            "priority": "✅ Keep Building" if is_known else "🚀 Start Learning"
        })

    # Sort: trending first, then unknown skills first
    results.sort(key=lambda x: (not x["trending"], x["already_known"]))

    return {
        "career_goal": goal,
        "trending_skills": results,
        "total": len(results),
        "known": sum(1 for r in results if r["already_known"]),
        "to_learn": sum(1 for r in results if not r["already_known"]),
    }


@router.get("/resources/{skill_name}")
def get_skill_resources(skill_name: str):
    """Get detailed resources for a specific skill."""
    # Case-insensitive lookup
    for key, info in SKILL_RESOURCES.items():
        if key.lower() == skill_name.lower():
            return {"skill": key, **info}
    return {"skill": skill_name, "youtube": [], "docs": "", "course": "", "trending": False, "demand": "Unknown", "scope": "No data available."}


@router.post("/ai-recommend")
def ai_recommend_resources(req: TrendRequest):
    """AI-powered personalized resource recommendations."""
    try:
        client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        prompt = f"""You are a tech career advisor for Indian engineering students.

Student Profile:
- Career Goal: {req.career_goal}
- Semester: {req.semester}
- Current Skills: {', '.join(req.current_skills) if req.current_skills else 'None specified'}

Recommend the TOP 5 skills they should focus on RIGHT NOW. For each skill, give:
1. Why it matters for their goal
2. One free YouTube channel
3. One free course/resource link
4. Expected time to learn (in weeks)

Respond in STRICT JSON array format:
[{{"skill": "...", "why": "...", "youtube": "...", "course": "...", "weeks": 4}}]
Keep it practical and Hinglish-friendly. No fluff."""

        r = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=600, temperature=0.3
        )
        raw = r.choices[0].message.content.strip()
        json_match = re.search(r'\[[\s\S]*\]', raw)
        if json_match:
            recommendations = json.loads(json_match.group())
        else:
            recommendations = json.loads(raw)
        return {"recommendations": recommendations, "ai_powered": True}
    except Exception as e:
        return {
            "recommendations": [
                {"skill": "DSA", "why": "Gate to placements", "youtube": "https://youtube.com/@takeUforward", "course": "https://neetcode.io", "weeks": 12},
                {"skill": "Python", "why": "Most versatile language", "youtube": "https://youtube.com/@freaboredcamp", "course": "https://learnpython.org", "weeks": 4},
            ],
            "ai_powered": False
        }

"""
AI Insight Generator — Uses Groq LLM + ML model outputs to generate
personalized, actionable insights for each student.
"""
import os
import json

try:
    from groq import Groq
    HAS_GROQ = True
except ImportError:
    HAS_GROQ = False


def generate_ai_insights(student_data: dict, ml_predictions: dict = {}) -> dict:
    """
    Generate AI-powered insights by combining student data with ML predictions.
    Returns structured insights with categories, severity, and recommendations.
    """
    if not HAS_GROQ or not os.getenv("GROQ_API_KEY"):
        return _fallback_insights(student_data, ml_predictions)

    client = Groq(api_key=os.getenv("GROQ_API_KEY"))

    prompt = f"""You are an AI academic advisor analyzing a student's data. Generate exactly 5 personalized insights.

STUDENT DATA:
{json.dumps(student_data, indent=2, default=str)[:1500]}

ML PREDICTIONS:
{json.dumps(ml_predictions, indent=2, default=str)[:800]}

Return ONLY a JSON array with exactly 5 objects, each having:
- "category": one of ["academic", "skills", "placement", "health", "career"]
- "severity": one of ["positive", "warning", "critical", "info"]  
- "icon": a single emoji
- "title": short 5-8 word title
- "message": 1-2 sentence personalized insight in Hinglish
- "action": one specific actionable step

Example format:
[{{"category":"academic","severity":"warning","icon":"📉","title":"Maths mein danger zone hai","message":"Tera Discrete Maths 38% pe hai — fail hone ka risk hai bhai. Abhi se padhai shuru kar.","action":"Aaj hi Discrete Maths ke Unit 1 ke notes padh"}}]

Return ONLY the JSON array. No markdown, no extra text."""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=800, temperature=0.3
        )
        raw = response.choices[0].message.content.strip().replace('```json', '').replace('```', '').strip()
        insights = json.loads(raw)
        return {"insights": insights[:5], "source": "ai", "model": "llama3-70b"}
    except Exception as e:
        print(f"AI insight generation error: {e}")
        return _fallback_insights(student_data, ml_predictions)


def generate_ml_interpretation(cgpa_prediction: dict, patterns: list, student: dict) -> str:
    """Generate LLM interpretation of ML model outputs."""
    if not HAS_GROQ or not os.getenv("GROQ_API_KEY"):
        pred = cgpa_prediction.get("predicted_cgpa", cgpa_prediction.get("predictedCGPA", "?"))
        trend = cgpa_prediction.get("trend", "stable")
        return f"ML models predict CGPA around {pred} with {trend} trend. {'Keep it up!' if trend == 'improving' else 'Focus on improvement areas.'}"

    client = Groq(api_key=os.getenv("GROQ_API_KEY"))

    prompt = f"""Interpret these ML prediction results for a student in 2-3 sentences. Be specific, use Hinglish, be supportive.

CGPA Prediction: {json.dumps(cgpa_prediction, default=str)[:500]}
Patterns Detected: {json.dumps(patterns, default=str)[:300]}
Student: {student.get('name', 'Student')}, Sem {student.get('semester', '?')}, Goal: {student.get('careerGoal', '?')}

Write a brief, warm interpretation. Max 80 words."""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=150, temperature=0.5
        )
        return response.choices[0].message.content.strip()
    except:
        return f"ML prediction: CGPA ~{cgpa_prediction.get('predicted_cgpa', '?')} ({cgpa_prediction.get('trend', 'stable')} trend)."


def generate_comparative_insight(student: dict, class_avg: dict) -> dict:
    """Compare student with class averages and generate insights."""
    cgpa = student.get("cgpa", 6.5)
    avg_cgpa = class_avg.get("avgCgpa", 6.5)
    avg_attendance = class_avg.get("avgAttendance", 75)
    student_attendance = student.get("attendancePct", 75)

    comparisons = []
    if cgpa > avg_cgpa + 0.5:
        comparisons.append({"metric": "CGPA", "status": "above_avg", "message": f"Tera CGPA ({cgpa}) class average ({avg_cgpa}) se upar hai! 🎉", "delta": round(cgpa - avg_cgpa, 2)})
    elif cgpa < avg_cgpa - 0.5:
        comparisons.append({"metric": "CGPA", "status": "below_avg", "message": f"CGPA ({cgpa}) class average ({avg_cgpa}) se neeche hai. Push karo! 💪", "delta": round(cgpa - avg_cgpa, 2)})
    else:
        comparisons.append({"metric": "CGPA", "status": "at_avg", "message": f"CGPA ({cgpa}) class average ({avg_cgpa}) ke around hai. Top 10% ke liye push karo!", "delta": round(cgpa - avg_cgpa, 2)})

    if student_attendance < avg_attendance - 10:
        comparisons.append({"metric": "Attendance", "status": "below_avg", "message": f"Attendance ({student_attendance}%) bahut kam hai average ({avg_attendance}%) se.", "delta": round(student_attendance - avg_attendance, 1)})

    return {
        "comparisons": comparisons,
        "percentile": _estimate_percentile(cgpa, avg_cgpa),
        "class_avg": class_avg
    }


def _estimate_percentile(cgpa, avg_cgpa):
    """Rough percentile estimate based on CGPA vs class average."""
    diff = cgpa - avg_cgpa
    if diff > 2.0: return 95
    if diff > 1.5: return 90
    if diff > 1.0: return 80
    if diff > 0.5: return 70
    if diff > 0: return 60
    if diff > -0.5: return 45
    if diff > -1.0: return 30
    return 15


def _fallback_insights(student_data, ml_predictions):
    """Generate rule-based insights when LLM is unavailable."""
    insights = []
    cgpa = student_data.get("cgpa", 0)
    semester = student_data.get("semester", 1)
    backlogs = student_data.get("backlogs", 0)
    streak = student_data.get("currentStreak", 0)

    if cgpa >= 8.5:
        insights.append({"category": "academic", "severity": "positive", "icon": "🔥", "title": "Top performer alert", "message": f"CGPA {cgpa} hai — outstanding! Dean's list material.", "action": "Research paper ya open-source contribution try kar."})
    elif cgpa < 5.5 and cgpa > 0:
        insights.append({"category": "academic", "severity": "critical", "icon": "🚨", "title": "CGPA recovery needed", "message": f"CGPA {cgpa} hai — risky zone. Recovery plan follow kar.", "action": "Sabse weak subject identify kar aur aaj se daily 1 hour padh."})

    if backlogs > 0:
        insights.append({"category": "academic", "severity": "critical", "icon": "📚", "title": f"{backlogs} backlog(s) pending", "message": f"Backlogs clear karna priority hai. Har ek backlog CGPA ~0.15 drag karta hai.", "action": "Nearest supplementary exam ka date check kar aur prep start kar."})

    if streak >= 7:
        insights.append({"category": "health", "severity": "positive", "icon": "🔥", "title": f"{streak}-day streak going strong!", "message": "Consistency build ho rahi hai. Don't break the chain!", "action": "Aaj bhi at least 30 min focused study kar."})
    elif streak == 0:
        insights.append({"category": "health", "severity": "warning", "icon": "😴", "title": "Zero streak — start today", "message": "Streak 0 pe hai. Even 15 min counts. Start small.", "action": "Abhi 15 min timer laga aur ek topic revise kar."})

    if semester >= 5:
        insights.append({"category": "placement", "severity": "info", "icon": "🎯", "title": "Placement prep time", "message": f"Sem {semester} hai — companies aa rahe hai. DSA + projects ready rakh.", "action": "Aaj 2 LeetCode Easy problems solve kar."})

    pred = ml_predictions.get("predicted_cgpa", ml_predictions.get("predictedCGPA"))
    if pred:
        insights.append({"category": "academic", "severity": "info", "icon": "🤖", "title": f"ML predicts CGPA {pred}", "message": f"AI model ke according tera next CGPA ~{pred} aa sakta hai.", "action": "Weak subjects pe focus badha to improve prediction."})

    return {"insights": insights[:5], "source": "rule_based", "model": "fallback"}

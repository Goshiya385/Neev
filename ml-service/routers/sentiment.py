"""
Sentiment Analysis router — AI-powered feedback analysis using Groq LLM.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import os
import json

router = APIRouter(prefix="/ml/sentiment", tags=["Sentiment Analysis"])


class FeedbackAnalysisRequest(BaseModel):
    content: str
    target_type: str = "general"
    rating: Optional[int] = None


class BatchSentimentRequest(BaseModel):
    feedbacks: List[dict] = []


@router.post("/analyze")
async def analyze_sentiment(request: FeedbackAnalysisRequest):
    try:
        from groq import Groq
        client = Groq(api_key=os.getenv("GROQ_API_KEY"))

        prompt = f"""Analyze this student feedback and return ONLY a JSON object (no markdown, no extra text):

Feedback: "{request.content}"
Rating given: {request.rating or 'not given'}/5
Context: Feedback about {request.target_type}

Return exactly this JSON structure:
{{"label": "positive|negative|neutral|mixed", "score": 0.0-1.0, "emotion": "happy|frustrated|anxious|motivated|confused|satisfied|disappointed|neutral", "keywords": ["keyword1", "keyword2", "keyword3"], "summary": "One sentence summary"}}"""

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=300, temperature=0.1
        )
        raw = response.choices[0].message.content.strip().replace('```json', '').replace('```', '').strip()
        analysis = json.loads(raw)
        return {
            "label": analysis.get("label", "neutral"), "score": float(analysis.get("score", 0.5)),
            "emotion": analysis.get("emotion", "neutral"), "keywords": analysis.get("keywords", []),
            "summary": analysis.get("summary", ""), "actionable": analysis.get("actionable", False),
            "action_needed": analysis.get("action_needed")
        }
    except (json.JSONDecodeError, Exception):
        # Fallback keyword-based
        content_lower = request.content.lower()
        pos = sum(1 for w in ['good','great','excellent','helpful','love','amazing','best','thank'] if w in content_lower)
        neg = sum(1 for w in ['bad','poor','terrible','hate','worst','useless','boring','difficult','confusing'] if w in content_lower)
        label = "positive" if pos > neg else "negative" if neg > pos else "neutral"
        return {"label": label, "score": 0.6, "emotion": "neutral", "keywords": [], "summary": request.content[:100], "actionable": False, "action_needed": None}


@router.post("/aggregate")
async def aggregate_sentiments(request: BatchSentimentRequest):
    feedbacks = request.feedbacks
    if not feedbacks:
        return {"total": 0, "sentiment_distribution": {}, "avg_rating": 0, "top_keywords": [], "emotion_distribution": {}, "overall_health": "neutral"}

    sentiment_counts = {"positive": 0, "negative": 0, "neutral": 0, "mixed": 0}
    emotion_counts = {}
    all_keywords = []
    ratings = []

    for f in feedbacks:
        s = f.get("sentiment", {})
        if s.get("label"): sentiment_counts[s["label"]] = sentiment_counts.get(s["label"], 0) + 1
        if s.get("emotion"): emotion_counts[s["emotion"]] = emotion_counts.get(s["emotion"], 0) + 1
        all_keywords.extend(s.get("keywords", []))
        if f.get("rating"): ratings.append(f["rating"])

    keyword_freq = {}
    for kw in all_keywords: keyword_freq[kw] = keyword_freq.get(kw, 0) + 1
    top_keywords = sorted(keyword_freq.items(), key=lambda x: x[1], reverse=True)[:20]

    total = len(feedbacks)
    sentiment_pct = {k: round(v / max(total, 1) * 100, 1) for k, v in sentiment_counts.items()}

    return {
        "total": total, "sentiment_distribution": sentiment_pct, "sentiment_counts": sentiment_counts,
        "avg_rating": round(sum(ratings) / len(ratings), 1) if ratings else 0,
        "top_keywords": [{"word": k, "count": v} for k, v in top_keywords],
        "emotion_distribution": emotion_counts,
        "overall_health": "positive" if sentiment_counts["positive"] > sentiment_counts["negative"] else "needs_attention"
    }

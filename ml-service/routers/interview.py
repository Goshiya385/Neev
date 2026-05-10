"""
AI Interview Evaluator — Analyzes speech transcript for communication skills.
Uses Groq LLM to judge grammar, clarity, confidence, filler words, vocabulary.
"""
import os
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
from groq import Groq
import json
import re

router = APIRouter(prefix="/ml/interview", tags=["Interview"])

INTERVIEW_QUESTIONS = {
    "TCS Digital": [
        "Tell me about yourself and your academic background.",
        "What is the difference between abstraction and encapsulation?",
        "Explain the concept of DBMS normalization.",
        "What is your approach to solving a coding problem?",
        "Where do you see yourself in 5 years?",
        "What is the difference between TCP and UDP?",
        "Explain polymorphism with an example.",
        "How do you handle pressure during exams or deadlines?",
    ],
    "Infosys SP": [
        "Explain the difference between Java and Python.",
        "What is SQL injection and how to prevent it?",
        "Describe a project you worked on recently.",
        "What is OOP and why is it important?",
        "How do you prioritize tasks when you have multiple deadlines?",
        "What is the difference between a stack and a queue?",
        "Explain the MVC architecture pattern.",
        "Why do you want to work at Infosys?",
    ],
    "Amazon": [
        "Tell me about a time you had to deal with a difficult team member.",
        "Design a URL shortening service like bit.ly.",
        "What is the time complexity of binary search?",
        "Explain a situation where you showed ownership.",
        "How would you find the middle element of a linked list?",
        "What are Amazon's Leadership Principles that resonate with you?",
        "Describe a time you failed and what you learned from it.",
        "How would you design a notification system?",
    ],
    "Google": [
        "How would you design Google Search autocomplete?",
        "Explain dynamic programming with an example.",
        "Tell me about your most challenging project.",
        "How would you detect a cycle in a graph?",
        "What makes a good API design?",
        "Describe a time you went above and beyond.",
        "How would you scale a system to handle 1 million users?",
        "What is your favorite algorithm and why?",
    ],
    "General": [
        "Tell me about yourself.",
        "What are your strengths and weaknesses?",
        "Why should we hire you?",
        "Describe a challenging situation and how you handled it.",
        "What motivates you to work hard?",
        "Where do you see yourself in 5 years?",
        "How do you handle criticism?",
        "What is your approach to learning new technologies?",
    ],
}


class EvaluateRequest(BaseModel):
    transcript: str
    question: str = ""
    company: str = "General"
    duration_seconds: int = 60


class QuestionRequest(BaseModel):
    company: str = "General"
    count: int = 3


def _call_llm(prompt: str, max_tokens: int = 800) -> str:
    try:
        client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        r = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=max_tokens,
            temperature=0.3,
        )
        return r.choices[0].message.content.strip()
    except Exception as e:
        print(f"Interview LLM error: {e}")
        return ""


@router.post("/evaluate")
def evaluate_transcript(req: EvaluateRequest):
    """Evaluate a speech transcript for communication skills."""
    transcript = req.transcript.strip()
    if not transcript or len(transcript) < 10:
        return {"error": "Transcript too short. Please speak more."}

    # Basic metrics
    words = transcript.split()
    word_count = len(words)
    sentences = [s.strip() for s in re.split(r'[.!?]+', transcript) if s.strip()]
    sentence_count = max(len(sentences), 1)
    avg_sentence_len = round(word_count / sentence_count, 1)

    # Filler word detection
    filler_words = ["um", "uh", "like", "you know", "basically", "actually",
                    "so", "well", "right", "okay", "hmm", "ah", "er", "umm"]
    filler_count = sum(transcript.lower().count(f" {fw} ") + transcript.lower().count(f" {fw},") +
                       transcript.lower().count(f" {fw}.") for fw in filler_words)

    # Words per minute
    duration = max(req.duration_seconds, 1)
    wpm = round(word_count / (duration / 60))

    # LLM evaluation
    prompt = f"""You are an expert interview coach evaluating a candidate's spoken answer.

Question asked: "{req.question or 'General self-introduction'}"
Company: {req.company}
Transcript: "{transcript}"
Duration: {req.duration_seconds} seconds
Word count: {word_count}
Filler words detected: {filler_count}

Evaluate and respond in STRICT JSON format only (no explanation outside JSON):
{{
    "grammar_score": <1-10>,
    "clarity_score": <1-10>,
    "confidence_score": <1-10>,
    "relevance_score": <1-10>,
    "vocabulary_level": "<basic|intermediate|advanced>",
    "overall_score": <1-10>,
    "strengths": ["strength1", "strength2"],
    "weaknesses": ["weakness1", "weakness2"],
    "improvement_tips": ["tip1", "tip2", "tip3"],
    "sample_better_answer": "<A brief 2-3 sentence improved version>",
    "verdict": "<One line GenZ-style verdict like 'Not bad bestie, but needs more rizz in delivery 💅' or 'Main character energy detected ✨'>"
}}"""

    raw = _call_llm(prompt)

    # Parse LLM response
    try:
        # Try to extract JSON from response
        json_match = re.search(r'\{[\s\S]*\}', raw)
        if json_match:
            evaluation = json.loads(json_match.group())
        else:
            evaluation = json.loads(raw)
    except:
        evaluation = {
            "grammar_score": 5, "clarity_score": 5, "confidence_score": 5,
            "relevance_score": 5, "vocabulary_level": "intermediate",
            "overall_score": 5,
            "strengths": ["Attempted the answer"],
            "weaknesses": ["Could be more structured"],
            "improvement_tips": ["Practice STAR method", "Reduce filler words", "Add specific examples"],
            "sample_better_answer": "Could not generate a better answer.",
            "verdict": "Keep practicing bestie, you got this 💪"
        }

    # Merge computed metrics
    evaluation["word_count"] = word_count
    evaluation["sentence_count"] = sentence_count
    evaluation["avg_sentence_length"] = avg_sentence_len
    evaluation["filler_word_count"] = filler_count
    evaluation["words_per_minute"] = wpm
    evaluation["wpm_assessment"] = (
        "Too slow — try to be more fluent" if wpm < 100
        else "Perfect pace!" if wpm <= 160
        else "Too fast — slow down for clarity"
    )
    evaluation["duration_seconds"] = req.duration_seconds

    return evaluation


@router.get("/questions/{company}")
def get_questions(company: str, count: int = 3):
    """Get random interview questions for a company."""
    import random
    questions = INTERVIEW_QUESTIONS.get(company, INTERVIEW_QUESTIONS["General"])
    selected = random.sample(questions, min(count, len(questions)))
    return {"company": company, "questions": selected}


@router.get("/companies")
def list_companies():
    """List available companies for interview prep."""
    return {"companies": list(INTERVIEW_QUESTIONS.keys())}

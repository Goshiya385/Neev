from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from services.llm_service import get_saarthi_response
from services.rag_service import retrieve_context, index_student_data

router = APIRouter()

class ChatMessage(BaseModel):
    role: str = "user"
    content: str = ""

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []
    studentContext: dict = {}

class IndexRequest(BaseModel):
    studentId: str
    data: dict = {}

class ResumePointsRequest(BaseModel):
    title: str
    description: str = ""
    techStack: List[str] = []

@router.post("/chat")
def chat(req: ChatRequest):
    context = retrieve_context(req.message, req.studentContext)
    response = get_saarthi_response(req.message, req.history, req.studentContext, context)
    return {"response": response, "source": "saarthi-rag"}

@router.post("/index-student")
def index_student(req: IndexRequest):
    result = index_student_data(req.studentId, req.data)
    return {"status": "indexed", "studentId": req.studentId}

@router.post("/resume/generate-points")
def generate_resume_points(req: ResumePointsRequest):
    prompt = f"Generate 3-4 professional resume bullet points for this project:\nTitle: {req.title}\nDescription: {req.description}\nTech Stack: {', '.join(req.techStack)}\n\nWrite in past tense, quantify impact where possible, use action verbs."
    response = get_saarthi_response(prompt, [], {}, "")
    points = [line.strip().lstrip("•-").strip() for line in response.split("\n") if line.strip() and len(line.strip()) > 15]
    return {"points": points[:4]}

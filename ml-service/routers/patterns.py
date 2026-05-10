from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from services.pattern_detector import detect_patterns

router = APIRouter()

class MarkData(BaseModel):
    semester: int = 1
    subject: str = ""
    internalMarks: float = 0
    externalMarks: float = 0
    practicalMarks: float = 0
    maxInternal: float = 30
    maxExternal: float = 70
    maxPractical: float = 25

class AttendanceData(BaseModel):
    subject: str = ""
    status: str = "present"
    semester: int = 1

class PatternRequest(BaseModel):
    marks: List[MarkData] = []
    attendance: List[AttendanceData] = []

@router.post("/detect")
def detect(req: PatternRequest):
    marks_dicts = [m.model_dump() for m in req.marks]
    attendance_dicts = [a.model_dump() for a in req.attendance]
    patterns = detect_patterns(marks_dicts, attendance_dicts)
    return {"patterns": patterns, "totalPatterns": len(patterns)}

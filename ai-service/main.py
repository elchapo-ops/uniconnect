"""
UniConnect AI Service - Job Matching API

This service provides AI-powered matching between students and jobs using
TF-IDF vectorization and cosine similarity.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
from dotenv import load_dotenv

from matching import MatchingService

# Load environment variables
load_dotenv()

app = FastAPI(
    title="UniConnect AI Service",
    description="AI-powered job matching for UniConnect Portal",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", "http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize matching service
matching_service = MatchingService()


# Request/Response Models
class Skill(BaseModel):
    name: str
    level: Optional[str] = None


class StudentProfile(BaseModel):
    id: str
    name: str
    skills: list[str]
    field_of_study: Optional[str] = None
    university: Optional[str] = None
    bio: Optional[str] = None


class JobProfile(BaseModel):
    id: str
    title: str
    description: str
    skills: list[str]
    requirements: list[str] = []
    location: Optional[str] = None
    type: Optional[str] = None


class MatchRequest(BaseModel):
    student: StudentProfile
    job: JobProfile


class BatchMatchJobsRequest(BaseModel):
    student: StudentProfile
    jobs: list[JobProfile]


class BatchMatchStudentsRequest(BaseModel):
    job: JobProfile
    students: list[StudentProfile]


class MatchResult(BaseModel):
    job_id: str
    student_id: str
    match_score: int
    matching_skills: list[str]
    missing_skills: list[str]
    recommendation: str


class BatchMatchResult(BaseModel):
    results: list[MatchResult]


# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "uniconnect-ai",
        "version": "1.0.0"
    }


# Single job-student match
@app.post("/match/job-to-student", response_model=MatchResult)
async def match_job_to_student(request: MatchRequest):
    """Calculate match score between a single job and student."""
    try:
        result = matching_service.calculate_match(
            student=request.student.model_dump(),
            job=request.job.model_dump()
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Match multiple jobs for a student
@app.post("/match/jobs-for-student", response_model=BatchMatchResult)
async def match_jobs_for_student(request: BatchMatchJobsRequest):
    """Calculate match scores for all jobs for a given student."""
    try:
        results = []
        for job in request.jobs:
            result = matching_service.calculate_match(
                student=request.student.model_dump(),
                job=job.model_dump()
            )
            results.append(result)
        
        # Sort by match score descending
        results.sort(key=lambda x: x["match_score"], reverse=True)
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Match multiple students for a job
@app.post("/match/students-for-job", response_model=BatchMatchResult)
async def match_students_for_job(request: BatchMatchStudentsRequest):
    """Calculate match scores for all students for a given job."""
    try:
        results = []
        for student in request.students:
            result = matching_service.calculate_match(
                student=student.model_dump(),
                job=request.job.model_dump()
            )
            results.append(result)
        
        # Sort by match score descending
        results.sort(key=lambda x: x["match_score"], reverse=True)
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

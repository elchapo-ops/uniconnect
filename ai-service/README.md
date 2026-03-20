# UniConnect AI Service

A FastAPI-based AI service for job-student matching in the UniConnect Portal.

## Features

- **Skills-based Matching**: Calculates match scores between students and jobs
- **Semantic Similarity**: Uses TF-IDF and cosine similarity for intelligent matching
- **Batch Processing**: Supports matching multiple jobs/students at once
- **RESTful API**: Easy integration with the main backend

## Setup

1. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the service:
```bash
uvicorn main:app --reload --port 8000
```

## API Endpoints

- `GET /health` - Health check
- `POST /match/job-to-student` - Calculate match score between a job and student
- `POST /match/jobs-for-student` - Get match scores for all jobs for a student
- `POST /match/students-for-job` - Get match scores for all students for a job

# UniConnect Portal

A comprehensive university placement management system connecting students, employers, and administrators. Built with React, TypeScript, Node.js/Express, and FastAPI.

## 🏗️ Project Structure

```
uniconnect-portal/
├── frontend/               # React/TypeScript frontend
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   ├── pages/          # Page components (student, employer, admin)
│   │   ├── contexts/       # React Context (Auth)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utilities and API client
│   │   └── data/           # Types and mock data
│   └── ...
│
├── backend/                # Node.js/Express API
│   ├── prisma/             # Database schema
│   ├── src/
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Auth, error handling
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── utils/          # Helpers
│   └── ...
│
└── ai-service/             # FastAPI AI matching service
    ├── main.py             # API endpoints
    ├── matching.py         # TF-IDF matching algorithm
    └── requirements.txt
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.10+
- PostgreSQL 14+

### 1. Database Setup

```bash
# Create PostgreSQL database
createdb uniconnect

# Or use Docker
docker run --name uniconnect-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=uniconnect -p 5432:5432 -d postgres:14
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install
or npm install --legacy-peer-deps

# Configure environment
cp .env.example .env
# Edit .env with your database URL

# Generate Prisma client and push schema
npm run db:generate
npm run db:push

# Start development server
npm run dev
```

The API will run on `http://localhost:3001`

### 3. AI Service Setup

```bash
cd ai-service

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start service
uvicorn main:app --reload --port 8000
```

The AI service will run on `http://localhost:8000`

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install
or npm install --legacy-peer-deps

# Start development server
npm run dev
```

The frontend will run on `http://localhost:8080`

## 🔐 Authentication

### Create First Admin

```bash
curl -X POST http://localhost:3001/api/auth/admin/setup \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@uniconnect.com", "password": "admin123", "name": "Admin"}'
```

### Register Users

Students and employers can register through the frontend at `/register`.

## 🛠️ Technology Stack

### Frontend

- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS + shadcn/ui
- **Routing:** React Router v6
- **State:** React Context API

### Backend

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** JWT (jsonwebtoken)
- **Validation:** Zod

### AI Service

- **Framework:** FastAPI
- **ML:** scikit-learn (TF-IDF vectorization)
- **Matching:** Cosine similarity

## ✨ Features

### For Students

- 🎯 AI-powered job matching with personalized scores
- 💼 Browse and apply to jobs
- 📊 Track application status
- 📄 Resume upload
- 👤 Profile management

### For Employers

- � Post and manage job listings
- � Browse and filter candidates
- ✅ Review applications with match scores
- 📈 Update application status (workflow)
- 🏢 Company profile management

### For Administrators

- 📊 Platform analytics dashboard
- 👥 Manage students and employers
- ✓ Verify employer accounts
- � Placement statistics

## 📊 Application Status Workflow

```
Applied → Under Review → Shortlisted → Interview Scheduled → Hired/Rejected
```

## � API Endpoints

| Category  | Endpoints                                                                    |
| --------- | ---------------------------------------------------------------------------- |
| Auth      | `/api/auth/register`, `/api/auth/login`, `/api/auth/me`                      |
| Students  | `/api/students/profile`, `/api/students/applications`                        |
| Employers | `/api/employers/profile`, `/api/employers/jobs`, `/api/employers/candidates` |
| Jobs      | `/api/jobs` (public listing with filters)                                    |
| Admin     | `/api/admin/students`, `/api/admin/employers`, `/api/admin/analytics`        |
| AI        | `/match/job-to-student`, `/match/jobs-for-student`                           |

## 📦 Environment Variables

### Backend (.env)

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/uniconnect"
JWT_SECRET="your-secret-key"
AI_SERVICE_URL="http://localhost:8000"
```

### Frontend (.env)

```bash
VITE_API_URL="http://localhost:3001/api"
```

## 🧪 Testing

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

## 📝 Development Notes

- The AI matching service is optional - the backend has fallback matching
- Match scores are calculated using skills overlap and TF-IDF similarity
- All file uploads are stored in `backend/uploads/`

## 📄 License

This project is part of a university placement system. All rights reserved.

---

**Built with ❤️ for connecting students with opportunities**

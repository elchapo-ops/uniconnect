# BICS Backend

Node.js/Express backend API for the BICS Portal.

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or bun

### Setup

1. **Install dependencies**
```bash
cd backend
npm install
```

2. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. **Set up database**
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (development)
npm run db:push

# Or run migrations (production)
npm run db:migrate
```

4. **Create uploads directory**
```bash
mkdir -p uploads/resumes
```

5. **Start development server**
```bash
npm run dev
```

The API will be available at `http://localhost:3001`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/admin/setup` - Create first admin (one-time)

### Students
- `GET /api/students/profile` - Get profile
- `PUT /api/students/profile` - Update profile
- `POST /api/students/profile/resume` - Upload resume
- `GET /api/students/applications` - List applications
- `POST /api/students/applications` - Apply to job
- `DELETE /api/students/applications/:id` - Withdraw application

### Employers
- `GET /api/employers/profile` - Get profile
- `PUT /api/employers/profile` - Update profile
- `GET /api/employers/jobs` - List employer's jobs
- `POST /api/employers/jobs` - Create job
- `PUT /api/employers/jobs/:id` - Update job
- `DELETE /api/employers/jobs/:id` - Delete job
- `GET /api/employers/jobs/:id/applications` - Get job applications
- `PUT /api/employers/applications/:id/status` - Update application status
- `GET /api/employers/candidates` - Browse candidates

### Jobs (Public)
- `GET /api/jobs` - List active jobs
- `GET /api/jobs/:id` - Get job details

### Admin
- `GET /api/admin/students` - List all students
- `GET /api/admin/employers` - List all employers
- `PUT /api/admin/employers/:id/verify` - Verify employer
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/analytics` - Get platform analytics

## Database Schema

See `prisma/schema.prisma` for the complete schema.

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run migrations
- `npm run db:studio` - Open Prisma Studio

## Application Status Flow

```
Applied → Under Review → Shortlisted → Interview Scheduled → Hired/Rejected
```

Each status change notifies the student automatically.

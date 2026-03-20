/**
 * AI Matching Service Client
 * Communicates with the FastAPI AI service for job-student matching
 */

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

interface StudentProfile {
  id: string;
  name: string;
  skills: string[];
  field_of_study?: string;
  university?: string;
  bio?: string;
}

interface JobProfile {
  id: string;
  title: string;
  description: string;
  skills: string[];
  requirements?: string[];
  location?: string;
  type?: string;
}

interface MatchResult {
  job_id: string;
  student_id: string;
  match_score: number;
  matching_skills: string[];
  missing_skills: string[];
  recommendation: string;
}

/**
 * Calculate match score between a student and job using the AI service
 */
export async function getMatchScore(
  student: StudentProfile,
  job: JobProfile
): Promise<MatchResult> {
  try {
    const response = await fetch(`${AI_SERVICE_URL}/match/job-to-student`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student, job }),
    });

    if (!response.ok) {
      throw new Error(`AI service error: ${response.statusText}`);
    }

    const data = await response.json();
    return data as MatchResult;
  } catch (error) {
    console.error('AI matching service error:', error);
    // Fallback to simple matching
    return calculateFallbackMatch(student, job);
  }
}

/**
 * Get match scores for multiple jobs for a student
 */
export async function getMatchScoresForStudent(
  student: StudentProfile,
  jobs: JobProfile[]
): Promise<MatchResult[]> {
  try {
    const response = await fetch(`${AI_SERVICE_URL}/match/jobs-for-student`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student, jobs }),
    });

    if (!response.ok) {
      throw new Error(`AI service error: ${response.statusText}`);
    }

    const data = await response.json();
    return (data as any).results as MatchResult[];
  } catch (error) {
    console.error('AI matching service error:', error);
    // Fallback to simple matching for each job
    return jobs.map((job) => calculateFallbackMatch(student, job));
  }
}

/**
 * Get match scores for multiple students for a job
 */
export async function getMatchScoresForJob(
  job: JobProfile,
  students: StudentProfile[]
): Promise<MatchResult[]> {
  try {
    const response = await fetch(`${AI_SERVICE_URL}/match/students-for-job`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job, students }),
    });

    if (!response.ok) {
      throw new Error(`AI service error: ${response.statusText}`);
    }

    const data = await response.json();
    return (data as any).results as MatchResult[];
  } catch (error) {
    console.error('AI matching service error:', error);
    // Fallback to simple matching for each student
    return students.map((student) => calculateFallbackMatch(student, job));
  }
}

/**
 * Fallback matching when AI service is unavailable
 * Uses simple skill overlap calculation
 */
function calculateFallbackMatch(
  student: StudentProfile,
  job: JobProfile
): MatchResult {
  const studentSkills = student.skills.map((s) => s.toLowerCase());
  const jobSkills = job.skills.map((s) => s.toLowerCase());

  const matchingSkills: string[] = [];
  for (const jobSkill of jobSkills) {
    for (const studentSkill of studentSkills) {
      if (
        jobSkill === studentSkill ||
        jobSkill.includes(studentSkill) ||
        studentSkill.includes(jobSkill)
      ) {
        matchingSkills.push(jobSkill);
        break;
      }
    }
  }

  const missingSkills = jobSkills.filter((s) => !matchingSkills.includes(s));

  let matchScore = 50; // Base score
  if (jobSkills.length > 0) {
    matchScore = Math.round((matchingSkills.length / jobSkills.length) * 100);
  }

  // Normalize to 45-100 range
  matchScore = Math.max(45, Math.min(100, matchScore));

  let recommendation = 'Consider applying to expand your experience.';
  if (matchScore >= 85) {
    recommendation = 'Excellent match! Your skills align very well with this role.';
  } else if (matchScore >= 70) {
    recommendation = `Good match! Consider developing: ${missingSkills.slice(0, 2).join(', ')}`;
  } else if (matchScore >= 55) {
    recommendation = `Moderate match. Key skills to develop: ${missingSkills.slice(0, 3).join(', ')}`;
  }

  return {
    job_id: job.id,
    student_id: student.id,
    match_score: matchScore,
    matching_skills: matchingSkills,
    missing_skills: missingSkills.slice(0, 5),
    recommendation,
  };
}

/**
 * Check if AI service is available
 */
export async function checkAIServiceHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${AI_SERVICE_URL}/health`, {
      method: 'GET',
    });
    return response.ok;
  } catch {
    return false;
  }
}

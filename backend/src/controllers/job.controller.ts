import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/database.js";
import { createError } from "../middleware/errorHandler.js";
import { getMatchScoresForStudent, getMatchScore } from "../services/matching.service.js";

export async function listJobs(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const {
      search,
      location,
      type,
      status = "active",
      page = "1",
      limit = "20",
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      status: status as string,
      OR: [
        { deadline: null },
        { deadline: { gte: new Date() } }
      ]
    };

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: "insensitive" } },
        { description: { contains: search as string, mode: "insensitive" } },
        { skills: { hasSome: [(search as string).toLowerCase()] } },
      ];
    }

    if (location && location !== "any") {
      where.location = { contains: location as string, mode: "insensitive" };
    }

    if (type && type !== "all") {
      where.type = (type as string).replace("-", "_");
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          employer: {
            select: {
              companyName: true,
              logoUrl: true,
              verified: true,
            },
          },
        },
        skip,
        take: limitNum,
        orderBy: { createdAt: "desc" },
      }),
      prisma.job.count({ where }),
    ]);

    // Get student profile for match score calculation if authenticated
    let student: any = null;
    let matchScores: Map<string, number> = new Map();

    if (req.user?.role === "student") {
      student = await prisma.student.findFirst({
        where: { userId: req.user.userId },
      });

      // Calculate match scores using AI service for all jobs
      if (student && student.skills.length > 0 && jobs.length > 0) {
        try {
          const jobProfiles = jobs.map((job) => ({
            id: job.id,
            title: job.title,
            description: job.description,
            skills: job.skills,
            requirements: job.requirements,
            location: job.location,
            type: job.type,
          }));

          const matchResults = await getMatchScoresForStudent(
            {
              id: student.id,
              name: student.name,
              skills: student.skills,
              field_of_study: student.fieldOfStudy || undefined,
              university: student.university || undefined,
              bio: student.bio || undefined,
            },
            jobProfiles,
          );

          matchResults.forEach((result) => {
            matchScores.set(result.job_id, result.match_score);
          });
        } catch (e) {
          console.error("AI matching service error:", e);
        }
      }
    }

    const formattedJobs = jobs.map((job) => {
      // Get match score from AI service results or use default
      const matchScore = matchScores.get(job.id) || 0;

      return {
        id: job.id,
        title: job.title,
        company: job.employer.companyName,
        companyLogo: job.employer.logoUrl,
        verified: job.employer.verified,
        location: job.location,
        type: job.type.replace("_", "-"),
        salary: job.salary,
        description: job.description,
        requirements: job.requirements,
        skills: job.skills,
        matchScore,
        postedDate: job.createdAt.toISOString().split("T")[0],
        deadline: job.deadline?.toISOString().split("T")[0],
        status: job.status,
      };
    });

    res.json({
      jobs: formattedJobs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getJobById(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params;

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        employer: {
          select: {
            companyName: true,
            logoUrl: true,
            industry: true,
            location: true,
            size: true,
            description: true,
            verified: true,
          },
        },
      },
    });

    if (!job) {
      throw createError("Job not found", 404);
    }

    // Check if student has already applied and calculate match score
    let hasApplied = false;
    let applicationStatus = null;
    let matchScore = 0;

    if (req.user?.role === "student") {
      const student = await prisma.student.findFirst({
        where: { userId: req.user.userId },
      });
      if (student) {
        const application = await prisma.application.findFirst({
          where: { jobId: id, studentId: student.id },
        });
        hasApplied = !!application;
        applicationStatus = application?.status;

        // Calculate match score if not applied (or even if applied, to show current score)
        // If applied, we might want to show the score at time of application or current? 
        // Usually current score is more useful for "Job Details" view.
        // If the application exists, it has a stored matchScore, but let's calculate fresh for the view
        // consistent with listJobs. 
        if (student.skills.length > 0) {
            try {
                const matchResult = await getMatchScore(
                    {
                        id: student.id,
                        name: student.name,
                        skills: student.skills,
                        field_of_study: student.fieldOfStudy || undefined,
                        university: student.university || undefined,
                        bio: student.bio || undefined,
                    },
                    {
                        id: job.id,
                        title: job.title,
                        description: job.description,
                        skills: job.skills,
                        requirements: job.requirements,
                        location: job.location,
                        type: job.type,
                    }
                );
                matchScore = matchResult.match_score;
            } catch (e) {
                console.error("AI matching service error in getJobById:", e);
            }
        }
      }
    }

    res.json({
      id: job.id,
      title: job.title,
      company: job.employer.companyName,
      companyLogo: job.employer.logoUrl,
      verified: job.employer.verified,
      location: job.location,
      type: job.type.replace("_", "-"),
      salary: job.salary,
      description: job.description,
      requirements: job.requirements,
      skills: job.skills,
      postedDate: job.createdAt.toISOString().split("T")[0],
      deadline: job.deadline?.toISOString().split("T")[0],
      status: job.status,
      employer: job.employer,
      hasApplied,
      applicationStatus,
      matchScore,
      applicationMatchScore: applicationStatus ? matchScore : undefined, // Optional: if we want to differentiate
    });
  } catch (error) {
    next(error);
  }
}

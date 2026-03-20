import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/database.js";
import { createError } from "../middleware/errorHandler.js";
import { z } from "zod";
import { getMatchScoresForJob } from "../services/matching.service.js";

const updateProfileSchema = z.object({
  companyName: z.string().min(1).optional(),
  industry: z.string().optional(),
  location: z.string().optional(),
  size: z.string().optional(),
  description: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
});

const createJobSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  location: z.string().min(1, "Location is required"),
  type: z.enum(["full_time", "part_time", "internship", "contract"]),
  salary: z.string().optional(),
  requirements: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  deadline: z.string().optional(),
  status: z.enum(["draft", "active", "closed"]).optional(),
});

const updateJobSchema = createJobSchema.partial();

export async function getProfile(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user || req.user.role !== "employer") {
      throw createError("Employer access required", 403);
    }

    const employer = await prisma.employer.findFirst({
      where: { userId: req.user.userId },
      include: {
        user: { select: { email: true } },
        jobs: {
          select: {
            id: true,
            title: true,
            status: true,
            _count: { select: { applications: true } },
          },
        },
      },
    });

    if (!employer) {
      throw createError("Employer profile not found", 404);
    }

    res.json({
      ...employer,
      jobsPosted: employer.jobs.length,
      totalApplications: employer.jobs.reduce(
        (sum, job) => sum + job._count.applications,
        0,
      ),
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user || req.user.role !== "employer") {
      throw createError("Employer access required", 403);
    }

    const data = updateProfileSchema.parse(req.body);

    const employer = await prisma.employer.update({
      where: { userId: req.user.userId },
      data,
    });

    res.json({
      message: "Profile updated successfully",
      employer,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res
        .status(400)
        .json({ error: "Validation failed", errors: error.errors });
      return;
    }
    next(error);
  }
}

export async function getJobs(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user || req.user.role !== "employer") {
      throw createError("Employer access required", 403);
    }

    const employer = await prisma.employer.findFirst({
      where: { userId: req.user.userId },
    });

    if (!employer) {
      throw createError("Employer profile not found", 404);
    }

    const { status } = req.query;

    const jobs = await prisma.job.findMany({
      where: {
        employerId: employer.id,
        ...(status && { status: status as any }),
      },
      include: {
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Transform to match frontend expectations
    const formattedJobs = jobs.map((job) => ({
      id: job.id,
      title: job.title,
      company: employer.companyName,
      location: job.location,
      type: job.type.replace("_", "-"),
      salary: job.salary,
      description: job.description,
      requirements: job.requirements,
      skills: job.skills,
      postedDate: job.createdAt.toISOString().split("T")[0],
      deadline: job.deadline?.toISOString().split("T")[0],
      status: job.status,
      applicantCount: job._count.applications,
    }));

    res.json(formattedJobs);
  } catch (error) {
    next(error);
  }
}

export async function createJob(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user || req.user.role !== "employer") {
      throw createError("Employer access required", 403);
    }

    const employer = await prisma.employer.findFirst({
      where: { userId: req.user.userId },
    });

    if (!employer) {
      throw createError("Employer profile not found", 404);
    }

    const data = createJobSchema.parse(req.body);

    const job = await prisma.job.create({
      data: {
        ...data,
        employerId: employer.id,
        deadline: data.deadline ? new Date(data.deadline) : null,
        requirements: data.requirements || [],
        skills: data.skills || [],
      },
    });

    // Handle auto-application and new job notifications
    if (job.status === "active") {
      // Run asynchronously so it doesn't block the API response
      (async () => {
        try {
          const students = await prisma.student.findMany({
            where: { placementStatus: { not: "placed" } },
            include: { user: true },
          });

          if (students.length > 0) {
            const studentProfiles = students.map((s) => ({
              id: s.id,
              name: s.name,
              skills: s.skills,
              field_of_study: s.fieldOfStudy || undefined,
              university: s.university || undefined,
              bio: s.bio || undefined,
            }));

            const jobProfile = {
              id: job.id,
              title: job.title,
              description: job.description,
              skills: job.skills || [],
              requirements: job.requirements || [],
              location: job.location,
              type: job.type as string,
            };

            const matchResults = await getMatchScoresForJob(jobProfile, studentProfiles);

            for (const result of matchResults) {
              const student = students.find((s) => s.id === result.student_id);
              if (!student) continue;

              // Send New Job Notification
              await prisma.notification.create({
                data: {
                  userId: student.userId,
                  type: "system",
                  title: "New Relevant Job Posted",
                  message: `A new job "${job.title}" matching your profile has been posted by ${employer.companyName}.`,
                },
              });

              // Auto-Apply if Match >75%
              if (result.match_score > 75) {
                await prisma.application.create({
                  data: {
                    jobId: job.id,
                    studentId: student.id,
                    status: "applied",
                    matchScore: result.match_score,
                    autoApplied: true,
                  },
                });

                await prisma.notification.create({
                  data: {
                    userId: student.userId,
                    type: "application",
                    title: "Auto-Application Submitted",
                    message: `We automatically applied to "${job.title}" as your profile was a >75% match! Check your dashboard to withdraw if not interested.`,
                  },
                });
              }
            }
          }
        } catch (err) {
          console.error("Auto-apply background error:", err);
        }
      })();
    }

    res.status(201).json({
      message: "Job created successfully",
      job: {
        id: job.id,
        title: job.title,
        company: employer.companyName,
        location: job.location,
        type: job.type.replace("_", "-"),
        salary: job.salary,
        description: job.description,
        requirements: job.requirements,
        skills: job.skills,
        postedDate: job.createdAt.toISOString().split("T")[0],
        deadline: job.deadline?.toISOString().split("T")[0],
        status: job.status,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res
        .status(400)
        .json({ error: "Validation failed", errors: error.errors });
      return;
    }
    next(error);
  }
}

export async function updateJob(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user || req.user.role !== "employer") {
      throw createError("Employer access required", 403);
    }

    const { id } = req.params;

    const employer = await prisma.employer.findFirst({
      where: { userId: req.user.userId },
    });

    if (!employer) {
      throw createError("Employer profile not found", 404);
    }

    // Verify job belongs to this employer
    const existingJob = await prisma.job.findFirst({
      where: { id, employerId: employer.id },
    });

    if (!existingJob) {
      throw createError("Job not found", 404);
    }

    const data = updateJobSchema.parse(req.body);

    const job = await prisma.job.update({
      where: { id },
      data: {
        ...data,
        deadline: data.deadline
          ? new Date(data.deadline)
          : existingJob.deadline,
      },
    });

    res.json({
      message: "Job updated successfully",
      job,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res
        .status(400)
        .json({ error: "Validation failed", errors: error.errors });
      return;
    }
    next(error);
  }
}

export async function deleteJob(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user || req.user.role !== "employer") {
      throw createError("Employer access required", 403);
    }

    const { id } = req.params;

    const employer = await prisma.employer.findFirst({
      where: { userId: req.user.userId },
    });

    if (!employer) {
      throw createError("Employer profile not found", 404);
    }

    const job = await prisma.job.findFirst({
      where: { id, employerId: employer.id },
    });

    if (!job) {
      throw createError("Job not found", 404);
    }

    await prisma.job.delete({ where: { id } });

    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    next(error);
  }
}

export async function getJobApplications(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user || req.user.role !== "employer") {
      throw createError("Employer access required", 403);
    }

    const { id } = req.params;

    const employer = await prisma.employer.findFirst({
      where: { userId: req.user.userId },
    });

    if (!employer) {
      throw createError("Employer profile not found", 404);
    }

    const job = await prisma.job.findFirst({
      where: { id, employerId: employer.id },
    });

    if (!job) {
      throw createError("Job not found", 404);
    }

    const applications = await prisma.application.findMany({
      where: { jobId: id },
      include: {
        student: {
          include: {
            user: { select: { email: true } },
          },
        },
      },
      orderBy: { appliedAt: "desc" },
    });

    const formattedApplications = applications.map((app) => ({
      id: app.id,
      student: {
        id: app.student.id,
        name: app.student.name,
        email: app.student.user.email,
        fieldOfStudy: app.student.fieldOfStudy,
        university: app.student.university,
        skills: app.student.skills,
        location: app.student.location,
        resumeUrl: app.student.resumeUrl,
        avatarUrl: app.student.avatarUrl,
      },
      status: app.status,
      matchScore: app.matchScore,
      coverLetter: app.coverLetter,
      appliedAt: app.appliedAt,
    }));

    res.json(formattedApplications);
  } catch (error) {
    next(error);
  }
}

export async function updateApplicationStatus(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user || req.user.role !== "employer") {
      throw createError("Employer access required", 403);
    }

    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "applied",
      "under_review",
      "shortlisted",
      "interview_scheduled",
      "hired",
      "rejected",
    ];
    if (!validStatuses.includes(status)) {
      throw createError("Invalid status", 400);
    }

    const employer = await prisma.employer.findFirst({
      where: { userId: req.user.userId },
    });

    if (!employer) {
      throw createError("Employer profile not found", 404);
    }

    // Verify application belongs to a job owned by this employer
    const application = await prisma.application.findFirst({
      where: {
        id,
        job: { employerId: employer.id },
      },
      include: {
        job: true,
        student: { include: { user: true } },
      },
    });

    if (!application) {
      throw createError("Application not found", 404);
    }

    await prisma.application.update({
      where: { id },
      data: { status },
    });

    // If hired, update student placement status
    if (status === "hired") {
      await prisma.student.update({
        where: { id: application.studentId },
        data: { placementStatus: "placed" },
      });
    } else if (status === "interview_scheduled") {
      await prisma.student.update({
        where: { id: application.studentId },
        data: { placementStatus: "interviewing" },
      });
    }

    // Create notification for student
    const statusMessages: Record<string, string> = {
      under_review: "Your application is being reviewed",
      shortlisted: "You have been shortlisted!",
      interview_scheduled: "Interview has been scheduled",
      hired: "Congratulations! You have been hired!",
      rejected: "Your application was not selected",
    };

    if (statusMessages[status]) {
      await prisma.notification.create({
        data: {
          userId: application.student.user.id,
          type: "status",
          title: `Application Update: ${application.job.title}`,
          message: statusMessages[status],
        },
      });
    }

    res.json({ message: "Application status updated successfully" });
  } catch (error) {
    next(error);
  }
}

export async function getCandidates(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user || req.user.role !== "employer") {
      throw createError("Employer access required", 403);
    }

    const employer = await prisma.employer.findFirst({
      where: { userId: req.user.userId },
      include: { jobs: { select: { skills: true } } },
    });

    if (!employer) {
      throw createError("Employer profile not found", 404);
    }

    // Get all unique skills from employer's jobs
    const jobSkills = [...new Set(employer.jobs.flatMap((j) => j.skills))];

    // Find students matching any of those skills
    const students = await prisma.student.findMany({
      where: {
        placementStatus: { not: "placed" },
      },
      include: {
        user: { select: { email: true } },
      },
    });

    // Calculate match scores using AI service
    let matchScores: Map<string, number> = new Map();

    try {
      const studentProfiles = students.map((student) => ({
        id: student.id,
        name: student.name,
        skills: student.skills,
        field_of_study: student.fieldOfStudy || undefined,
        university: student.university || undefined,
        bio: student.bio || undefined,
      }));

      const employerAggregateProfile = {
        id: employer.id,
        title: employer.companyName,
        description: employer.description || "",
        skills: jobSkills,
        requirements: [],
        location: employer.location || undefined,
        type: "mixed",
      };

      const matchResults = await getMatchScoresForJob(
        employerAggregateProfile,
        studentProfiles,
      );

      matchResults.forEach((result) => {
        matchScores.set(result.student_id, result.match_score);
      });
    } catch (e) {
      console.error("AI matching service error:", e);
    }

    const candidates = students.map((student) => {
      const matchScore = matchScores.get(student.id) || 75;

      return {
        id: student.id,
        name: student.name,
        email: student.user.email,
        fieldOfStudy: student.fieldOfStudy,
        university: student.university,
        skills: student.skills,
        location: student.location,
        availability: student.availability,
        placementStatus: student.placementStatus,
        matchScore,
        avatarUrl: student.avatarUrl,
      };
    });

    // Sort by match score
    candidates.sort((a, b) => b.matchScore - a.matchScore);

    res.json(candidates);
  } catch (error) {
    next(error);
  }
}

import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/database.js";
import { createError } from "../middleware/errorHandler.js";
import { z } from "zod";
import { getMatchScore, getMatchScoresForStudent } from "../services/matching.service.js";

const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  university: z.string().optional(),
  fieldOfStudy: z.string().optional(),
  location: z.string().optional(),
  availability: z.string().optional(),
  skills: z.array(z.string()).optional(),
  bio: z.string().optional(),
});

export async function getProfile(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user || req.user.role !== "student") {
      throw createError("Student access required", 403);
    }

    const student = await prisma.student.findFirst({
      where: { userId: req.user.userId },
      include: {
        user: { select: { email: true } },
        applications: {
          include: {
            job: {
              include: {
                employer: { select: { companyName: true, logoUrl: true } },
              },
            },
          },
          orderBy: { appliedAt: "desc" },
          take: 5,
        },
      },
    });

    if (!student) {
      throw createError("Student profile not found", 404);
    }

    res.json(student);
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
    if (!req.user || req.user.role !== "student") {
      throw createError("Student access required", 403);
    }

    const data = updateProfileSchema.parse(req.body);

    const student = await prisma.student.update({
      where: { userId: req.user.userId },
      data,
    });

    // Handle retroactive auto-application if skills were updated
    if (data.skills && data.skills.length > 0) {
      (async () => {
        try {
          // Find all active jobs the student hasn't applied to yet
          const appliedJobs = await prisma.application.findMany({
            where: { studentId: student.id },
            select: { jobId: true },
          });
          const appliedJobIds = appliedJobs.map((a) => a.jobId);

          const activeJobs = await prisma.job.findMany({
            where: {
              status: "active",
              id: { notIn: appliedJobIds },
            },
            include: { employer: true },
          });

          if (activeJobs.length > 0) {
            const studentProfile = {
              id: student.id,
              name: student.name,
              skills: student.skills,
              field_of_study: student.fieldOfStudy || undefined,
              university: student.university || undefined,
              bio: student.bio || undefined,
            };

            const jobProfiles = activeJobs.map((job) => ({
              id: job.id,
              title: job.title,
              description: job.description,
              skills: job.skills,
              requirements: job.requirements,
              location: job.location,
              type: job.type,
            }));

            const matchResults = await getMatchScoresForStudent(
              studentProfile,
              jobProfiles,
            );

            for (const result of matchResults) {
              if (result.match_score > 75) {
                const job = activeJobs.find((j) => j.id === result.job_id);
                if (!job) continue;

                // Create Application
                await prisma.application.create({
                  data: {
                    jobId: job.id,
                    studentId: student.id,
                    status: "applied",
                    matchScore: result.match_score,
                    autoApplied: true,
                  },
                });

                // Send Notification
                await prisma.notification.create({
                  data: {
                    userId: student.userId,
                    type: "application",
                    title: "Auto-Application Submitted",
                    message: `We automatically applied to "${job.title}" after your profile update because you are a >75% match!`,
                  },
                });
              }
            }
          }
        } catch (err) {
          console.error("Retroactive auto-apply background error:", err);
        }
      })();
    }

    res.json({
      message: "Profile updated successfully",
      student,
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

export async function uploadResume(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user || req.user.role !== "student") {
      throw createError("Student access required", 403);
    }

    if (!req.file) {
      throw createError("No file uploaded", 400);
    }

    const resumeUrl = `/uploads/resumes/${req.file.filename}`;

    await prisma.student.update({
      where: { userId: req.user.userId },
      data: { resumeUrl },
    });

    res.json({
      message: "Resume uploaded successfully",
      resumeUrl,
    });
  } catch (error) {
    next(error);
  }
}

export async function uploadAvatar(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user || req.user.role !== "student") {
      throw createError("Student access required", 403);
    }

    if (!req.file) {
      throw createError("No file uploaded", 400);
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    await prisma.student.update({
      where: { userId: req.user.userId },
      data: { avatarUrl },
    });

    res.json({
      message: "Avatar uploaded successfully",
      avatarUrl,
    });
  } catch (error) {
    next(error);
  }
}

export async function getApplications(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user || req.user.role !== "student") {
      throw createError("Student access required", 403);
    }

    const student = await prisma.student.findFirst({
      where: { userId: req.user.userId },
    });

    if (!student) {
      throw createError("Student profile not found", 404);
    }

    const { status } = req.query;

    const applications = await prisma.application.findMany({
      where: {
        studentId: student.id,
        ...(status && { status: status as any }),
      },
      include: {
        job: {
          include: {
            employer: {
              select: { companyName: true, logoUrl: true },
            },
          },
        },
      },
      orderBy: { appliedAt: "desc" },
    });

    // Transform to match frontend expectations
    const formattedApplications = applications.map((app) => ({
      id: app.id,
      jobId: app.jobId,
      jobTitle: app.job.title,
      company: app.job.employer.companyName,
      companyLogo: app.job.employer.logoUrl,
      status: app.status,
      appliedDate: app.appliedAt.toISOString().split("T")[0],
      matchScore: app.matchScore || 0,
      autoApplied: app.autoApplied,
    }));

    res.json(formattedApplications);
  } catch (error) {
    next(error);
  }
}

export async function applyToJob(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user || req.user.role !== "student") {
      throw createError("Student access required", 403);
    }

    const { jobId, coverLetter } = req.body;

    if (!jobId) {
      throw createError("Job ID is required", 400);
    }

    // Get student
    const student = await prisma.student.findFirst({
      where: { userId: req.user.userId },
    });

    if (!student) {
      throw createError("Student profile not found", 404);
    }

    // Check if job exists and is active
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw createError("Job not found", 404);
    }

    if (job.status !== "active") {
      throw createError("Job is no longer accepting applications", 400);
    }

    if (job.deadline && new Date(job.deadline) < new Date()) {
      throw createError("The application deadline for this job has passed", 400);
    }

    // Check if already applied
    const existingApplication = await prisma.application.findUnique({
      where: {
        jobId_studentId: {
          jobId,
          studentId: student.id,
        },
      },
    });

    if (existingApplication) {
      throw createError("You have already applied to this job", 400);
    }

    // Calculate match score using AI service
    let matchScore = 0; // Default score
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
        },
      );
      matchScore = matchResult.match_score;
    } catch (e) {
      console.error("AI matching service error, using default score:", e);
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        jobId,
        studentId: student.id,
        coverLetter,
        matchScore,
        status: "applied",
      },
      include: {
        job: {
          include: {
            employer: { select: { companyName: true } },
          },
        },
      },
    });

    // Create notification for employer
    const job2 = await prisma.job.findUnique({
      where: { id: jobId },
      include: { employer: { include: { user: true } } },
    });

    if (job2?.employer.user) {
      await prisma.notification.create({
        data: {
          userId: job2.employer.user.id,
          type: "application",
          title: "New Application",
          message: `${student.name} applied to ${job2.title}`,
        },
      });
    }

    res.status(201).json({
      message: "Application submitted successfully",
      application: {
        id: application.id,
        jobId: application.jobId,
        jobTitle: application.job.title,
        company: application.job.employer.companyName,
        status: application.status,
        matchScore: application.matchScore,
        appliedDate: application.appliedAt.toISOString().split("T")[0],
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function withdrawApplication(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user || req.user.role !== "student") {
      throw createError("Student access required", 403);
    }

    const { id } = req.params;

    const student = await prisma.student.findFirst({
      where: { userId: req.user.userId },
    });

    if (!student) {
      throw createError("Student profile not found", 404);
    }

    const application = await prisma.application.findFirst({
      where: {
        id,
        studentId: student.id,
      },
    });

    if (!application) {
      throw createError("Application not found", 404);
    }

    if (["hired", "rejected"].includes(application.status)) {
      throw createError("Cannot withdraw a finalized application", 400);
    }

    await prisma.application.update({
      where: { id },
      data: { status: "withdrawn" },
    });

    res.json({ message: "Application withdrawn successfully" });
  } catch (error) {
    next(error);
  }
}

export async function acceptApplication(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user || req.user.role !== "student") {
      throw createError("Student access required", 403);
    }

    const { id } = req.params;

    const student = await prisma.student.findFirst({
      where: { userId: req.user.userId },
    });

    if (!student) {
      throw createError("Student profile not found", 404);
    }

    const application = await prisma.application.findFirst({
      where: {
        id,
        studentId: student.id,
      },
    });

    if (!application) {
      throw createError("Application not found", 404);
    }

    await prisma.application.update({
      where: { id },
      data: { autoApplied: false },
    });

    res.json({ message: "Application accepted successfully" });
  } catch (error) {
    next(error);
  }
}

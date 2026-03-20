import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database.js';
import { createError } from '../middleware/errorHandler.js';

export async function getStudents(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { search, status, page = '1', limit = '20' } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { university: { contains: search as string, mode: 'insensitive' } },
        { fieldOfStudy: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.placementStatus = status;
    }

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        include: {
          user: { select: { email: true, createdAt: true } },
          _count: { select: { applications: true } },
        },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.student.count({ where }),
    ]);

    const formattedStudents = students.map((student) => ({
      id: student.id,
      name: student.name,
      email: student.user.email,
      fieldOfStudy: student.fieldOfStudy,
      university: student.university,
      location: student.location,
      skills: student.skills,
      placementStatus: student.placementStatus,
      applicationsCount: student._count.applications,
      joinedAt: student.user.createdAt,
    }));

    res.json({
      students: formattedStudents,
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

export async function getEmployers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { search, verified, page = '1', limit = '20' } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (search) {
      where.OR = [
        { companyName: { contains: search as string, mode: 'insensitive' } },
        { industry: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (verified !== undefined) {
      where.verified = verified === 'true';
    }

    const [employers, total] = await Promise.all([
      prisma.employer.findMany({
        where,
        include: {
          user: { select: { email: true, createdAt: true } },
          _count: { select: { jobs: true } },
        },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.employer.count({ where }),
    ]);

    // Get hired counts for each employer
    const employerIds = employers.map((e) => e.id);
    const hiredCounts = await prisma.application.groupBy({
      by: ['jobId'],
      where: {
        status: 'hired',
        job: { employerId: { in: employerIds } },
      },
      _count: true,
    });

    const formattedEmployers = employers.map((employer) => ({
      id: employer.id,
      companyName: employer.companyName,
      email: employer.user.email,
      industry: employer.industry,
      location: employer.location,
      size: employer.size,
      verified: employer.verified,
      jobsPosted: employer._count.jobs,
      hiredCount: 0, // Simplified for now
      joinedAt: employer.user.createdAt,
    }));

    res.json({
      employers: formattedEmployers,
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

export async function verifyEmployer(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { verified } = req.body;

    const employer = await prisma.employer.findUnique({ where: { id } });
    if (!employer) {
      throw createError('Employer not found', 404);
    }

    await prisma.employer.update({
      where: { id },
      data: { verified: verified ?? true },
    });

    res.json({ message: `Employer ${verified ? 'verified' : 'unverified'} successfully` });
  } catch (error) {
    next(error);
  }
}

export async function deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw createError('User not found', 404);
    }

    if (user.role === 'admin') {
      throw createError('Cannot delete admin users', 400);
    }

    await prisma.user.delete({ where: { id } });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
}

export async function getAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const [
      totalStudents,
      totalEmployers,
      totalJobs,
      activeJobs,
      totalApplications,
      placedStudents,
      studentsByStatus,
      applicationsByStatus,
      recentApplications,
    ] = await Promise.all([
      prisma.student.count(),
      prisma.employer.count(),
      prisma.job.count(),
      prisma.job.count({ where: { status: 'active' } }),
      prisma.application.count(),
      prisma.student.count({ where: { placementStatus: 'placed' } }),
      prisma.student.groupBy({
        by: ['placementStatus'],
        _count: true,
      }),
      prisma.application.groupBy({
        by: ['status'],
        _count: true,
      }),
      prisma.application.findMany({
        take: 10,
        orderBy: { appliedAt: 'desc' },
        include: {
          student: { select: { name: true } },
          job: { select: { title: true, employer: { select: { companyName: true } } } },
        },
      }),
    ]);

    // Get monthly placements for chart
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyHires = await prisma.application.findMany({
      where: {
        status: 'hired',
        updatedAt: { gte: sixMonthsAgo },
      },
      select: { updatedAt: true },
    });

    const monthlyPlacements: { month: string; count: number }[] = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthIndex = date.getMonth();
      const count = monthlyHires.filter((h) => h.updatedAt.getMonth() === monthIndex).length;
      monthlyPlacements.push({ month: months[monthIndex], count });
    }

    // Top skills from job postings
    const allJobs = await prisma.job.findMany({
      where: { status: 'active' },
      select: { skills: true },
    });
    const skillCounts: Record<string, number> = {};
    allJobs.forEach((job) => {
      job.skills.forEach((skill) => {
        skillCounts[skill] = (skillCounts[skill] || 0) + 1;
      });
    });
    const topSkills = Object.entries(skillCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([skill, count]) => ({
        skill,
        demand: Math.round((count / Math.max(allJobs.length, 1)) * 100),
      }));

    // Industry breakdown
    const employers = await prisma.employer.findMany({
      select: { industry: true },
    });
    const industryCounts: Record<string, number> = {};
    employers.forEach((emp) => {
      if (emp.industry) {
        industryCounts[emp.industry] = (industryCounts[emp.industry] || 0) + 1;
      }
    });
    const industries = Object.entries(industryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / Math.max(employers.length, 1)) * 100),
      }));

    res.json({
      totalStudents,
      placedStudents,
      activeEmployers: totalEmployers,
      totalJobs,
      activeJobs,
      placementRate: totalStudents > 0 ? Math.round((placedStudents / totalStudents) * 1000) / 10 : 0,
      industries,
      topSkills,
      monthlyPlacements,
      recentApplications: recentApplications.map((app) => ({
        id: app.id,
        studentName: app.student.name,
        jobTitle: app.job.title,
        company: app.job.employer.companyName,
        status: app.status,
        appliedAt: app.appliedAt,
      })),
    });
  } catch (error) {
    next(error);
  }
}

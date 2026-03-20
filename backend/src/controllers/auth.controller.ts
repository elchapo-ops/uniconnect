import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/database.js';
import { generateToken } from '../utils/jwt.js';
import { createError } from '../middleware/errorHandler.js';
import { z } from 'zod';

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required'),
  role: z.enum(['student', 'employer']),
  // Optional fields for student
  university: z.string().optional(),
  fieldOfStudy: z.string().optional(),
  // Optional fields for employer
  companyName: z.string().optional(),
  industry: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = registerSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw createError('Email already registered', 400);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Create user with profile
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        role: data.role,
        ...(data.role === 'student' && {
          student: {
            create: {
              name: data.name,
              university: data.university,
              fieldOfStudy: data.fieldOfStudy,
            },
          },
        }),
        ...(data.role === 'employer' && {
          employer: {
            create: {
              companyName: data.companyName || data.name,
              industry: data.industry,
            },
          },
        }),
      },
      include: {
        student: true,
        employer: true,
      },
    });

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.student?.name || user.employer?.companyName,
        profile: user.student || user.employer,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation failed', errors: error.errors });
      return;
    }
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = loginSchema.parse(req.body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: {
        student: true,
        employer: true,
      },
    });

    if (!user) {
      throw createError('Invalid email or password', 401);
    }

    // Verify password
    const validPassword = await bcrypt.compare(data.password, user.passwordHash);
    if (!validPassword) {
      throw createError('Invalid email or password', 401);
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.student?.name || user.employer?.companyName,
        profile: user.student || user.employer,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation failed', errors: error.errors });
      return;
    }
    next(error);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw createError('Not authenticated', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        student: true,
        employer: true,
      },
    });

    if (!user) {
      throw createError('User not found', 404);
    }

    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.student?.name || user.employer?.companyName,
      profile: user.student || user.employer,
    });
  } catch (error) {
    next(error);
  }
}

export async function createAdminUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Only allow creating admin if no admin exists (first-time setup)
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'admin' },
    });

    if (existingAdmin) {
      throw createError('Admin user already exists', 400);
    }

    const { email, password, name } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: 'admin',
      },
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.status(201).json({
      message: 'Admin user created',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name,
      },
    });
  } catch (error) {
    next(error);
  }
}

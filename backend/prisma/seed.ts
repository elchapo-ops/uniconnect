import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Hash password for admin user
  const hashedPassword = await bcrypt.hash("admin123", 10);

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: "admin@uniconnect.com" },
    update: {},
    create: {
      email: "admin@uniconnect.com",
      passwordHash: hashedPassword,
      role: "admin",
    },
  });

  console.log("✅ Admin user created:", {
    id: admin.id,
    email: admin.email,
    role: admin.role,
  });

  console.log("\n📧 Login credentials:");
  console.log("   Email: admin@uniconnect.com");
  console.log("   Password: admin123");

  // Optional: Create test student
  const studentPassword = await bcrypt.hash("student123", 10);
  const studentUser = await prisma.user.upsert({
    where: { email: "student@test.com" },
    update: {},
    create: {
      email: "student@test.com",
      passwordHash: studentPassword,
      role: "student",
      student: {
        create: {
          name: "Test Student",
          university: "Test University",
          fieldOfStudy: "Computer Science",
          location: "New York, NY",
          availability: "Summer 2024",
          skills: ["JavaScript", "React", "Node.js"],
          bio: "Test student account for development",
        },
      },
    },
  });

  console.log("\n✅ Test student created:", {
    id: studentUser.id,
    email: studentUser.email,
    role: studentUser.role,
  });

  console.log("\n📧 Student login credentials:");
  console.log("   Email: student@test.com");
  console.log("   Password: student123");

  // Optional: Create test employer
  const employerPassword = await bcrypt.hash("employer123", 10);
  const employerUser = await prisma.user.upsert({
    where: { email: "employer@test.com" },
    update: {},
    create: {
      email: "employer@test.com",
      passwordHash: employerPassword,
      role: "employer",
      employer: {
        create: {
          companyName: "Test Company Inc.",
          industry: "Technology",
          location: "San Francisco, CA",
          size: "50-100",
          description: "A test company for development purposes",
          website: "https://testcompany.com",
          verified: true,
        },
      },
    },
  });

  console.log("\n✅ Test employer created:", {
    id: employerUser.id,
    email: employerUser.email,
    role: employerUser.role,
  });

  console.log("\n📧 Employer login credentials:");
  console.log("   Email: employer@test.com");
  console.log("   Password: employer123");

  console.log("\n🎉 Database seeding completed!\n");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

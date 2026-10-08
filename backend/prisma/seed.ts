import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean existing data
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // Create demo user
  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = await prisma.user.create({
    data: {
      fullName: 'Alex Morgan',
      email: 'demo@example.com',
      password: hashedPassword,
    },
  });

  console.log(`👤 Created user: ${user.fullName} (${user.email})`);

  // Create Sample Projects
  const project1 = await prisma.project.create({
    data: {
      name: 'Mobile App Redesign',
      description: 'Revamping the user onboarding flow and navigation architecture for Android and iOS.',
      status: 'In Progress',
      startDate: new Date('2026-09-01'),
      endDate: new Date('2026-11-15'),
      userId: user.id,
      tasks: {
        create: [
          {
            name: 'Design Figma Wireframes',
            description: 'Create high-fidelity screens for login, dashboard, and task views.',
            priority: 'High',
            status: 'Completed',
            dueDate: new Date('2026-09-20'),
          },
          {
            name: 'Implement Secure Token Storage',
            description: 'Integrate expo-secure-store for Android Keystore and iOS Keychain encryption.',
            priority: 'High',
            status: 'In Progress',
            dueDate: new Date('2026-10-15'),
          },
          {
            name: 'Build Pull-to-Refresh Component',
            description: 'Add RefreshControl on project and task screens.',
            priority: 'Medium',
            status: 'Pending',
            dueDate: new Date('2026-10-25'),
          },
        ],
      },
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'Backend API Scalability',
      description: 'Optimize queries, add rate limiting, and write automated integration tests.',
      status: 'In Progress',
      startDate: new Date('2026-09-15'),
      endDate: new Date('2026-11-01'),
      userId: user.id,
      tasks: {
        create: [
          {
            name: 'Setup Rate Limiting',
            description: 'Prevent brute force attacks on /api/auth routes with express-rate-limit.',
            priority: 'High',
            status: 'Completed',
            dueDate: new Date('2026-09-30'),
          },
          {
            name: 'Add Swagger Documentation',
            description: 'Document all REST endpoints and schemas in OpenAPI 3.0 specification.',
            priority: 'Medium',
            status: 'Completed',
            dueDate: new Date('2026-10-05'),
          },
          {
            name: 'Write Jest API Integration Tests',
            description: 'Test auth validation, project isolation, and task filtering endpoints.',
            priority: 'Medium',
            status: 'Pending',
            dueDate: new Date('2026-10-20'),
          },
        ],
      },
    },
  });

  const project3 = await prisma.project.create({
    data: {
      name: 'Q4 Product Roadmap',
      description: 'Planning strategic features, hiring milestones, and marketing launch timeline.',
      status: 'Not Started',
      startDate: new Date('2026-11-01'),
      endDate: new Date('2026-12-31'),
      userId: user.id,
      tasks: {
        create: [
          {
            name: 'Stakeholder Interviews',
            description: 'Gather feedback from client product teams.',
            priority: 'Low',
            status: 'Pending',
            dueDate: new Date('2026-11-10'),
          },
        ],
      },
    },
  });

  const project4 = await prisma.project.create({
    data: {
      name: 'Security Audit & Compliance',
      description: 'Validate SQL injection protections, password hashing, and token expiration handling.',
      status: 'Completed',
      startDate: new Date('2026-08-01'),
      endDate: new Date('2026-09-10'),
      userId: user.id,
      tasks: {
        create: [
          {
            name: 'Penetration Testing on Auth Routes',
            description: 'Ensure token spoofing is impossible and brute force is blocked.',
            priority: 'High',
            status: 'Completed',
            dueDate: new Date('2026-08-25'),
          },
        ],
      },
    },
  });

  console.log(`✅ Created 4 projects with sample tasks!`);
  console.log('Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

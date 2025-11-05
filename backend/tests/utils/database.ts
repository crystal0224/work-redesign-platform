import { PrismaClient } from '@prisma/client';

export async function clearDatabase(prisma: PrismaClient): Promise<void> {
  // Clear all tables in the correct order (respecting foreign key constraints)
  await prisma.taskUpdate.deleteMany();
  await prisma.scenarioStep.deleteMany();
  await prisma.scenario.deleteMany();
  await prisma.workshopParticipant.deleteMany();
  await prisma.task.deleteMany();
  await prisma.workshop.deleteMany();
  await prisma.user.deleteMany();
}

export async function seedTestData(prisma: PrismaClient): Promise<{
  user: any;
  workshop: any;
  tasks: any[];
}> {
  // Create test user
  const user = await prisma.user.create({
    data: {
      email: 'test@sk.com',
      password: '$2b$10$hash', // This would be properly hashed in real code
      name: 'Test User',
      department: 'IT',
      position: 'Manager'
    }
  });

  // Create test workshop
  const workshop = await prisma.workshop.create({
    data: {
      title: 'Test Workshop',
      description: 'Test workshop for unit tests',
      createdById: user.id,
      status: 'DRAFT',
      settings: {
        timeLimit: 35,
        maxParticipants: 10,
        enableChat: true,
        enableFileUpload: true
      }
    }
  });

  // Create test tasks
  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        title: 'Test Task 1',
        description: 'First test task',
        workshopId: workshop.id,
        status: 'BACKLOG',
        priority: 'HIGH',
        estimatedHours: 2,
        assignedToId: user.id,
        position: 0
      }
    }),
    prisma.task.create({
      data: {
        title: 'Test Task 2',
        description: 'Second test task',
        workshopId: workshop.id,
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        estimatedHours: 4,
        assignedToId: user.id,
        position: 1
      }
    })
  ]);

  return { user, workshop, tasks };
}

export function createMockUser(overrides: Partial<any> = {}) {
  return {
    id: 'user-123',
    email: 'mock@sk.com',
    name: 'Mock User',
    department: 'IT',
    position: 'Manager',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  };
}

export function createMockWorkshop(overrides: Partial<any> = {}) {
  return {
    id: 'workshop-123',
    title: 'Mock Workshop',
    description: 'Mock workshop for testing',
    status: 'DRAFT',
    createdById: 'user-123',
    settings: {
      timeLimit: 35,
      maxParticipants: 10,
      enableChat: true,
      enableFileUpload: true
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  };
}

export function createMockTask(overrides: Partial<any> = {}) {
  return {
    id: 'task-123',
    title: 'Mock Task',
    description: 'Mock task for testing',
    workshopId: 'workshop-123',
    status: 'BACKLOG',
    priority: 'HIGH',
    estimatedHours: 2,
    assignedToId: 'user-123',
    position: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  };
}
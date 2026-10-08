"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../src/app"));
const prisma_1 = require("../src/db/prisma");
describe('Project Management System API Tests', () => {
    const testUser = {
        fullName: 'Test Automation User',
        email: `test_${Date.now()}@example.com`,
        password: 'Password123!',
    };
    let authToken;
    let createdProjectId;
    let createdTaskId;
    afterAll(async () => {
        // Cleanup created test data
        if (testUser.email) {
            await prisma_1.prisma.user.deleteMany({
                where: { email: testUser.email },
            });
        }
        await prisma_1.prisma.$disconnect();
    });
    describe('Health Check Endpoint', () => {
        it('GET /health should return 200 and healthy status', async () => {
            const res = await (0, supertest_1.default)(app_1.default).get('/health');
            expect(res.status).toBe(200);
            expect(res.body.status).toBe('healthy');
        });
    });
    describe('Authentication Endpoints', () => {
        it('POST /api/auth/register should register a new user', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/register')
                .send(testUser);
            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.token).toBeDefined();
            expect(res.body.user.email).toBe(testUser.email.toLowerCase());
            authToken = res.body.token;
        });
        it('POST /api/auth/register should fail on duplicate email', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/register')
                .send(testUser);
            expect(res.status).toBe(409);
            expect(res.body.success).toBe(false);
        });
        it('POST /api/auth/register should fail on validation error (short password)', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/register')
                .send({
                fullName: 'Test',
                email: 'invalid@example.com',
                password: '123',
            });
            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.errors).toBeDefined();
        });
        it('POST /api/auth/login should authenticate valid credentials', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/login')
                .send({
                email: testUser.email,
                password: testUser.password,
            });
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.token).toBeDefined();
        });
        it('POST /api/auth/login should reject invalid credentials', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/login')
                .send({
                email: testUser.email,
                password: 'WrongPassword999',
            });
            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });
        it('GET /api/auth/me should return 401 when token is missing', async () => {
            const res = await (0, supertest_1.default)(app_1.default).get('/api/auth/me');
            expect(res.status).toBe(401);
        });
        it('GET /api/auth/me should return user details with valid token', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${authToken}`);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.user.email).toBe(testUser.email.toLowerCase());
        });
    });
    describe('Project Management Endpoints', () => {
        it('POST /api/projects should create a new project', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/projects')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                name: 'Jest Automated Project',
                description: 'Project created via supertest integration',
                status: 'In Progress',
                startDate: '2026-10-01T00:00:00.000Z',
                endDate: '2026-12-01T00:00:00.000Z',
            });
            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.project.name).toBe('Jest Automated Project');
            expect(res.body.project.status).toBe('In Progress');
            createdProjectId = res.body.project.id;
        });
        it('GET /api/projects should return projects and support search', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/projects?search=Jest')
                .set('Authorization', `Bearer ${authToken}`);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.projects)).toBe(true);
            expect(res.body.projects.length).toBeGreaterThanOrEqual(1);
        });
        it('GET /api/projects/:id should return project details', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .get(`/api/projects/${createdProjectId}`)
                .set('Authorization', `Bearer ${authToken}`);
            expect(res.status).toBe(200);
            expect(res.body.project.id).toBe(createdProjectId);
        });
        it('PUT /api/projects/:id should update project', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .put(`/api/projects/${createdProjectId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                status: 'Completed',
            });
            expect(res.status).toBe(200);
            expect(res.body.project.status).toBe('Completed');
        });
    });
    describe('Task Management Endpoints', () => {
        it('POST /api/tasks should create a task under project', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/tasks')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                name: 'Jest Automated Task',
                description: 'Task under jest project',
                priority: 'High',
                status: 'Pending',
                dueDate: '2026-11-15T00:00:00.000Z',
                projectId: createdProjectId,
            });
            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.task.name).toBe('Jest Automated Task');
            expect(res.body.task.priority).toBe('High');
            createdTaskId = res.body.task.id;
        });
        it('GET /api/tasks should filter by priority and status', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/tasks?priority=High&status=Pending')
                .set('Authorization', `Bearer ${authToken}`);
            expect(res.status).toBe(200);
            expect(res.body.tasks.some((t) => t.id === createdTaskId)).toBe(true);
        });
        it('PUT /api/tasks/:id should update task status to Completed', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .put(`/api/tasks/${createdTaskId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                status: 'Completed',
            });
            expect(res.status).toBe(200);
            expect(res.body.task.status).toBe('Completed');
        });
    });
    describe('Dashboard Endpoint', () => {
        it('GET /api/dashboard should return computed statistics for user', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/dashboard')
                .set('Authorization', `Bearer ${authToken}`);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.totalProjects).toBeGreaterThanOrEqual(1);
            expect(res.body.data.totalTasks).toBeGreaterThanOrEqual(1);
            expect(res.body.data.completedTasks).toBeGreaterThanOrEqual(1);
        });
    });
});

import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';

export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Project Management System API',
    version: '1.0.0',
    description: 'REST API serving both Web and Mobile client applications for Project & Task Management',
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Local Development Server',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          fullName: { type: 'string', example: 'Alex Morgan' },
          email: { type: 'string', format: 'email', example: 'alex@example.com' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Project: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string', example: 'Mobile Redesign' },
          description: { type: 'string', example: 'Redesigning mobile UI' },
          status: {
            type: 'string',
            enum: ['Not Started', 'In Progress', 'Completed'],
            example: 'In Progress',
          },
          startDate: { type: 'string', format: 'date-time', nullable: true },
          endDate: { type: 'string', format: 'date-time', nullable: true },
          userId: { type: 'string', format: 'uuid' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Task: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string', example: 'Create wireframes' },
          description: { type: 'string', example: 'Draft initial wireframes in Figma' },
          priority: {
            type: 'string',
            enum: ['Low', 'Medium', 'High'],
            example: 'High',
          },
          status: {
            type: 'string',
            enum: ['Pending', 'In Progress', 'Completed'],
            example: 'Pending',
          },
          dueDate: { type: 'string', format: 'date-time', nullable: true },
          projectId: { type: 'string', format: 'uuid' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      DashboardStats: {
        type: 'object',
        properties: {
          totalProjects: { type: 'integer', example: 5 },
          totalTasks: { type: 'integer', example: 18 },
          completedTasks: { type: 'integer', example: 8 },
          pendingTasks: { type: 'integer', example: 6 },
          projectsInProgress: { type: 'integer', example: 3 },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Error message description' },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string' },
                message: { type: 'string' },
              },
            },
          },
        },
      },
    },
  },
  security: [
    {
      BearerAuth: [],
    },
  ],
  paths: {
    '/api/auth/register': {
      post: {
        summary: 'Register a new user',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['fullName', 'email', 'password'],
                properties: {
                  fullName: { type: 'string', example: 'John Doe' },
                  email: { type: 'string', example: 'john@example.com' },
                  password: { type: 'string', minLength: 6, example: 'secretPass123' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Registration successful' },
          400: { description: 'Validation failed' },
          409: { description: 'Email already exists' },
        },
      },
    },
    '/api/auth/login': {
      post: {
        summary: 'Log in an existing user',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'john@example.com' },
                  password: { type: 'string', example: 'secretPass123' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Login successful' },
          401: { description: 'Invalid credentials' },
        },
      },
    },
    '/api/auth/logout': {
      post: {
        summary: 'Log out current user',
        responses: {
          200: { description: 'Logged out successfully' },
        },
      },
    },
    '/api/auth/me': {
      get: {
        summary: 'Get current user profile',
        responses: {
          200: { description: 'Authenticated user profile' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/projects': {
      get: {
        summary: 'Get all projects owned by authenticated user',
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['All', 'Not Started', 'In Progress', 'Completed'] } },
          { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['name', 'createdAt', 'startDate', 'endDate', 'status'] } },
          { name: 'order', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] } },
        ],
        responses: {
          200: { description: 'List of projects' },
        },
      },
      post: {
        summary: 'Create a new project',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  status: { type: 'string', enum: ['Not Started', 'In Progress', 'Completed'] },
                  startDate: { type: 'string', format: 'date-time' },
                  endDate: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Project created successfully' },
        },
      },
    },
    '/api/projects/{id}': {
      get: {
        summary: 'Get project details and its tasks',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Project details' },
          404: { description: 'Project not found' },
        },
      },
      put: {
        summary: 'Update an existing project',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  status: { type: 'string', enum: ['Not Started', 'In Progress', 'Completed'] },
                  startDate: { type: 'string', format: 'date-time' },
                  endDate: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Project updated' },
        },
      },
      delete: {
        summary: 'Delete a project and its tasks',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Project deleted' },
        },
      },
    },
    '/api/tasks': {
      get: {
        summary: 'Get tasks across projects with search and filters',
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['All', 'Pending', 'In Progress', 'Completed'] } },
          { name: 'priority', in: 'query', schema: { type: 'string', enum: ['All', 'Low', 'Medium', 'High'] } },
          { name: 'projectId', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'List of tasks' },
        },
      },
      post: {
        summary: 'Create a new task',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'projectId'],
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  priority: { type: 'string', enum: ['Low', 'Medium', 'High'] },
                  status: { type: 'string', enum: ['Pending', 'In Progress', 'Completed'] },
                  dueDate: { type: 'string', format: 'date-time' },
                  projectId: { type: 'string', format: 'uuid' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Task created' },
        },
      },
    },
    '/api/tasks/{id}': {
      get: {
        summary: 'Get task by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Task details' },
        },
      },
      put: {
        summary: 'Update task',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  priority: { type: 'string', enum: ['Low', 'Medium', 'High'] },
                  status: { type: 'string', enum: ['Pending', 'In Progress', 'Completed'] },
                  dueDate: { type: 'string', format: 'date-time' },
                  projectId: { type: 'string', format: 'uuid' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Task updated' },
        },
      },
      delete: {
        summary: 'Delete task',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Task deleted' },
        },
      },
    },
    '/api/dashboard': {
      get: {
        summary: 'Get user dashboard statistics',
        responses: {
          200: {
            description: 'Dashboard metrics',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/DashboardStats',
                },
              },
            },
          },
        },
      },
    },
  },
};

export const setupSwagger = (app: Application): void => {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'Project Management API Docs',
  }));
  app.get('/api/docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
};

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config';
import authRoutes from './routes/auth.routes';
import projectRoutes from './routes/project.routes';
import taskRoutes from './routes/task.routes';
import dashboardRoutes from './routes/dashboard.routes';
import { errorHandler } from './middleware/errorHandler';
import { apiRateLimiter } from './middleware/rateLimiter';
import { setupSwagger } from './docs/swagger';

const app: Application = express();

// Middlewares
app.use(morgan(config.nodeEnv === 'development' ? 'dev' : 'combined'));
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow mobile apps, curl, Postman (where origin is undefined) or configured web origins
      if (!origin || config.corsOrigin === '*' || (Array.isArray(config.corsOrigin) && config.corsOrigin.includes(origin))) {
        callback(null, true);
      } else {
        callback(null, true); // Dev-friendly permissive CORS
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiter on general API requests
app.use('/api', apiRateLimiter);

// Setup Swagger API Documentation at /api/docs
setupSwagger(app);

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 404 Not Found Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl} - Route not found`,
  });
});

// Centralized Error Handler
app.use(errorHandler);

export default app;

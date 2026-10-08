import { z } from 'zod';

export const taskPriorityEnum = z.enum(['Low', 'Medium', 'High']);
export const taskStatusEnum = z.enum(['Pending', 'In Progress', 'Completed']);

export const createTaskSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Task name cannot be empty')
    .max(150, 'Task name cannot exceed 150 characters'),
  description: z.string().trim().optional().nullable(),
  priority: taskPriorityEnum.optional().default('Medium'),
  status: taskStatusEnum.optional().default('Pending'),
  dueDate: z
    .string()
    .optional()
    .nullable()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: 'Invalid due date format',
    }),
  projectId: z.string().uuid('Invalid project ID'),
});

export const updateTaskSchema = z.object({
  name: z.string().trim().min(1, 'Task name cannot be empty').max(150).optional(),
  description: z.string().trim().optional().nullable(),
  priority: taskPriorityEnum.optional(),
  status: taskStatusEnum.optional(),
  dueDate: z
    .string()
    .optional()
    .nullable()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: 'Invalid due date format',
    }),
  projectId: z.string().uuid('Invalid project ID').optional(),
});

export const taskQuerySchema = z.object({
  search: z.string().trim().optional(),
  status: z.string().trim().optional(),
  priority: z.string().trim().optional(),
  projectId: z.string().uuid('Invalid project ID').optional(),
  sortBy: z.enum(['name', 'dueDate', 'priority', 'status', 'createdAt']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskQueryInput = z.infer<typeof taskQuerySchema>;

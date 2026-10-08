import { z } from 'zod';

export const projectStatusEnum = z.enum(['Not Started', 'In Progress', 'Completed']);

export const createProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Project name cannot be empty')
    .max(150, 'Project name cannot exceed 150 characters'),
  description: z.string().trim().optional().nullable(),
  status: projectStatusEnum.optional().default('Not Started'),
  startDate: z
    .string()
    .optional()
    .nullable()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: 'Invalid start date format',
    }),
  endDate: z
    .string()
    .optional()
    .nullable()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: 'Invalid end date format',
    }),
});

export const updateProjectSchema = createProjectSchema.partial();

export const projectQuerySchema = z.object({
  search: z.string().trim().optional(),
  status: z.string().trim().optional(),
  sortBy: z.enum(['name', 'createdAt', 'startDate', 'endDate', 'status']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ProjectQueryInput = z.infer<typeof projectQuerySchema>;

import { Response, NextFunction } from 'express';
import { prisma } from '../db/prisma';
import { AuthRequest } from '../types';
import { CreateTaskInput, UpdateTaskInput } from '../schemas/task.schema';

export const getTasks = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const {
      search,
      status,
      priority,
      projectId,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query as any;

    const whereClause: any = {
      project: {
        userId,
      },
    };

    if (projectId) {
      whereClause.projectId = projectId;
    }

    if (search && typeof search === 'string') {
      whereClause.name = {
        contains: search,
      };
    }

    if (status && typeof status === 'string' && status !== 'All') {
      whereClause.status = status;
    }

    if (priority && typeof priority === 'string' && priority !== 'All') {
      whereClause.priority = priority;
    }

    const validSortFields = ['name', 'dueDate', 'priority', 'status', 'createdAt'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sortOrder = order === 'asc' ? 'asc' : 'desc';

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        [sortField]: sortOrder,
      },
    });

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    next(error);
  }
};

export const getTaskById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const id = req.params.id as string;

    const task = await prisma.task.findFirst({
      where: {
        id,
        project: {
          userId,
        },
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!task) {
      res.status(404).json({
        success: false,
        message: 'Task not found or you do not have permission to access it',
      });
      return;
    }

    res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    next(error);
  }
};

export const createTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { name, description, priority, status, dueDate, projectId }: CreateTaskInput = req.body;

    // Verify project belongs to authenticated user
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId,
      },
    });

    if (!project) {
      res.status(404).json({
        success: false,
        message: 'Specified project does not exist or does not belong to you',
      });
      return;
    }

    const task = await prisma.task.create({
      data: {
        name,
        description: description || null,
        priority: priority || 'Medium',
        status: status || 'Pending',
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const id = req.params.id as string;
    const updateData: UpdateTaskInput = req.body;

    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        project: {
          userId,
        },
      },
    });

    if (!existingTask) {
      res.status(404).json({
        success: false,
        message: 'Task not found or you do not have permission to modify it',
      });
      return;
    }

    if (updateData.projectId && updateData.projectId !== existingTask.projectId) {
      const targetProject = await prisma.project.findFirst({
        where: {
          id: updateData.projectId,
          userId,
        },
      });

      if (!targetProject) {
        res.status(404).json({
          success: false,
          message: 'Target project does not exist or does not belong to you',
        });
        return;
      }
    }

    const payload: any = { ...updateData };
    if (updateData.dueDate !== undefined) {
      payload.dueDate = updateData.dueDate ? new Date(updateData.dueDate) : null;
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: payload,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      task: updatedTask,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const id = req.params.id as string;

    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        project: {
          userId,
        },
      },
    });

    if (!existingTask) {
      res.status(404).json({
        success: false,
        message: 'Task not found or you do not have permission to delete it',
      });
      return;
    }

    await prisma.task.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

import { Response, NextFunction } from 'express';
import { prisma } from '../db/prisma';
import { AuthRequest } from '../types';
import { CreateProjectInput, UpdateProjectInput } from '../schemas/project.schema';

export const getProjects = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { search, status, sortBy = 'createdAt', order = 'desc' } = req.query as any;

    const whereClause: any = {
      userId,
    };

    if (search && typeof search === 'string') {
      whereClause.name = {
        contains: search,
      };
    }

    if (status && typeof status === 'string' && status !== 'All') {
      whereClause.status = status;
    }

    const validSortFields = ['name', 'createdAt', 'startDate', 'endDate', 'status'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sortOrder = order === 'asc' ? 'asc' : 'desc';

    const projects = await prisma.project.findMany({
      where: whereClause,
      include: {
        _count: {
          select: { tasks: true },
        },
      },
      orderBy: {
        [sortField]: sortOrder,
      },
    });

    res.status(200).json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    next(error);
  }
};

export const getProjectById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const id = req.params.id as string;

    const project = await prisma.project.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        tasks: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!project) {
      res.status(404).json({
        success: false,
        message: 'Project not found or you do not have permission to access it',
      });
      return;
    }

    res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    next(error);
  }
};

export const createProject = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { name, description, status, startDate, endDate }: CreateProjectInput = req.body;

    const project = await prisma.project.create({
      data: {
        name,
        description: description || null,
        status: status || 'Not Started',
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        userId,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      project,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const id = req.params.id as string;
    const updateData: UpdateProjectInput = req.body;

    const existingProject = await prisma.project.findFirst({
      where: { id, userId },
    });

    if (!existingProject) {
      res.status(404).json({
        success: false,
        message: 'Project not found or you do not have permission to modify it',
      });
      return;
    }

    const payload: any = { ...updateData };
    if (updateData.startDate !== undefined) {
      payload.startDate = updateData.startDate ? new Date(updateData.startDate) : null;
    }
    if (updateData.endDate !== undefined) {
      payload.endDate = updateData.endDate ? new Date(updateData.endDate) : null;
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data: payload,
    });

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      project: updatedProject,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const id = req.params.id as string;

    const existingProject = await prisma.project.findFirst({
      where: { id, userId },
    });

    if (!existingProject) {
      res.status(404).json({
        success: false,
        message: 'Project not found or you do not have permission to delete it',
      });
      return;
    }

    await prisma.project.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: 'Project and all associated tasks deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

import { Response, NextFunction } from 'express';
import { prisma } from '../db/prisma';
import { AuthRequest } from '../types';

export const getDashboardStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;

    // Run parallel counts for performance
    const [
      totalProjects,
      projectsInProgress,
      projectsNotStarted,
      projectsCompleted,
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      recentProjects,
      upcomingTasks,
    ] = await Promise.all([
      // Total Projects
      prisma.project.count({
        where: { userId },
      }),
      // Projects In Progress
      prisma.project.count({
        where: { userId, status: 'In Progress' },
      }),
      // Projects Not Started
      prisma.project.count({
        where: { userId, status: 'Not Started' },
      }),
      // Projects Completed
      prisma.project.count({
        where: { userId, status: 'Completed' },
      }),
      // Total Tasks
      prisma.task.count({
        where: { project: { userId } },
      }),
      // Completed Tasks
      prisma.task.count({
        where: { project: { userId }, status: 'Completed' },
      }),
      // Pending Tasks
      prisma.task.count({
        where: { project: { userId }, status: 'Pending' },
      }),
      // Tasks In Progress
      prisma.task.count({
        where: { project: { userId }, status: 'In Progress' },
      }),
      // Recent Projects (up to 5)
      prisma.project.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          _count: {
            select: { tasks: true },
          },
        },
      }),
      // Upcoming Tasks (due soon)
      prisma.task.findMany({
        where: {
          project: { userId },
          status: { not: 'Completed' },
          dueDate: { not: null },
        },
        orderBy: { dueDate: 'asc' },
        take: 5,
        include: {
          project: {
            select: { id: true, name: true },
          },
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalProjects,
        totalTasks,
        completedTasks,
        pendingTasks,
        projectsInProgress,
        // Detailed breakdowns
        breakdown: {
          projects: {
            notStarted: projectsNotStarted,
            inProgress: projectsInProgress,
            completed: projectsCompleted,
          },
          tasks: {
            pending: pendingTasks,
            inProgress: inProgressTasks,
            completed: completedTasks,
          },
        },
        recentProjects,
        upcomingTasks,
      },
    });
  } catch (error) {
    next(error);
  }
};

import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { prisma } from '../db/prisma';
import { AuthRequest, JwtPayload } from '../types';

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Authentication token is missing or malformed',
      });
      return;
    }

    const token = authHeader.split(' ')[1];

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        res.status(401).json({
          success: false,
          code: 'TOKEN_EXPIRED',
          message: 'Your session has expired. Please log in again.',
        });
        return;
      }
      res.status(401).json({
        success: false,
        code: 'TOKEN_INVALID',
        message: 'Invalid authentication token',
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User belonging to this token no longer exists',
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

import { Request } from 'express';

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  createdAt: Date;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export interface JwtPayload {
  userId: string;
  email: string;
}

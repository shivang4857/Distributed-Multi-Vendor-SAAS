import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ValidationError } from '@packages/error-handler';
import prisma from '@packages/libs/prisma';

export const isAuthenticated = async(req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies['auth_token'];
    if (!token) {
      return next(new ValidationError('Authentication token is missing.'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      role: string;
    };
    if (!decoded) {
      return next(new ValidationError('Invalid authentication token.'));
    }
    const account = await prisma.users.findUnique({
      where: { id: decoded.userId }
    });
    if (!account) {
      return next(new ValidationError('User not found.'));
    }

    return next();
  } catch (error) {
    return next(error);
  }
}
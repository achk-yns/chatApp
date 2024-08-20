import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { StatusCode } from '../enums/status-code.enum';
import User from '../models/user';
import { IUser } from '../interfaces/user';

interface AuthRequest extends Request {
  user?: IUser | null;
}

interface JwtPayload {
  id: string;
  iat: number;
  exp: number;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(StatusCode.UNAUTHORIZED).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    const user = await User.findById(decode.id);

    if (!user) {
      return res.status(StatusCode.UNAUTHORIZED).json({ msg: 'User not found, authorization denied' });
    }

    req.user = user; 
    next();
  } catch (err) {
    res.status(StatusCode.UNAUTHORIZED).json({ msg: 'Token is not valid' });
  }
};

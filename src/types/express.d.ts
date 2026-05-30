import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        orgId: number;
        role: 'ADMIN' | 'MANAGER' | 'MEMBER';
      };
    }
  }
}
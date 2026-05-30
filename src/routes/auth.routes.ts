import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middlewares/validate.middleware';
import { authController } from '../controllers/auth.controller';

const router = Router();

const registerSchema = z.object({
  orgId: z.number().positive(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(['ADMIN', 'MANAGER', 'MEMBER']).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);

export default router;
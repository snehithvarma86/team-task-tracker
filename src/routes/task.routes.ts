// src/routes/task.routes.ts
import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middlewares/validate.middleware';
import { verifyToken } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/rbac.middleware';
import { taskController } from '../controllers/task.controller';

const router = Router();

const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  assigneeId: z.number().positive().optional(),
  dueDate: z.string().datetime().optional(), // ISO string format
});

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'BLOCKED']).optional(),
  assigneeId: z.number().positive().optional(),
  dueDate: z.string().datetime().optional(),
});

router.use(verifyToken);

router.post('/', validate(createTaskSchema), taskController.create);

router.get('/', taskController.getAll);

router.patch('/:id', validate(updateTaskSchema), taskController.update);

router.delete('/:id', requireRole(['ADMIN', 'MANAGER']), taskController.delete);

export default router;
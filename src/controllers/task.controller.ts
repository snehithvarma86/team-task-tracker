import { Request, Response, NextFunction } from 'express';
import { taskService } from '../services/task.service';
import { cacheService } from '../services/cache.service';

export const taskController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await taskService.createTask(req.body, req.user);
      res.status(201).json({ status: 201, data: result });
    } catch (error) { next(error); }
  },

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const queryHash = new URLSearchParams(req.query as any).toString();
      const cacheKey = `tasks:user:${req.user!.id}:${queryHash}`;

      const cachedData = await cacheService.get(cacheKey);
      if (cachedData) {
         res.setHeader('X-Cache', 'HIT');
         return res.status(200).json({ status: 200, ...cachedData });
      }

      const result = await taskService.getTasks(req.query, req.user);

      await cacheService.set(cacheKey, result);
      
      res.setHeader('X-Cache', 'MISS');
      res.status(200).json({ status: 200, ...result });
    } catch (error) { next(error); }
    },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const taskId = parseInt(req.params.id[0]);
      const result = await taskService.updateTask(taskId, req.body, req.user);
      res.status(200).json({ status: 200, data: result });
    } catch (error) { next(error); }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const taskId = parseInt(req.params.id[0]);
      await taskService.deleteTask(taskId, req.user);
      res.status(204).send();
    } catch (error) { next(error); }
  }
};
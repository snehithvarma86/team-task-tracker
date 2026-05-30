// src/controllers/task.controller.ts
import { Request, Response, NextFunction } from 'express';
import { taskService } from '../services/task.service';

export const taskController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await taskService.createTask(req.body, req.user);
      res.status(201).json({ status: 201, data: result });
    } catch (error) { next(error); }
  },

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await taskService.getTasks(req.query, req.user);
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
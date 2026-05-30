// src/services/task.service.ts
import { eq, and, desc } from 'drizzle-orm';
import { db } from '../config/db';
import { tasks } from '../db/schema/tasks';
import { createAppError } from '../utils/errors';

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  TODO: ['IN_PROGRESS', 'BLOCKED'],
  IN_PROGRESS: ['IN_REVIEW', 'BLOCKED'],
  IN_REVIEW: ['DONE', 'BLOCKED'],
  DONE: ['BLOCKED'],
  BLOCKED: ['TODO', 'IN_PROGRESS'],
};

export const taskService = {
  async createTask(data: any, user: any) {
    const [newTask] = await db.insert(tasks).values({
      orgId: user.orgId,
      title: data.title,
      description: data.description,
      priority: data.priority || 'MEDIUM',
      status: 'TODO',
      assigneeId: data.assigneeId,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
    }).returning();

    return newTask;
  },

  async getTasks(query: any, user: any) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const offset = (page - 1) * limit;

    const filters = [eq(tasks.orgId, user.orgId)];
    
    if (query.status) filters.push(eq(tasks.status, query.status));
    if (query.priority) filters.push(eq(tasks.priority, query.priority));
    if (query.assigneeId) filters.push(eq(tasks.assigneeId, parseInt(query.assigneeId)));

    const result = await db.select()
      .from(tasks)
      .where(and(...filters))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(tasks.createdAt));

    return {
      data: result,
      meta: { page, limit },
    };
  },

  async updateTask(taskId: number, data: any, user: any) {
    const [existingTask] = await db.select().from(tasks).where(eq(tasks.id, taskId)).limit(1);

    if (!existingTask || existingTask.orgId !== user.orgId) {
      throw createAppError(404, 'NOT_FOUND', 'Task not found');
    }

    if (data.status && data.status !== existingTask.status) {
      if (user.role === 'MEMBER' && existingTask.assigneeId !== user.id) {
        throw createAppError(403, 'FORBIDDEN', 'Members can only update their own assigned tasks');
      }

      const allowedNextStates = ALLOWED_TRANSITIONS[existingTask.status] || [];
      if (!allowedNextStates.includes(data.status)) {
        throw createAppError(
          400, 
          'INVALID_TRANSITION', 
          `Cannot transition task from ${existingTask.status} to ${data.status}`
        );
      }
    }

    const [updatedTask] = await db.update(tasks)
      .set({
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, taskId))
      .returning();

    return updatedTask;
  },

  async deleteTask(taskId: number, user: any) {
    const [existingTask] = await db.select().from(tasks).where(eq(tasks.id, taskId)).limit(1);
    if (!existingTask || existingTask.orgId !== user.orgId) {
      throw createAppError(404, 'NOT_FOUND', 'Task not found');
    }

    await db.delete(tasks).where(eq(tasks.id, taskId));
    return { success: true };
  }
};
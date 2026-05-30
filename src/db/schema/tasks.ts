// src/db/schema/tasks.ts
import { pgTable, serial, varchar, timestamp, integer, pgEnum, text, index } from 'drizzle-orm/pg-core';
import { organizations, users } from './users';

export const priorityEnum = pgEnum('priority', ['LOW', 'MEDIUM', 'HIGH']);
export const statusEnum = pgEnum('status', ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'BLOCKED']);

export const tasks = pgTable('tasks', {
  id: serial('id').primaryKey(),
  orgId: integer('org_id').references(() => organizations.id).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  priority: priorityEnum('priority').default('MEDIUM').notNull(),
  status: statusEnum('status').default('TODO').notNull(),
  assigneeId: integer('assignee_id').references(() => users.id),
  dueDate: timestamp('due_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    statusIdx: index('status_idx').on(table.status),
    assigneeIdx: index('assignee_idx').on(table.assigneeId),
    dueDateIdx: index('due_date_idx').on(table.dueDate),
  };
});
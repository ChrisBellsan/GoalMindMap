import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const goals = pgTable("goals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  text: text("text").notNull(),
  type: varchar("type", { length: 20 }).notNull(), // 'daily', 'weekly', 'monthly', 'yearly'
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  // Scheduling fields (optional based on type)
  dayOfWeek: integer("day_of_week"), // 0-6 for weekly goals (0 = Sunday)
  dayOfMonth: integer("day_of_month"), // 1-31 for monthly/yearly goals
  month: integer("month"), // 0-11 for yearly goals (0 = January)
});

export const insertGoalSchema = createInsertSchema(goals).omit({
  id: true,
  createdAt: true,
});

export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Goal = typeof goals.$inferSelect;

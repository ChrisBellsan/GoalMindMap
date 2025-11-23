import { type Goal, type InsertGoal, goals } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getGoals(): Promise<Goal[]>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoal(id: string, goal: Partial<InsertGoal>): Promise<Goal>;
  deleteGoal(id: string): Promise<void>;
}

export class DbStorage implements IStorage {
  async getGoals(): Promise<Goal[]> {
    return await db.select().from(goals);
  }

  async createGoal(insertGoal: InsertGoal): Promise<Goal> {
    const [goal] = await db.insert(goals).values(insertGoal).returning();
    return goal;
  }

  async updateGoal(id: string, updateData: Partial<InsertGoal>): Promise<Goal> {
    const [goal] = await db.update(goals).set(updateData).where(eq(goals.id, id)).returning();
    return goal;
  }

  async deleteGoal(id: string): Promise<void> {
    await db.delete(goals).where(eq(goals.id, id));
  }
}

export const storage = new DbStorage();

import { type Goal, type InsertGoal, goals } from "@shared/schema";
import { db } from "./db";

export interface IStorage {
  getGoals(): Promise<Goal[]>;
  createGoal(goal: InsertGoal): Promise<Goal>;
}

export class DbStorage implements IStorage {
  async getGoals(): Promise<Goal[]> {
    return await db.select().from(goals);
  }

  async createGoal(insertGoal: InsertGoal): Promise<Goal> {
    const [goal] = await db.insert(goals).values(insertGoal).returning();
    return goal;
  }
}

export const storage = new DbStorage();

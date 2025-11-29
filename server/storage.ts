import { type Goal, type InsertGoal, goals, type BurnRate, type InsertBurnRate, burnRate } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getGoals(): Promise<Goal[]>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoal(id: string, goal: Partial<InsertGoal>): Promise<Goal>;
  deleteGoal(id: string): Promise<void>;
  getBurnRate(): Promise<BurnRate | null>;
  upsertBurnRate(data: InsertBurnRate): Promise<BurnRate>;
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

  async getBurnRate(): Promise<BurnRate | null> {
    const rates = await db.select().from(burnRate).limit(1);
    return rates[0] || null;
  }

  async upsertBurnRate(data: InsertBurnRate): Promise<BurnRate> {
    const existing = await this.getBurnRate();
    if (existing) {
      const [updated] = await db
        .update(burnRate)
        .set({ ...data, updatedAt: new Date().toISOString() })
        .where(eq(burnRate.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(burnRate).values(data).returning();
      return created;
    }
  }
}

export const storage = new DbStorage();

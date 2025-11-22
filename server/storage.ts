import { type Goal, type InsertGoal } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getGoals(): Promise<Goal[]>;
  createGoal(goal: InsertGoal): Promise<Goal>;
}

export class MemStorage implements IStorage {
  private goals: Map<string, Goal>;

  constructor() {
    this.goals = new Map();
  }

  async getGoals(): Promise<Goal[]> {
    return Array.from(this.goals.values());
  }

  async createGoal(insertGoal: InsertGoal): Promise<Goal> {
    const id = randomUUID();
    const createdAt = new Date().toISOString();
    const goal: Goal = { ...insertGoal, id, createdAt };
    this.goals.set(id, goal);
    return goal;
  }
}

export const storage = new MemStorage();

import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertGoalSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/goals", async (_req, res) => {
    try {
      const goals = await storage.getGoals();
      res.json(goals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch goals" });
    }
  });

  app.post("/api/goals", async (req, res) => {
    try {
      const validatedData = insertGoalSchema.parse(req.body);
      const goal = await storage.createGoal(validatedData);
      res.status(201).json(goal);
    } catch (error) {
      res.status(400).json({ error: "Invalid goal data" });
    }
  });

  app.patch("/api/goals/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertGoalSchema.partial().parse(req.body);
      const goal = await storage.updateGoal(id, validatedData);
      res.json(goal);
    } catch (error) {
      res.status(400).json({ error: "Invalid goal data" });
    }
  });

  app.delete("/api/goals/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteGoal(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete goal" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Countdown } from "@/components/countdown";
import { GoalInput } from "@/components/goal-input";
import { GoalCard } from "@/components/goal-card";
import { CalendarView } from "@/components/calendar-view";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { Goal } from "@shared/schema";

export default function Home() {
  const [showInputs, setShowInputs] = useState(false);
  const [editGoals, setEditGoals] = useState(false);
  const [editLabels, setEditLabels] = useState(false);
  const [labels, setLabels] = useState({
    daily: "Daily",
    weekly: "Weekly",
    monthly: "Monthly",
    yearly: "Yearly",
  });
  
  const { data: goals, isLoading } = useQuery<Goal[]>({
    queryKey: ["/api/goals"],
  });

  const addGoalMutation = useMutation({
    mutationFn: async (goal: { 
      text: string; 
      type: string;
      dayOfWeek?: number;
      dayOfMonth?: number;
      month?: number;
    }) => {
      return await apiRequest("POST", "/api/goals", goal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: async ({ id, text }: { id: string; text: string }) => {
      return await apiRequest("PATCH", `/api/goals/${id}`, { text });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
    },
  });

  const deleteGoalMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/goals/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
    },
  });

  const handleAddGoal = (type: "daily" | "weekly" | "monthly" | "yearly") => (
    data: { text: string; dayOfWeek?: number; dayOfMonth?: number; month?: number }
  ) => {
    addGoalMutation.mutate({ ...data, type });
  };

  const handleUpdateGoal = (id: string, text: string) => {
    updateGoalMutation.mutate({ id, text });
  };

  const handleDeleteGoal = (id: string) => {
    deleteGoalMutation.mutate(id);
  };

  const goalsByType = {
    daily: goals?.filter((g) => g.type === "daily") || [],
    weekly: goals?.filter((g) => g.type === "weekly") || [],
    monthly: goals?.filter((g) => g.type === "monthly") || [],
    yearly: goals?.filter((g) => g.type === "yearly") || [],
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-8 py-12">
        <Countdown />

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="show-inputs"
                checked={showInputs}
                disabled={editGoals || editLabels}
                onCheckedChange={(checked) => setShowInputs(checked === true)}
                data-testid="checkbox-show-inputs"
              />
              <Label
                htmlFor="show-inputs"
                className={`text-sm font-medium cursor-pointer ${editGoals || editLabels ? 'opacity-50' : ''}`}
              >
                Enter New Goals
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="edit-goals"
                checked={editGoals}
                disabled={showInputs || editLabels}
                onCheckedChange={(checked) => setEditGoals(checked === true)}
                data-testid="checkbox-edit-goals"
              />
              <Label
                htmlFor="edit-goals"
                className={`text-sm font-medium cursor-pointer ${showInputs || editLabels ? 'opacity-50' : ''}`}
              >
                Edit Goals
              </Label>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="edit-labels"
              checked={editLabels}
              disabled={showInputs || editGoals}
              onCheckedChange={(checked) => setEditLabels(checked === true)}
              data-testid="checkbox-edit-labels"
            />
            <Label
              htmlFor="edit-labels"
              className={`text-sm font-medium cursor-pointer ${showInputs || editGoals ? 'opacity-50' : ''}`}
            >
              Edit Labels
            </Label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="space-y-4">
            <p
              className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
              contentEditable={editLabels}
              suppressContentEditableWarning
              onBlur={(e) => setLabels({ ...labels, daily: e.currentTarget.textContent || "Daily" })}
              data-testid="label-daily"
              style={editLabels ? { backgroundColor: "rgba(var(--primary), 0.1)", padding: "4px 8px", borderRadius: "4px", cursor: "text" } : {}}
            >
              {labels.daily}
            </p>
            {showInputs && <GoalInput type="daily" onAdd={handleAddGoal("daily")} />}
            <div className="space-y-4" data-testid="goals-daily">
              {isLoading ? (
                <>
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </>
              ) : goalsByType.daily.length > 0 ? (
                goalsByType.daily.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    editMode={editGoals}
                    onUpdate={handleUpdateGoal}
                    onDelete={handleDeleteGoal}
                  />
                ))
              ) : (
                <Card className="p-4 border-l-4 border-l-daily bg-daily/5">
                  <p className="text-sm text-muted-foreground text-center">No daily routines yet</p>
                </Card>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <p
              className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
              contentEditable={editLabels}
              suppressContentEditableWarning
              onBlur={(e) => setLabels({ ...labels, weekly: e.currentTarget.textContent || "Weekly" })}
              data-testid="label-weekly"
              style={editLabels ? { backgroundColor: "rgba(var(--primary), 0.1)", padding: "4px 8px", borderRadius: "4px", cursor: "text" } : {}}
            >
              {labels.weekly}
            </p>
            {showInputs && <GoalInput type="weekly" onAdd={handleAddGoal("weekly")} />}
            <div className="space-y-4" data-testid="goals-weekly">
              {isLoading ? (
                <>
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </>
              ) : goalsByType.weekly.length > 0 ? (
                goalsByType.weekly.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    editMode={editGoals}
                    onUpdate={handleUpdateGoal}
                    onDelete={handleDeleteGoal}
                  />
                ))
              ) : (
                <Card className="p-4 border-l-4 border-l-weekly bg-weekly/5">
                  <p className="text-sm text-muted-foreground text-center">No weekly goals yet</p>
                </Card>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <p
              className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
              contentEditable={editLabels}
              suppressContentEditableWarning
              onBlur={(e) => setLabels({ ...labels, monthly: e.currentTarget.textContent || "Monthly" })}
              data-testid="label-monthly"
              style={editLabels ? { backgroundColor: "rgba(var(--primary), 0.1)", padding: "4px 8px", borderRadius: "4px", cursor: "text" } : {}}
            >
              {labels.monthly}
            </p>
            {showInputs && <GoalInput type="monthly" onAdd={handleAddGoal("monthly")} />}
            <div className="space-y-4" data-testid="goals-monthly">
              {isLoading ? (
                <>
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </>
              ) : goalsByType.monthly.length > 0 ? (
                goalsByType.monthly.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    editMode={editGoals}
                    onUpdate={handleUpdateGoal}
                    onDelete={handleDeleteGoal}
                  />
                ))
              ) : (
                <Card className="p-4 border-l-4 border-l-monthly bg-monthly/5">
                  <p className="text-sm text-muted-foreground text-center">No monthly goals yet</p>
                </Card>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <p
              className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
              contentEditable={editLabels}
              suppressContentEditableWarning
              onBlur={(e) => setLabels({ ...labels, yearly: e.currentTarget.textContent || "Yearly" })}
              data-testid="label-yearly"
              style={editLabels ? { backgroundColor: "rgba(var(--primary), 0.1)", padding: "4px 8px", borderRadius: "4px", cursor: "text" } : {}}
            >
              {labels.yearly}
            </p>
            {showInputs && <GoalInput type="yearly" onAdd={handleAddGoal("yearly")} />}
            <div className="space-y-4" data-testid="goals-yearly">
              {isLoading ? (
                <>
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </>
              ) : goalsByType.yearly.length > 0 ? (
                goalsByType.yearly.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    editMode={editGoals}
                    onUpdate={handleUpdateGoal}
                    onDelete={handleDeleteGoal}
                  />
                ))
              ) : (
                <Card className="p-4 border-l-4 border-l-yearly bg-yearly/5">
                  <p className="text-sm text-muted-foreground text-center">No yearly goals yet</p>
                </Card>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <CalendarView goals={goals || []} />
        </div>
      </div>
    </div>
  );
}

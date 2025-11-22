import { useQuery, useMutation } from "@tanstack/react-query";
import { Countdown } from "@/components/countdown";
import { GoalInput } from "@/components/goal-input";
import { GoalCard } from "@/components/goal-card";
import { CalendarView } from "@/components/calendar-view";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import type { Goal } from "@shared/schema";

export default function Home() {
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

  const handleAddGoal = (type: "daily" | "weekly" | "monthly" | "yearly") => (
    data: { text: string; dayOfWeek?: number; dayOfMonth?: number; month?: number }
  ) => {
    addGoalMutation.mutate({ ...data, type });
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="space-y-4">
            <GoalInput type="daily" onAdd={handleAddGoal("daily")} />
            <div className="space-y-4" data-testid="goals-daily">
              {isLoading ? (
                <>
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </>
              ) : goalsByType.daily.length > 0 ? (
                goalsByType.daily.map((goal) => <GoalCard key={goal.id} goal={goal} />)
              ) : (
                <Card className="p-4 border-l-4 border-l-daily bg-daily/5">
                  <p className="text-sm text-muted-foreground text-center">No daily routines yet</p>
                </Card>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <GoalInput type="weekly" onAdd={handleAddGoal("weekly")} />
            <div className="space-y-4" data-testid="goals-weekly">
              {isLoading ? (
                <>
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </>
              ) : goalsByType.weekly.length > 0 ? (
                goalsByType.weekly.map((goal) => <GoalCard key={goal.id} goal={goal} />)
              ) : (
                <Card className="p-4 border-l-4 border-l-weekly bg-weekly/5">
                  <p className="text-sm text-muted-foreground text-center">No weekly goals yet</p>
                </Card>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <GoalInput type="monthly" onAdd={handleAddGoal("monthly")} />
            <div className="space-y-4" data-testid="goals-monthly">
              {isLoading ? (
                <>
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </>
              ) : goalsByType.monthly.length > 0 ? (
                goalsByType.monthly.map((goal) => <GoalCard key={goal.id} goal={goal} />)
              ) : (
                <Card className="p-4 border-l-4 border-l-monthly bg-monthly/5">
                  <p className="text-sm text-muted-foreground text-center">No monthly goals yet</p>
                </Card>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <GoalInput type="yearly" onAdd={handleAddGoal("yearly")} />
            <div className="space-y-4" data-testid="goals-yearly">
              {isLoading ? (
                <>
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </>
              ) : goalsByType.yearly.length > 0 ? (
                goalsByType.yearly.map((goal) => <GoalCard key={goal.id} goal={goal} />)
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

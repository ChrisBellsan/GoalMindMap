import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Goal } from "@shared/schema";

interface GoalCardProps {
  goal: Goal;
}

const typeConfig = {
  daily: {
    bgClass: "bg-daily/5",
    borderClass: "border-l-daily",
  },
  weekly: {
    bgClass: "bg-weekly/5",
    borderClass: "border-l-weekly",
  },
  monthly: {
    bgClass: "bg-monthly/5",
    borderClass: "border-l-monthly",
  },
  yearly: {
    bgClass: "bg-yearly/5",
    borderClass: "border-l-yearly",
  },
};

export function GoalCard({ goal }: GoalCardProps) {
  const config = typeConfig[goal.type as keyof typeof typeConfig] || typeConfig.daily;

  return (
    <Card
      className={cn(
        "p-4 border-l-4 hover-elevate transition-all",
        config.bgClass,
        config.borderClass
      )}
      data-testid={`goal-card-${goal.id}`}
    >
      <p className="text-base text-foreground" data-testid={`goal-text-${goal.id}`}>
        {goal.text}
      </p>
    </Card>
  );
}

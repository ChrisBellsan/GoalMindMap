import { Card } from "@/components/ui/card";
import { Calendar as CalendarIcon } from "lucide-react";
import { useMemo } from "react";
import type { Goal } from "@shared/schema";

interface CalendarViewProps {
  goals: Goal[];
}

export function CalendarView({ goals }: CalendarViewProps) {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const { monthName, daysInMonth, firstDayOfWeek, today } = useMemo(() => {
    const monthName = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
    const today = currentDate.getDate();

    return { monthName, daysInMonth, firstDayOfWeek, today };
  }, [currentMonth, currentYear]);

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfWeek }, (_, i) => i);

  const goalsByDay = useMemo(() => {
    const byDay: Record<number, { daily: number; weekly: number; monthly: number; yearly: number }> = {};
    days.forEach((day) => {
      byDay[day] = { daily: 0, weekly: 0, monthly: 0, yearly: 0 };
    });

    goals.forEach((goal) => {
      days.forEach((day) => {
        const dayDate = new Date(currentYear, currentMonth, day);
        const dayOfWeek = dayDate.getDay();

        // Map goals to dates based on user-defined scheduling
        if (goal.type === "daily") {
          // Daily routines: show on all days
          byDay[day].daily++;
        } else if (goal.type === "weekly") {
          // Weekly goals: show on specified day of week
          if (goal.dayOfWeek !== null && goal.dayOfWeek !== undefined && dayOfWeek === goal.dayOfWeek) {
            byDay[day].weekly++;
          }
        } else if (goal.type === "monthly") {
          // Monthly goals: show on specified day of month
          if (goal.dayOfMonth !== null && goal.dayOfMonth !== undefined && day === goal.dayOfMonth) {
            byDay[day].monthly++;
          }
        } else if (goal.type === "yearly") {
          // Yearly goals: show on specified month and day
          if (
            goal.month !== null && 
            goal.month !== undefined && 
            goal.dayOfMonth !== null && 
            goal.dayOfMonth !== undefined &&
            currentMonth === goal.month &&
            day === goal.dayOfMonth
          ) {
            byDay[day].yearly++;
          }
        }
      });
    });

    return byDay;
  }, [goals, days, currentMonth, currentYear]);

  const totalGoals = useMemo(() => {
    return {
      daily: goals.filter((g) => g.type === "daily").length,
      weekly: goals.filter((g) => g.type === "weekly").length,
      monthly: goals.filter((g) => g.type === "monthly").length,
      yearly: goals.filter((g) => g.type === "yearly").length,
    };
  }, [goals]);

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <CalendarIcon className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-medium text-foreground">{monthName}</h2>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-6">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-muted-foreground py-2"
          >
            {day}
          </div>
        ))}

        {blanks.map((i) => (
          <div key={`blank-${i}`} />
        ))}

        {days.map((day) => {
          const isToday = day === today;
          const counts = goalsByDay[day];
          const hasGoals = counts.daily + counts.weekly + counts.monthly + counts.yearly > 0;

          return (
            <div
              key={day}
              className={cn(
                "aspect-square flex flex-col items-center justify-center p-1 rounded-md text-sm",
                isToday && "bg-primary text-primary-foreground font-semibold",
                !isToday && "text-foreground"
              )}
              data-testid={`calendar-day-${day}`}
            >
              <span>{day}</span>
              {hasGoals && (
                <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                  {counts.daily > 0 && (
                    <div className="w-1.5 h-1.5 rounded-full bg-daily" data-testid={`indicator-daily-${day}`} />
                  )}
                  {counts.weekly > 0 && (
                    <div className="w-1.5 h-1.5 rounded-full bg-weekly" data-testid={`indicator-weekly-${day}`} />
                  )}
                  {counts.monthly > 0 && (
                    <div className="w-1.5 h-1.5 rounded-full bg-monthly" data-testid={`indicator-monthly-${day}`} />
                  )}
                  {counts.yearly > 0 && (
                    <div className="w-1.5 h-1.5 rounded-full bg-yearly" data-testid={`indicator-yearly-${day}`} />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="border-t border-border pt-4">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-daily" />
              <span className="text-muted-foreground">Daily</span>
            </div>
            <span className="font-medium text-foreground" data-testid="count-daily">{totalGoals.daily}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-weekly" />
              <span className="text-muted-foreground">Weekly</span>
            </div>
            <span className="font-medium text-foreground" data-testid="count-weekly">{totalGoals.weekly}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-monthly" />
              <span className="text-muted-foreground">Monthly</span>
            </div>
            <span className="font-medium text-foreground" data-testid="count-monthly">{totalGoals.monthly}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yearly" />
              <span className="text-muted-foreground">Yearly</span>
            </div>
            <span className="font-medium text-foreground" data-testid="count-yearly">{totalGoals.yearly}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

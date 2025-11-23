import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Clock } from "lucide-react";

export function Countdown() {
  const [timeLeftNewYear, setTimeLeftNewYear] = useState(calculateTimeLeftNewYear());
  const [timeLeftMonthEnd, setTimeLeftMonthEnd] = useState(calculateTimeLeftMonthEnd());

  function calculateTimeLeftNewYear() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const nextYear = now.getMonth() === 11 && now.getDate() === 31 ? currentYear + 1 : currentYear + 1;
    const newYear = new Date(nextYear, 0, 1);
    const difference = newYear.getTime() - now.getTime();

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }

  function calculateTimeLeftMonthEnd() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const monthEnd = new Date(currentYear, currentMonth + 1, 0);
    monthEnd.setHours(23, 59, 59, 999);
    const difference = monthEnd.getTime() - now.getTime();

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeftNewYear(calculateTimeLeftNewYear());
      setTimeLeftMonthEnd(calculateTimeLeftMonthEnd());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex flex-col items-center gap-6 mb-8">
      <Card className="p-8 w-full max-w-2xl">
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-primary" />
            <h1 className="text-lg font-semibold text-foreground">Countdown to New Year</h1>
          </div>

          <div className="flex items-baseline gap-2" data-testid="countdown-display">
            <div className="text-center">
              <div className="text-4xl font-bold text-foreground tabular-nums" data-testid="countdown-days">
                {timeLeftNewYear.days}
              </div>
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground mt-2">
                Days
              </div>
            </div>

            <div className="text-2xl font-bold text-muted-foreground px-2">:</div>

            <div className="text-center">
              <div className="text-2xl font-bold text-foreground tabular-nums" data-testid="countdown-hours">
                {String(timeLeftNewYear.hours).padStart(2, "0")}
              </div>
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground mt-2">
                Hours
              </div>
            </div>

            <div className="text-2xl font-bold text-muted-foreground px-2">:</div>

            <div className="text-center">
              <div className="text-2xl font-bold text-foreground tabular-nums" data-testid="countdown-minutes">
                {String(timeLeftNewYear.minutes).padStart(2, "0")}
              </div>
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground mt-2">
                Minutes
              </div>
            </div>
          </div>

          <div className="flex items-baseline gap-1 text-sm" data-testid="countdown-month-end">
            <span className="text-muted-foreground">End of month:</span>
            <span className="font-semibold text-foreground tabular-nums">
              {timeLeftMonthEnd.days}d {String(timeLeftMonthEnd.hours).padStart(2, "0")}h {String(timeLeftMonthEnd.minutes).padStart(2, "0")}m
            </span>
          </div>

          <p className="text-sm text-muted-foreground" data-testid="current-date">
            {today}
          </p>
        </div>
      </Card>
    </div>
  );
}

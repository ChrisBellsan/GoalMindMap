import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Clock } from "lucide-react";

export function Countdown() {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
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

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
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
            <h1 className="text-2xl font-semibold text-foreground">Countdown to New Year</h1>
          </div>

          <div className="flex items-baseline gap-2" data-testid="countdown-display">
            <div className="text-center">
              <div className="text-6xl font-bold text-foreground tabular-nums" data-testid="countdown-days">
                {timeLeft.days}
              </div>
              <div className="text-sm font-medium uppercase tracking-wide text-muted-foreground mt-2">
                Days
              </div>
            </div>

            <div className="text-4xl font-bold text-muted-foreground px-2">:</div>

            <div className="text-center">
              <div className="text-4xl font-bold text-foreground tabular-nums" data-testid="countdown-hours">
                {String(timeLeft.hours).padStart(2, "0")}
              </div>
              <div className="text-sm font-medium uppercase tracking-wide text-muted-foreground mt-2">
                Hours
              </div>
            </div>

            <div className="text-4xl font-bold text-muted-foreground px-2">:</div>

            <div className="text-center">
              <div className="text-4xl font-bold text-foreground tabular-nums" data-testid="countdown-minutes">
                {String(timeLeft.minutes).padStart(2, "0")}
              </div>
              <div className="text-sm font-medium uppercase tracking-wide text-muted-foreground mt-2">
                Minutes
              </div>
            </div>
          </div>

          <p className="text-base text-muted-foreground" data-testid="current-date">
            {today}
          </p>
        </div>
      </Card>
    </div>
  );
}

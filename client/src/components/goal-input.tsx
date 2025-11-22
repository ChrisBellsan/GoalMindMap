import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface GoalInputProps {
  type: "daily" | "weekly" | "monthly" | "yearly";
  onAdd: (data: { text: string; dayOfWeek?: number; dayOfMonth?: number; month?: number }) => void;
}

const typeConfig = {
  daily: {
    label: "Daily Routines",
    placeholder: "Add a daily routine...",
    bgClass: "bg-daily/10",
    borderClass: "border-l-daily",
    buttonBg: "bg-daily",
  },
  weekly: {
    label: "Weekly Goals",
    placeholder: "Add a weekly goal...",
    bgClass: "bg-weekly/10",
    borderClass: "border-l-weekly",
    buttonBg: "bg-weekly",
  },
  monthly: {
    label: "Monthly Goals",
    placeholder: "Add a monthly goal...",
    bgClass: "bg-monthly/10",
    borderClass: "border-l-monthly",
    buttonBg: "bg-monthly",
  },
  yearly: {
    label: "Yearly Goals",
    placeholder: "Add a yearly goal...",
    bgClass: "bg-yearly/10",
    borderClass: "border-l-yearly",
    buttonBg: "bg-yearly",
  },
};

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function GoalInput({ type, onAdd }: GoalInputProps) {
  const [text, setText] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState<string>("0");
  const [dayOfMonth, setDayOfMonth] = useState<string>("1");
  const [month, setMonth] = useState<string>("0");
  
  const config = typeConfig[type];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      const data: { text: string; dayOfWeek?: number; dayOfMonth?: number; month?: number } = {
        text: text.trim(),
      };
      
      if (type === "weekly") {
        data.dayOfWeek = parseInt(dayOfWeek);
      } else if (type === "monthly") {
        data.dayOfMonth = parseInt(dayOfMonth);
      } else if (type === "yearly") {
        data.month = parseInt(month);
        data.dayOfMonth = parseInt(dayOfMonth);
      }
      
      onAdd(data);
      setText("");
      setDayOfWeek("0");
      setDayOfMonth("1");
      setMonth("0");
    }
  };

  return (
    <Card className={cn("p-6 border-l-4", config.borderClass)}>
      <h2 className="text-lg font-medium text-foreground mb-4">{config.label}</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={config.placeholder}
            data-testid={`input-${type}`}
          />
        </div>
        
        {type === "weekly" && (
          <div>
            <Label htmlFor={`day-${type}`} className="text-sm text-muted-foreground">Day of Week</Label>
            <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
              <SelectTrigger id={`day-${type}`} data-testid={`select-day-${type}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DAYS_OF_WEEK.map((day, index) => (
                  <SelectItem key={index} value={String(index)}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        {type === "monthly" && (
          <div>
            <Label htmlFor={`day-${type}`} className="text-sm text-muted-foreground">Day of Month</Label>
            <Select value={dayOfMonth} onValueChange={setDayOfMonth}>
              <SelectTrigger id={`day-${type}`} data-testid={`select-day-${type}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <SelectItem key={day} value={String(day)}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        {type === "yearly" && (
          <>
            <div>
              <Label htmlFor={`month-${type}`} className="text-sm text-muted-foreground">Month</Label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger id={`month-${type}`} data-testid={`select-month-${type}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m, index) => (
                    <SelectItem key={index} value={String(index)}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor={`day-${type}`} className="text-sm text-muted-foreground">Day</Label>
              <Select value={dayOfMonth} onValueChange={setDayOfMonth}>
                <SelectTrigger id={`day-${type}`} data-testid={`select-day-${type}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <SelectItem key={day} value={String(day)}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}
        
        <Button
          type="submit"
          className={cn("w-full", config.buttonBg)}
          data-testid={`button-add-${type}`}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add {config.label.slice(0, -1)}
        </Button>
      </form>
    </Card>
  );
}

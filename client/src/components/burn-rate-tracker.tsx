import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { TrendingDown, DollarSign, Target, Pencil, Check, X } from "lucide-react";
import type { BurnRate } from "@shared/schema";

export function BurnRateTracker() {
  const [isEditing, setIsEditing] = useState(false);
  const [editCurrentAmount, setEditCurrentAmount] = useState("");

  const { data: burnRate, isLoading } = useQuery<BurnRate>({
    queryKey: ["/api/burn-rate"],
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { currentAmount: number; targetAmount: number }) => {
      return await apiRequest("PUT", "/api/burn-rate", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/burn-rate"] });
      setIsEditing(false);
    },
  });

  const handleStartEdit = () => {
    if (burnRate) {
      setEditCurrentAmount(burnRate.currentAmount.toString());
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    if (burnRate) {
      const newAmount = parseFloat(editCurrentAmount);
      if (!isNaN(newAmount) && newAmount > 0) {
        updateMutation.mutate({
          currentAmount: newAmount,
          targetAmount: burnRate.targetAmount,
        });
      }
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (burnRate) {
      setEditCurrentAmount(burnRate.currentAmount.toString());
    }
  };

  if (isLoading || !burnRate) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="h-8 bg-muted rounded w-full"></div>
        </div>
      </Card>
    );
  }

  const currentAmount = burnRate.currentAmount;
  const targetAmount = burnRate.targetAmount;
  const amountToReduce = currentAmount - targetAmount;
  const progressPercentage = Math.max(0, Math.min(100, ((43000 - currentAmount) / (43000 - targetAmount)) * 100));
  const isOnTarget = currentAmount <= targetAmount;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="p-6 border-l-4 border-l-chart-2" data-testid="burn-rate-tracker">
      <div className="flex items-center gap-2 mb-6">
        <TrendingDown className="w-5 h-5 text-chart-2" />
        <h2 className="text-lg font-semibold text-foreground">Monthly Burn Rate</h2>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <DollarSign className="w-3.5 h-3.5" />
              Current
            </div>
            {isEditing ? (
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    type="number"
                    value={editCurrentAmount}
                    onChange={(e) => setEditCurrentAmount(e.target.value)}
                    className="pl-7"
                    data-testid="input-burn-rate"
                    autoFocus
                  />
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                  data-testid="button-save-burn-rate"
                >
                  <Check className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleCancel}
                  data-testid="button-cancel-burn-rate"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-foreground tabular-nums" data-testid="text-current-burn-rate">
                  {formatCurrency(currentAmount)}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleStartEdit}
                  className="h-8 w-8"
                  data-testid="button-edit-burn-rate"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <Target className="w-3.5 h-3.5" />
              Target
            </div>
            <span className="text-2xl font-bold text-chart-2 tabular-nums" data-testid="text-target-burn-rate">
              {formatCurrency(targetAmount)}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress to target</span>
            <span className={`font-medium ${isOnTarget ? "text-chart-2" : "text-foreground"}`}>
              {isOnTarget ? "Target reached!" : `${formatCurrency(amountToReduce)} to go`}
            </span>
          </div>
          <Progress
            value={progressPercentage}
            className="h-3"
            data-testid="progress-burn-rate"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>$43,000</span>
            <span>{Math.round(progressPercentage)}% reduced</span>
            <span>$35,000</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

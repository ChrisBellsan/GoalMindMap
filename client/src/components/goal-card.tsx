import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Goal } from "@shared/schema";

interface GoalCardProps {
  goal: Goal;
  editMode?: boolean;
  onUpdate?: (id: string, text: string) => void;
  onDelete?: (id: string) => void;
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

export function GoalCard({ goal, editMode = false, onUpdate, onDelete }: GoalCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editText, setEditText] = useState(goal.text);
  const config = typeConfig[goal.type as keyof typeof typeConfig] || typeConfig.daily;

  const handleSave = () => {
    if (editText.trim() && onUpdate) {
      onUpdate(goal.id, editText.trim());
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditText(goal.text);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(goal.id);
    }
  };

  const handleCardClick = () => {
    if (editMode) {
      setIsEditing(true);
    } else if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <Card
      className={cn(
        "p-4 border-l-4 transition-all",
        config.bgClass,
        config.borderClass,
        !editMode && !showDeleteConfirm && "hover-elevate cursor-pointer"
      )}
      data-testid={`goal-card-${goal.id}`}
      onClick={!isEditing && !editMode && !showDeleteConfirm ? handleCardClick : undefined}
    >
      {isEditing ? (
        <div className="space-y-2">
          <Input
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") handleCancel();
            }}
            data-testid={`goal-edit-input-${goal.id}`}
            autoFocus
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleSave}
              data-testid={`goal-save-${goal.id}`}
            >
              <Check className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancel}
              data-testid={`goal-cancel-${goal.id}`}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : showDeleteConfirm ? (
        <div className="space-y-3">
          <p className="text-base text-foreground" data-testid={`goal-text-${goal.id}`}>
            {goal.text}
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="destructive"
              onClick={handleDelete}
              data-testid={`goal-confirm-delete-${goal.id}`}
            >
              Delete
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancelDelete}
              data-testid={`goal-cancel-delete-${goal.id}`}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              "text-base text-foreground flex-1",
              editMode && "cursor-pointer hover:text-primary"
            )}
            onClick={editMode ? handleCardClick : undefined}
            data-testid={`goal-text-${goal.id}`}
          >
            {goal.text}
          </p>
          {editMode && (
            <Button
              size="icon"
              variant="ghost"
              onClick={handleDelete}
              data-testid={`goal-delete-${goal.id}`}
              className="h-8 w-8"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}

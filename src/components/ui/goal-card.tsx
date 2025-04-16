import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./card";
import { Progress } from "./progress";
import { Button } from "./button";
import { Goal } from "@/types/goals";
import { Clock, Award, Target } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "./toast";

interface GoalCardProps {
  goal: Goal;
  onUpdateProgress: (goalId: string, value: number) => Promise<void>;
  onDeleteGoal: (goalId: string) => Promise<void>;
  onEditGoal: (goal: Goal) => void;
}

export function GoalCard({
  goal,
  onUpdateProgress,
  onDeleteGoal,
  onEditGoal,
}: GoalCardProps) {
  // Calculate progress percentage
  const progressPercentage = Math.min(
    Math.round((goal.currentValue / goal.targetValue) * 100),
    100
  );

  // Get the next milestone that hasn't been achieved yet
  const nextMilestone = goal.milestones
    ?.filter((m) => !m.achieved)
    .sort((a, b) => a.value - b.value)[0];

  // Format the deadline if it exists
  const formattedDeadline = goal.deadline
    ? formatDistanceToNow(new Date(goal.deadline), { addSuffix: true })
    : null;

  // Function to handle progress update
  const handleProgressUpdate = async () => {
    try {
      // For demonstration, we'll add 10% of the target value each time
      // In a real app, you might want a proper input form
      const increment = Math.max(goal.targetValue * 0.1, 1); // At least 1 unit
      const newValue = Math.min(
        goal.currentValue + increment,
        goal.targetValue
      );
      await onUpdateProgress(goal.id, newValue);

      if (
        newValue >= goal.targetValue &&
        goal.currentValue < goal.targetValue
      ) {
        toast({
          title: "Goal Completed! 🎉",
          description: `Congratulations on completing "${goal.title}"!`,
          variant: "success",
        });
      } else if (
        nextMilestone &&
        newValue >= nextMilestone.value &&
        goal.currentValue < nextMilestone.value
      ) {
        toast({
          title: "Milestone Achieved! 🏆",
          description: nextMilestone.reward
            ? `You've earned: ${nextMilestone.reward}`
            : `You've reached ${nextMilestone.value} ${goal.unit}!`,
          variant: "success",
        });
      }
    } catch (error) {
      toast({
        title: "Failed to update progress",
        variant: "destructive",
      });
    }
  };

  // Function to handle deleting the goal
  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this goal?")) {
      try {
        await onDeleteGoal(goal.id);
        toast({ title: "Goal deleted", variant: "success" });
      } catch (error) {
        toast({ title: "Failed to delete goal", variant: "destructive" });
      }
    }
  };

  return (
    <Card
      className={`shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${
        goal.completed
          ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
          : ""
      }`}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold">{goal.title}</CardTitle>
          <div className="flex space-x-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEditGoal(goal)}
              className="h-8 w-8 p-0"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              <span className="sr-only">Edit</span>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDelete}
              className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M3 6h18"></path>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground mb-3">{goal.description}</p>

        <div className="space-y-3">
          <div className="flex justify-between text-sm mb-1">
            <span>
              Progress: {goal.currentValue} / {goal.targetValue} {goal.unit}
            </span>
            <span
              className={`font-medium ${
                progressPercentage === 100
                  ? "text-green-600 dark:text-green-400"
                  : ""
              }`}
            >
              {progressPercentage}%
            </span>
          </div>

          <Progress
            value={progressPercentage}
            className={
              progressPercentage === 100
                ? "bg-green-100 dark:bg-green-800/30"
                : ""
            }
          />

          {goal.deadline && (
            <div className="flex items-center text-xs text-muted-foreground mt-2">
              <Clock className="h-3.5 w-3.5 mr-1" />
              <span>Deadline: {formattedDeadline}</span>
            </div>
          )}

          {nextMilestone && !goal.completed && (
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <Target className="h-3.5 w-3.5 mr-1" />
              <span>
                Next milestone: {nextMilestone.value} {goal.unit}
              </span>
            </div>
          )}

          {goal.milestones && goal.milestones.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {goal.milestones.map((milestone, index) => (
                <div
                  key={index}
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs 
                    ${
                      milestone.achieved
                        ? "bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-200"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    }`}
                >
                  <Award
                    className={`h-3 w-3 mr-1 ${
                      milestone.achieved
                        ? "text-green-600 dark:text-green-400"
                        : ""
                    }`}
                  />
                  {milestone.value} {goal.unit}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        {!goal.completed ? (
          <Button
            onClick={handleProgressUpdate}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            variant="default"
          >
            Update Progress
          </Button>
        ) : (
          <Button
            disabled
            className="w-full bg-green-600 opacity-80 cursor-not-allowed"
            variant="default"
          >
            Completed!
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

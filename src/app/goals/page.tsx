"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { PageWrapper } from "@/components/page-wrapper";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { GoalCard } from "@/components/ui/goal-card";
import { GoalForm } from "@/components/ui/goal-form";
import { AchievementsDisplay } from "@/components/ui/achievements-display";
import { Goal, GoalCategory, UserAchievement } from "@/types/goals";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Loader2,
  Car,
  Lightbulb,
  Apple,
  Recycle,
  Droplet,
  ListFilter,
} from "lucide-react";

const categoryIcons: Record<GoalCategory, React.ReactNode> = {
  transportation: <Car className="h-4 w-4" />,
  energy: <Lightbulb className="h-4 w-4" />,
  diet: <Apple className="h-4 w-4" />,
  waste: <Recycle className="h-4 w-4" />,
  water: <Droplet className="h-4 w-4" />,
  other: <ListFilter className="h-4 w-4" />,
};

export default function GoalsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [openGoalForm, setOpenGoalForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<string>("all");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      fetchGoals();
      fetchAchievements();
    }
  }, [status, router]);

  const fetchGoals = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/goals");
      if (response.ok) {
        const data = await response.json();
        setGoals(data.goals || []);
      } else {
        toast({ title: "Failed to load goals", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error fetching goals:", error);
      toast({ title: "Failed to load goals", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAchievements = async () => {
    try {
      const response = await fetch("/api/achievements");
      if (response.ok) {
        const data = await response.json();
        setAchievements(data.achievements || []);
      }
    } catch (error) {
      console.error("Error fetching achievements:", error);
    }
  };

  const handleCreateGoal = async (
    goalData: Omit<
      Goal,
      "id" | "createdAt" | "updatedAt" | "completed" | "currentValue"
    >
  ) => {
    try {
      const response = await fetch("/api/goals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ goal: goalData }),
      });

      if (response.ok) {
        const data = await response.json();
        setGoals(data.goals);
        return;
      }
      throw new Error("Failed to create goal");
    } catch (error) {
      console.error("Error creating goal:", error);
      throw error;
    }
  };

  const handleUpdateGoal = async (
    goalData: Omit<Goal, "createdAt" | "updatedAt">
  ) => {
    try {
      const response = await fetch("/api/goals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ goal: goalData }),
      });

      if (response.ok) {
        const data = await response.json();
        setGoals(data.goals);
        return;
      }
      throw new Error("Failed to update goal");
    } catch (error) {
      console.error("Error updating goal:", error);
      throw error;
    }
  };

  const handleUpdateProgress = async (goalId: string, value: number) => {
    try {
      const response = await fetch("/api/goals", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ goalId, currentValue: value }),
      });

      if (response.ok) {
        const data = await response.json();
        // Update the goal in our state
        setGoals(goals.map((goal) => (goal.id === goalId ? data.goal : goal)));

        // Check if goal was completed
        const goal = goals.find((g) => g.id === goalId);
        const updatedGoal = data.goal;

        if (updatedGoal.completed && goal && !goal.completed) {
          // Goal was just completed, create an achievement
          await createAchievement({
            title: `Completed: ${updatedGoal.title}`,
            description: `Successfully reached the target of ${updatedGoal.targetValue} ${updatedGoal.unit}`,
            iconName: getCategoryIcon(updatedGoal.category),
          });
        }

        return;
      }
      throw new Error("Failed to update progress");
    } catch (error) {
      console.error("Error updating progress:", error);
      throw error;
    }
  };

  const createAchievement = async (achievementData: {
    title: string;
    description: string;
    iconName: string;
  }) => {
    try {
      const response = await fetch("/api/achievements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ achievement: achievementData }),
      });

      if (response.ok) {
        const data = await response.json();
        setAchievements([...achievements, data.achievement]);
        return;
      }
    } catch (error) {
      console.error("Error creating achievement:", error);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      const response = await fetch(`/api/goals?id=${goalId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setGoals(goals.filter((goal) => goal.id !== goalId));
        return;
      }
      throw new Error("Failed to delete goal");
    } catch (error) {
      console.error("Error deleting goal:", error);
      throw error;
    }
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setOpenGoalForm(true);
  };

  const handleSaveGoal = async (
    goalData: Omit<
      Goal,
      "id" | "createdAt" | "updatedAt" | "completed" | "currentValue"
    >
  ) => {
    if (editingGoal) {
      // Update existing goal
      await handleUpdateGoal({
        ...goalData,
        id: editingGoal.id,
        completed: editingGoal.completed,
        currentValue: editingGoal.currentValue,
      });
    } else {
      // Create new goal
      await handleCreateGoal(goalData);
    }
  };

  const filteredGoals =
    activeTab === "all"
      ? goals
      : activeTab === "completed"
      ? goals.filter((goal) => goal.completed)
      : activeTab === "in-progress"
      ? goals.filter((goal) => !goal.completed)
      : goals.filter((goal) => goal.category === activeTab);

  const getCategoryIcon = (category: GoalCategory): string => {
    switch (category) {
      case "transportation":
        return "car";
      case "energy":
        return "zap";
      case "diet":
        return "leaf";
      case "waste":
        return "recycle";
      case "water":
        return "droplet";
      default:
        return "target";
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  return (
    <PageWrapper>
      <div className="container py-8 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Sustainability Goals
            </h1>
            <p className="text-muted-foreground mt-1">
              Track your progress and earn achievements by completing
              sustainability goals
            </p>
          </div>

          <Button
            onClick={() => {
              setEditingGoal(undefined);
              setOpenGoalForm(true);
            }}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Goal
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Tabs
              defaultValue="all"
              value={activeTab}
              onValueChange={setActiveTab}
              className="mb-6"
            >
              <TabsList className="grid grid-cols-4 md:grid-cols-7 mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="in-progress">In Progress</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="transportation">
                  {categoryIcons.transportation}
                </TabsTrigger>
                <TabsTrigger value="energy">{categoryIcons.energy}</TabsTrigger>
                <TabsTrigger value="diet">{categoryIcons.diet}</TabsTrigger>
                <TabsTrigger value="waste">{categoryIcons.waste}</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-0">
                {filteredGoals.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground bg-muted/40 rounded-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="opacity-20 mb-3"
                    >
                      <path d="M21 7v6h-6" />
                      <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" />
                    </svg>
                    <p className="text-lg font-medium">No goals found</p>
                    <p className="mt-1">
                      {activeTab === "all"
                        ? "Create your first sustainability goal to get started!"
                        : activeTab === "completed"
                        ? "You haven't completed any goals yet."
                        : activeTab === "in-progress"
                        ? "You don't have any goals in progress."
                        : `You don't have any ${activeTab} goals yet.`}
                    </p>
                    <Button
                      onClick={() => {
                        setEditingGoal(undefined);
                        setOpenGoalForm(true);
                      }}
                      variant="outline"
                      className="mt-4"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Goal
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {filteredGoals.map((goal) => (
                      <GoalCard
                        key={goal.id}
                        goal={goal}
                        onUpdateProgress={handleUpdateProgress}
                        onDeleteGoal={handleDeleteGoal}
                        onEditGoal={handleEditGoal}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          <div>
            <AchievementsDisplay achievements={achievements} />
          </div>
        </div>
      </div>

      <GoalForm
        open={openGoalForm}
        onOpenChange={setOpenGoalForm}
        onSave={handleSaveGoal}
        editingGoal={editingGoal}
      />
    </PageWrapper>
  );
}

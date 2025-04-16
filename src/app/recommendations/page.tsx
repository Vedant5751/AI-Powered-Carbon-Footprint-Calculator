"use client"; // Ensure this is a client component

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Car,
  Home,
  ShoppingBag,
  ThumbsUp,
  XCircle,
  Leaf,
  Utensils,
  Trash2,
  Monitor,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import { PageWrapper } from "@/components/page-wrapper";

// Types
interface Recommendation {
  id: string;
  category: string;
  title: string;
  description: string;
  impact: string;
  difficulty: "Easy" | "Medium" | "Hard";
  progress: number;
}

interface CommunityTip {
  id: string;
  title: string;
  author: string;
  content: string;
}

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [communityTips, setCommunityTips] = useState<CommunityTip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  // Fetch recommendations
  useEffect(() => {
    async function fetchRecommendations() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/recommendations");

        if (!response.ok) {
          throw new Error("Failed to fetch recommendations");
        }

        const data = await response.json();
        setRecommendations(data.recommendations || []);
        setCommunityTips(data.communityTips || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRecommendations();
  }, []);

  // Filter recommendations based on active tab
  const filteredRecommendations =
    activeTab === "all"
      ? recommendations
      : recommendations.filter((rec) => rec.category === activeTab);

  // Helper function to render icon based on category
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "transportation":
        return <Car className="h-4 w-4 text-green-600 dark:text-green-400" />;
      case "home":
        return <Home className="h-4 w-4 text-green-600 dark:text-green-400" />;
      case "diet":
        return (
          <Utensils className="h-4 w-4 text-green-600 dark:text-green-400" />
        );
      case "waste":
        return (
          <Trash2 className="h-4 w-4 text-green-600 dark:text-green-400" />
        );
      case "digital":
        return (
          <Monitor className="h-4 w-4 text-green-600 dark:text-green-400" />
        );
      default:
        return (
          <ShoppingBag className="h-4 w-4 text-green-600 dark:text-green-400" />
        );
    }
  };

  // Helper function to get badge variant based on difficulty
  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200 dark:border-green-800";
      case "Medium":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-800";
      case "Hard":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-200 dark:border-red-800";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 border-gray-200 dark:border-gray-800";
    }
  };

  // Handle implementing a recommendation
  const handleImplement = (id: string) => {
    // In a real app, this would update the progress on the server
    setRecommendations(
      recommendations.map((rec) =>
        rec.id === id ? { ...rec, progress: 100 } : rec
      )
    );
  };

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="flex h-[70vh] items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Spinner size="lg" />
            <p>Loading your personalized recommendations...</p>
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper>
        <div className="flex h-[70vh] flex-col items-center justify-center gap-4">
          <XCircle className="h-12 w-12 text-destructive" />
          <p className="text-xl font-semibold">Error loading recommendations</p>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </PageWrapper>
    );
  }

  if (recommendations.length === 0) {
    return (
      <PageWrapper>
        <div className="flex h-[70vh] flex-col items-center justify-center gap-4">
          <Leaf className="h-12 w-12 text-primary" />
          <p className="text-xl font-semibold">
            No recommendations available yet
          </p>
          <p className="text-muted-foreground">
            Complete a carbon footprint calculation to get personalized
            recommendations.
          </p>
          <Button asChild>
            <Link href="/calculator">Calculate Now</Link>
          </Button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="py-10">
      <h1 className="text-3xl font-bold mb-2 text-green-800 dark:text-green-100">
        Personalized Recommendations
      </h1>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Based on your carbon footprint, here are personalized actions you can
        take to reduce your environmental impact.
      </p>

        <Tabs
          defaultValue="all"
          className="space-y-4"
          value={activeTab}
          onValueChange={setActiveTab}
        >
        <TabsList>
          <TabsTrigger value="all">All Recommendations</TabsTrigger>
          <TabsTrigger value="transportation">Transportation</TabsTrigger>
          <TabsTrigger value="home">Home Energy</TabsTrigger>
            <TabsTrigger value="diet">Diet</TabsTrigger>
            <TabsTrigger value="waste">Waste</TabsTrigger>
            <TabsTrigger value="digital">Digital</TabsTrigger>
        </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredRecommendations.map((recommendation) => (
                <Card key={recommendation.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
                          {getCategoryIcon(recommendation.category)}
                    </div>
                    <CardTitle className="text-lg">
                          {recommendation.title}
                    </CardTitle>
                  </div>
                  <Badge
                    variant="outline"
                        className={getDifficultyBadge(
                          recommendation.difficulty
                        )}
                  >
                        {recommendation.difficulty}
                  </Badge>
                </div>
                <CardDescription>
                      {recommendation.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Potential Impact</span>
                    <span className="font-medium">
                          {recommendation.impact}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Your Progress</span>
                        <span>{recommendation.progress}%</span>
                  </div>
                      <Progress
                        value={recommendation.progress}
                        className="h-2"
                      />
                </div>
              </CardContent>
              <CardFooter>
                    <Button
                    variant="outline"
                      size="sm"
                      className="w-full"
                      disabled={recommendation.progress === 100}
                      onClick={() => handleImplement(recommendation.id)}
                    >
                  <ThumbsUp className="mr-2 h-4 w-4" />
                      {recommendation.progress === 100
                        ? "Implemented"
                        : "Mark as Implemented"}
                </Button>
              </CardFooter>
            </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </PageWrapper>
  );
}

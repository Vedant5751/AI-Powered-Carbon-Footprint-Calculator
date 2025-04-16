import React from "react";
import { UserAchievement } from "@/types/goals";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./card";
import { ScrollArea } from "./scroll-area";
import { formatDistanceToNow } from "date-fns";
import { Award, Medal, Star, Zap, Leaf, Target } from "lucide-react";

interface AchievementsDisplayProps {
  achievements: UserAchievement[];
}

// Map of icon names to actual icon components
const iconMap: Record<string, React.ReactNode> = {
  trophy: <Award className="h-6 w-6 text-yellow-500" />,
  medal: <Medal className="h-6 w-6 text-blue-500" />,
  star: <Star className="h-6 w-6 text-purple-500" />,
  zap: <Zap className="h-6 w-6 text-amber-500" />,
  leaf: <Leaf className="h-6 w-6 text-green-500" />,
  target: <Target className="h-6 w-6 text-red-500" />,
};

export function AchievementsDisplay({
  achievements,
}: AchievementsDisplayProps) {
  if (!achievements.length) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Achievements</CardTitle>
          <CardDescription>
            Complete goals to earn badges and rewards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
            <Award className="h-12 w-12 mb-2 opacity-20" />
            <p>No achievements yet</p>
            <p className="text-sm">
              Complete goals to earn your first achievement!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Achievements</CardTitle>
        <CardDescription>Your earned badges and rewards</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className="flex items-start space-x-3 p-3 bg-muted/50 rounded-md hover:bg-muted transition-colors"
              >
                <div className="bg-background p-2 rounded-full shadow-sm">
                  {iconMap[achievement.iconName] || (
                    <Award className="h-6 w-6 text-yellow-500" />
                  )}
                </div>
                <div className="space-y-1">
                  <h4 className="font-medium leading-none">
                    {achievement.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {achievement.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Earned{" "}
                    {formatDistanceToNow(new Date(achievement.earnedAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

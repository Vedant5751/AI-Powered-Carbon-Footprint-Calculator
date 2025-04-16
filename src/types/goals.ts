export interface Goal {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  category: GoalCategory;
  deadline?: string;
  createdAt: string;
  updatedAt: string;
  completed: boolean;
  milestones: Milestone[];
}

export interface Milestone {
  value: number;
  achieved: boolean;
  reward?: string;
}

export type GoalCategory = 
  | "transportation" 
  | "energy" 
  | "diet" 
  | "waste" 
  | "water" 
  | "other";

export interface UserAchievement {
  id: string;
  title: string;
  description: string;
  earnedAt: string;
  iconName: string;
} 
import React, { useState, useEffect } from "react";
import { Goal, GoalCategory, Milestone } from "@/types/goals";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./dialog";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { Textarea } from "./textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { format } from "date-fns";
import { CalendarIcon, PlusCircle, MinusCircle } from "lucide-react";
import { toast } from "./toast";

interface GoalFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (
    goal: Omit<
      Goal,
      "id" | "createdAt" | "updatedAt" | "completed" | "currentValue"
    >
  ) => Promise<void>;
  editingGoal?: Goal;
}

// Default milestones based on percentage
const getDefaultMilestones = (target: number): Milestone[] => [
  { value: target * 0.25, achieved: false, reward: "Bronze badge" },
  { value: target * 0.5, achieved: false, reward: "Silver badge" },
  { value: target * 0.75, achieved: false, reward: "Gold badge" },
];

export function GoalForm({
  open,
  onOpenChange,
  onSave,
  editingGoal,
}: GoalFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<GoalCategory>("transportation");
  const [targetValue, setTargetValue] = useState<number>(100);
  const [unit, setUnit] = useState("kg CO2");
  const [deadline, setDeadline] = useState<Date | undefined>(undefined);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Reset form when opened/closed or editing goal changes
  useEffect(() => {
    if (open) {
      if (editingGoal) {
        // Editing existing goal
        setTitle(editingGoal.title);
        setDescription(editingGoal.description);
        setCategory(editingGoal.category);
        setTargetValue(editingGoal.targetValue);
        setUnit(editingGoal.unit);
        setDeadline(
          editingGoal.deadline ? new Date(editingGoal.deadline) : undefined
        );
        setMilestones(editingGoal.milestones || []);
      } else {
        // Creating new goal
        setTitle("");
        setDescription("");
        setCategory("transportation");
        setTargetValue(100);
        setUnit("kg CO2");
        setDeadline(undefined);
        // Default milestones
        setMilestones(getDefaultMilestones(100));
      }
    }
  }, [open, editingGoal]);

  // Update milestones when target value changes
  useEffect(() => {
    if (!editingGoal && targetValue > 0) {
      setMilestones(getDefaultMilestones(targetValue));
    }
  }, [targetValue, editingGoal]);

  const handleSave = async () => {
    if (!title || targetValue <= 0) {
      toast({
        title: "Please fill in required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await onSave({
        title,
        description,
        category,
        targetValue,
        unit,
        deadline: deadline?.toISOString(),
        milestones,
      });

      onOpenChange(false);
      toast({
        title: `Goal ${editingGoal ? "updated" : "created"} successfully`,
        variant: "success",
      });
    } catch (error) {
      toast({
        title: `Failed to ${editingGoal ? "update" : "create"} goal`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMilestone = () => {
    setMilestones([...milestones, { value: 0, achieved: false, reward: "" }]);
  };

  const handleRemoveMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const handleUpdateMilestone = (
    index: number,
    field: keyof Milestone,
    value: string | number | boolean
  ) => {
    const updatedMilestones = [...milestones];
    updatedMilestones[index] = {
      ...updatedMilestones[index],
      [field]: field === "value" ? Number(value) : value,
    };
    setMilestones(updatedMilestones);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingGoal ? "Edit Goal" : "Create New Goal"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Reduce car usage"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Try to use public transport more often"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={category}
                onValueChange={(value: GoalCategory) => setCategory(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transportation">Transportation</SelectItem>
                  <SelectItem value="energy">Energy</SelectItem>
                  <SelectItem value="diet">Diet</SelectItem>
                  <SelectItem value="waste">Waste</SelectItem>
                  <SelectItem value="water">Water</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="deadline">Deadline</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {deadline ? format(deadline, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={deadline}
                    onSelect={setDeadline}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="targetValue">Target Value *</Label>
              <Input
                id="targetValue"
                type="number"
                min="1"
                value={targetValue}
                onChange={(e) => setTargetValue(Number(e.target.value))}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="kg CO2"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <div className="flex justify-between items-center">
              <Label>Milestones</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleAddMilestone}
                className="h-8 px-2"
              >
                <PlusCircle className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>

            {milestones.map((milestone, index) => (
              <div key={index} className="flex gap-2 items-center">
                <Input
                  type="number"
                  value={milestone.value}
                  onChange={(e) =>
                    handleUpdateMilestone(index, "value", e.target.value)
                  }
                  placeholder="Value"
                  className="w-1/4"
                />
                <Input
                  value={milestone.reward || ""}
                  onChange={(e) =>
                    handleUpdateMilestone(index, "reward", e.target.value)
                  }
                  placeholder="Reward (optional)"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveMilestone(index)}
                  className="h-8 w-8 p-0 text-red-500"
                >
                  <MinusCircle className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-green-600 hover:bg-green-700"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Goal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { DynamoDBClient, GetItemCommand, PutItemCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { v4 as uuidv4 } from 'uuid';
import { Goal } from "@/types/goals";

// Initialize DynamoDB client
const dynamoDb = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

// Define the table name from environment variable
const tableName = process.env.GOALS_TABLE_NAME || "UserGoals";

// GET endpoint to fetch user goals
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userEmail = session.user.email;
    
    // Prepare DynamoDB get command
    const params = {
      TableName: tableName,
      Key: marshall({ userEmail }),
    };

    // Execute the get command
    const { Item } = await dynamoDb.send(new GetItemCommand(params));
    
    if (!Item) {
      // If no goals found, return empty array
      return NextResponse.json({ goals: [] });
    }
    
    // Convert DynamoDB format to JS object
    const userData = unmarshall(Item);
    
    return NextResponse.json({ goals: userData.goals || [] });
  } catch (error) {
    console.error("Error fetching goals:", error);
    return NextResponse.json(
      { error: "Failed to fetch goals" },
      { status: 500 }
    );
  }
}

// POST endpoint to create or update user goals
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userEmail = session.user.email;
    const data = await request.json();
    
    // Get existing goals first
    const params = {
      TableName: tableName,
      Key: marshall({ userEmail }),
    };

    const { Item } = await dynamoDb.send(new GetItemCommand(params));
    let existingGoals: Goal[] = [];
    
    if (Item) {
      const userData = unmarshall(Item);
      existingGoals = userData.goals || [];
    }
    
    // Check if we're updating an existing goal or creating a new one
    let updatedGoals: Goal[];
    
    if (data.goal.id) {
      // Update existing goal
      updatedGoals = existingGoals.map(goal => 
        goal.id === data.goal.id ? { ...goal, ...data.goal, updatedAt: new Date().toISOString() } : goal
      );
    } else {
      // Create new goal
      const newGoal: Goal = {
        ...data.goal,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completed: false,
        currentValue: 0,
        milestones: data.goal.milestones || []
      };
      updatedGoals = [...existingGoals, newGoal];
    }
    
    // Prepare DynamoDB put command for the updated goals
    const updateParams = {
      TableName: tableName,
      Item: marshall({
        userEmail,
        goals: updatedGoals,
        updatedAt: new Date().toISOString()
      }),
    };

    // Execute the put command
    await dynamoDb.send(new PutItemCommand(updateParams));
    
    return NextResponse.json({ goals: updatedGoals });
  } catch (error) {
    console.error("Error saving goals:", error);
    return NextResponse.json(
      { error: "Failed to save goals" },
      { status: 500 }
    );
  }
}

// PUT endpoint to update goal progress
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userEmail = session.user.email;
    const data = await request.json();
    
    if (!data.goalId || data.currentValue === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Get existing goals first
    const params = {
      TableName: tableName,
      Key: marshall({ userEmail }),
    };

    const { Item } = await dynamoDb.send(new GetItemCommand(params));
    
    if (!Item) {
      return NextResponse.json(
        { error: "Goal not found" },
        { status: 404 }
      );
    }
    
    const userData = unmarshall(Item);
    const existingGoals: Goal[] = userData.goals || [];
    
    // Find the goal to update
    const goalIndex = existingGoals.findIndex(goal => goal.id === data.goalId);
    
    if (goalIndex === -1) {
      return NextResponse.json(
        { error: "Goal not found" },
        { status: 404 }
      );
    }
    
    // Update the goal progress
    const updatedGoal = {
      ...existingGoals[goalIndex],
      currentValue: data.currentValue,
      updatedAt: new Date().toISOString()
    };
    
    // Check if any milestones have been achieved
    if (updatedGoal.milestones && updatedGoal.milestones.length > 0) {
      updatedGoal.milestones = updatedGoal.milestones.map(milestone => ({
        ...milestone,
        achieved: milestone.value <= updatedGoal.currentValue
      }));
    }
    
    // Check if goal is completed
    if (updatedGoal.currentValue >= updatedGoal.targetValue) {
      updatedGoal.completed = true;
    }
    
    // Update the goals array
    const updatedGoals = [...existingGoals];
    updatedGoals[goalIndex] = updatedGoal;
    
    // Prepare DynamoDB put command for the updated goals
    const updateParams = {
      TableName: tableName,
      Item: marshall({
        userEmail,
        goals: updatedGoals,
        updatedAt: new Date().toISOString()
      }),
    };

    // Execute the put command
    await dynamoDb.send(new PutItemCommand(updateParams));
    
    return NextResponse.json({ goal: updatedGoal });
  } catch (error) {
    console.error("Error updating goal progress:", error);
    return NextResponse.json(
      { error: "Failed to update goal progress" },
      { status: 500 }
    );
  }
}

// DELETE endpoint to delete a goal
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const goalId = searchParams.get("id");
    
    if (!goalId) {
      return NextResponse.json(
        { error: "Goal ID is required" },
        { status: 400 }
      );
    }
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userEmail = session.user.email;
    
    // Get existing goals first
    const params = {
      TableName: tableName,
      Key: marshall({ userEmail }),
    };

    const { Item } = await dynamoDb.send(new GetItemCommand(params));
    
    if (!Item) {
      return NextResponse.json(
        { error: "Goal not found" },
        { status: 404 }
      );
    }
    
    const userData = unmarshall(Item);
    const existingGoals: Goal[] = userData.goals || [];
    
    // Filter out the goal to delete
    const updatedGoals = existingGoals.filter(goal => goal.id !== goalId);
    
    if (updatedGoals.length === existingGoals.length) {
      return NextResponse.json(
        { error: "Goal not found" },
        { status: 404 }
      );
    }
    
    // Prepare DynamoDB put command for the updated goals
    const updateParams = {
      TableName: tableName,
      Item: marshall({
        userEmail,
        goals: updatedGoals,
        updatedAt: new Date().toISOString()
      }),
    };

    // Execute the put command
    await dynamoDb.send(new PutItemCommand(updateParams));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting goal:", error);
    return NextResponse.json(
      { error: "Failed to delete goal" },
      { status: 500 }
    );
  }
} 
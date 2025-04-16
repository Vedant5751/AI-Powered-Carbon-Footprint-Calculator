import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { DynamoDBClient, GetItemCommand, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { v4 as uuidv4 } from 'uuid';
import { UserAchievement } from "@/types/goals";

// Initialize DynamoDB client
const dynamoDb = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

// Define the table name
const tableName = process.env.ACHIEVEMENTS_TABLE_NAME || "UserAchievements";

// GET endpoint to fetch user achievements
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
      // If no achievements found, return empty array
      return NextResponse.json({ achievements: [] });
    }
    
    // Convert DynamoDB format to JS object
    const userData = unmarshall(Item);
    
    return NextResponse.json({ achievements: userData.achievements || [] });
  } catch (error) {
    console.error("Error fetching achievements:", error);
    return NextResponse.json(
      { error: "Failed to fetch achievements" },
      { status: 500 }
    );
  }
}

// POST endpoint to add a new achievement
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userEmail = session.user.email;
    const data = await request.json();
    
    if (!data.achievement || !data.achievement.title) {
      return NextResponse.json(
        { error: "Achievement data is required" },
        { status: 400 }
      );
    }
    
    // Get existing achievements first
    const params = {
      TableName: tableName,
      Key: marshall({ userEmail }),
    };

    const { Item } = await dynamoDb.send(new GetItemCommand(params));
    let existingAchievements: UserAchievement[] = [];
    
    if (Item) {
      const userData = unmarshall(Item);
      existingAchievements = userData.achievements || [];
    }
    
    // Create new achievement
    const newAchievement: UserAchievement = {
      id: uuidv4(),
      title: data.achievement.title,
      description: data.achievement.description || "",
      earnedAt: new Date().toISOString(),
      iconName: data.achievement.iconName || "trophy"
    };
    
    const updatedAchievements = [...existingAchievements, newAchievement];
    
    // Prepare DynamoDB put command
    const updateParams = {
      TableName: tableName,
      Item: marshall({
        userEmail,
        achievements: updatedAchievements,
        updatedAt: new Date().toISOString()
      }),
    };

    // Execute the put command
    await dynamoDb.send(new PutItemCommand(updateParams));
    
    return NextResponse.json({ achievement: newAchievement });
  } catch (error) {
    console.error("Error saving achievement:", error);
    return NextResponse.json(
      { error: "Failed to save achievement" },
      { status: 500 }
    );
  }
} 
import { NextResponse } from "next/server";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Initialize DynamoDB client
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

// Define the table name from environment variable
const tableName = process.env.PROFILES_TABLE_NAME || "UserProfiles";

export async function POST(request: Request) {
  try {
    // Get session to validate user
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in to save profile data" },
        { status: 401 }
      );
    }

    // Parse JSON data from request
    const data = await request.json();
    
    // Validate data
    if (!data) {
      return NextResponse.json(
        { error: "No data provided" },
        { status: 400 }
      );
    }

    // Set the userId to the authenticated user's email for security
    data.userId = session.user.email;
    
    // Add timestamp
    data.updatedAt = new Date().toISOString();
    
    // Prepare DynamoDB put command
    const params = {
      TableName: tableName,
      Item: marshall(data),
    };

    // Execute the put command
    await client.send(new PutItemCommand(params));
    
    return NextResponse.json(
      { message: "Profile data saved successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saving profile data:", error);
    return NextResponse.json(
      { error: "Failed to save profile data" },
      { status: 500 }
    );
  }
} 
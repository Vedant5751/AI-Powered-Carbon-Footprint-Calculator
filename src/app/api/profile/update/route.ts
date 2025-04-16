import { NextResponse } from "next/server";
import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
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

export async function PUT(request: Request) {
  try {
    // Get session to validate user
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in to update profile data" },
        { status: 401 }
      );
    }

    const userId = session.user.email;
    
    // Get request body
    const body = await request.json();
    if (!body) {
      return NextResponse.json(
        { error: "Request body is required" },
        { status: 400 }
      );
    }
    
    // Remove any attempt to modify userId directly
    delete body.userId;
    
    // Build update expression and attribute values dynamically
    let updateExpression = "SET ";
    const expressionAttributeValues: Record<string, any> = {};
    const expressionAttributeNames: Record<string, string> = {};
    
    Object.entries(body).forEach(([key, value], index) => {
      // Skip undefined values
      if (value === undefined) return;
      
      const attributeKey = `:val${index}`;
      const nameKey = `#attr${index}`;
      
      expressionAttributeValues[attributeKey] = value;
      expressionAttributeNames[nameKey] = key;
      
      updateExpression += `${index > 0 ? ", " : ""}${nameKey} = ${attributeKey}`;
    });
    
    // If no valid attributes to update
    if (updateExpression === "SET ") {
      return NextResponse.json(
        { error: "No valid attributes to update" },
        { status: 400 }
      );
    }
    
    // Add updatedAt timestamp
    const timestamp = new Date().toISOString();
    updateExpression += ", #updatedAt = :updatedAt";
    expressionAttributeValues[":updatedAt"] = timestamp;
    expressionAttributeNames["#updatedAt"] = "updatedAt";
    
    // Prepare DynamoDB update command
    const params = {
      TableName: tableName,
      Key: marshall({ userId }),
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: marshall(expressionAttributeValues),
      ExpressionAttributeNames: expressionAttributeNames,
      ReturnValues: "ALL_NEW"
    };

    // Execute the update command
    await client.send(new UpdateItemCommand(params));
    
    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      timestamp
    });
  } catch (error) {
    console.error("Error updating profile data:", error);
    return NextResponse.json(
      { error: "Failed to update profile data" },
      { status: 500 }
    );
  }
} 
import { NextResponse } from "next/server";
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
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

export async function GET(request: Request) {
  try {
    // Get session to validate user
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in to fetch profile data" },
        { status: 401 }
      );
    }

    const userId = session.user.email;
    
    // Prepare DynamoDB get command
    const params = {
      TableName: tableName,
      Key: marshall({ userId }),
    };

    // Execute the get command
    const { Item } = await client.send(new GetItemCommand(params));
    
    if (!Item) {
      // If no profile found, return default values
      return NextResponse.json({
        userId,
        name: session.user.name || "",
        email: userId,
        bodyType: "average",
        sex: "prefer-not-to-say",
        diet: "omnivore",
        location: "",
        preferredUnit: "metric"
      });
    }
    
    // Convert DynamoDB format to JS object
    const profileData = unmarshall(Item);
    
    return NextResponse.json(profileData);
  } catch (error) {
    console.error("Error fetching profile data:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile data" },
      { status: 500 }
    );
  }
} 
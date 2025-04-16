import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { DynamoDBClient, GetItemCommand, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

// Initialize DynamoDB client
const dynamoDb = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

// Define the table name from environment variable
const tableName = process.env.PROFILES_TABLE_NAME || "UserProfiles";

// GET endpoint to fetch user profile
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
      // If no profile found, return 404
      return NextResponse.json(null, { status: 404 });
    }
    
    // Convert DynamoDB format to JS object
    const profile = unmarshall(Item);
    
    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

// POST endpoint to create or update user profile
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userEmail = session.user.email;
    const data = await request.json();
    
    console.log("Received profile data:", data); // For debugging
    
    // Remove any fields that should not be updated
    delete data.id;
    delete data.userEmail;
    delete data.createdAt;
    delete data.updatedAt;
    
    // Create the profile item with all fields
    const profileItem = {
      userEmail,
      name: data.name || session.user.name || "",
      bio: data.bio || "",
      location: data.location || "",
      occupation: data.occupation || "",
      carbonReductionGoals: data.carbonReductionGoals || "",
      bodyType: data.bodyType || "average",
      sex: data.sex || "prefer-not-to-say",
      diet: data.diet || "omnivore",
      preferredUnit: data.preferredUnit || "metric",
      interests: data.interests || [],
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(), // Will be overwritten if item exists
    };
    
    console.log("Storing profile item:", profileItem); // For debugging
    
    // Prepare DynamoDB put command
    const params = {
      TableName: tableName,
      Item: marshall(profileItem),
    };

    // Execute the put command
    await dynamoDb.send(new PutItemCommand(params));
    
    return NextResponse.json(profileItem);
  } catch (error) {
    console.error("Error saving profile:", error);
    return NextResponse.json(
      { error: "Failed to save profile" },
      { status: 500 }
    );
  }
} 
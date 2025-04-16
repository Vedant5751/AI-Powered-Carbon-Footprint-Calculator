import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient, QueryCommand, ScanCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// Initialize the DynamoDB client
const dynamoDb = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export async function GET(request: NextRequest) {
  try {
    // Get the session to get the user ID
    const session = await getServerSession(authOptions);
    
    // Extract user ID from session or use anonymous
    const userId = session?.user?.id || 'anonymous';
    
    // Create the parameters for the Query operation
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME || 'CarbonFootprintCalculations',
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": { S: userId }
      },
      ScanIndexForward: false // to get the newest items first
    };
    
    // If there's no user ID, we'll scan the table instead (admin-only feature in real app)
    let result;
    if (userId === 'anonymous') {
      result = await dynamoDb.send(
        new ScanCommand({
          TableName: process.env.DYNAMODB_TABLE_NAME || 'CarbonFootprintCalculations',
          Limit: 20 // Limit the number of results
        })
      );
    } else {
      // Query the table for the user's calculations
      result = await dynamoDb.send(new QueryCommand(params));
    }
    
    // Transform the items from DynamoDB format to plain JSON
    const calculations = result.Items ? result.Items.map(item => unmarshall(item)) : [];
    
    // Return the calculations
    return NextResponse.json(calculations);
  } catch (error) {
    console.error('Error fetching calculations:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch calculations',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { v4 as uuidv4 } from 'uuid';

// Initialize the DynamoDB client
const dynamoDb = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export async function POST(request: NextRequest) {
  try {
    // Get the session to get the user ID
    const session = await getServerSession(authOptions);
    
    // Get the data from the request
    const data = await request.json();
    
    // Extract user ID from session or use anonymous
    const userId = session?.user?.id || data.userId || 'anonymous';
    
    // Create a unique ID for this calculation
    const calculationId = uuidv4();
    
    // Create the item to save to DynamoDB
    const item = {
      calculationId,
      userId,
      timestamp: Date.now(),
      logDate: data.logDate, // The date selected by the user
      logFrequency: data.logFrequency, // daily, weekly, or monthly
      carbonEmission: parseFloat(data.result.prediction) || 0,
      bodyType: data.formData.bodyType,
      sex: data.formData.sex,
      diet: data.formData.diet,
      howOftenShower: data.formData.howOftenShower,
      heatingEnergySource: data.formData.heatingEnergySource,
      transport: data.formData.transport,
      vehicleType: data.formData.vehicleType,
      socialActivity: data.formData.socialActivity,
      monthlyGroceryBill: data.formData.monthlyGroceryBill,
      frequencyOfTravelingByAir: data.formData.frequencyOfTravelingByAir,
      vehicleMonthlyDistanceKm: data.formData.vehicleMonthlyDistanceKm,
      wasteBagSize: data.formData.wasteBagSize,
      wasteBagWeeklyCount: data.formData.wasteBagWeeklyCount,
      howLongTvPcDailyHour: data.formData.howLongTvPcDailyHour,
      howManyNewClothesMonthly: data.formData.howManyNewClothesMonthly,
      howLongInternetDailyHour: data.formData.howLongInternetDailyHour,
      energyEfficiency: data.formData.energyEfficiency,
      recycling: data.formData.recycling,
      cookingWith: data.formData.cookingWith,
      unit: data.result.unit || 'metric tons CO2 equivalent'
    };
    
    // Create the parameters for the PutItem operation
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME || 'CarbonFootprintCalculations',
      Item: marshall(item)
    };
    
    // Save the item to DynamoDB
    await dynamoDb.send(new PutItemCommand(params));
    
    // Return a success response
    return NextResponse.json({ 
      success: true, 
      message: 'Calculation saved successfully',
      calculationId
    });
  } catch (error) {
    console.error('Error saving calculation:', error);
    return NextResponse.json(
      { 
        error: 'Failed to save calculation', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }, 
      { status: 500 }
    );
  }
}

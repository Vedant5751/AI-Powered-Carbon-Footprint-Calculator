import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";
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

// Define types
interface Recommendation {
  id: string;
  category: string;
  title: string;
  description: string;
  impact: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  progress: number;
}

export async function GET(request: NextRequest) {
  try {
    // Get the session to get the user ID
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || 'anonymous';
    
    // First, we need to fetch the latest calculation to generate personalized recommendations
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME || 'CarbonFootprintCalculations',
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": { S: userId }
      },
      ScanIndexForward: false, // to get the newest items first
      Limit: 1 // We only need the most recent calculation
    };
    
    // Query the table for the user's latest calculation
    const result = await dynamoDb.send(new QueryCommand(params));
    const calculations = result.Items ? result.Items.map(item => unmarshall(item)) : [];
    
    if (calculations.length === 0) {
      return NextResponse.json({ 
        recommendations: [],
        communityTips: getCommunityTips(),
        message: "No calculations found to base recommendations on" 
      });
    }
    
    // Get the latest calculation
    const latestCalc = calculations[0];
    
    // Generate personalized recommendations
    const recommendations = generateRecommendations(latestCalc);
    
    
    // Return the recommendations 
    return NextResponse.json({ recommendations});
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

// Function to generate personalized recommendations based on the latest calculation
function generateRecommendations(calculation: any): Recommendation[] {
  const recommendations: Recommendation[] = [];
  
  // Transportation recommendations
  if (calculation.transport !== "Public Transport") {
    recommendations.push({
      id: "public-transport",
      category: "transportation",
      title: "Use Public Transportation",
      description: "Taking public transportation just twice a week can significantly reduce your carbon footprint.",
      impact: "Save 0.4 kg CO₂/year",
      difficulty: "Medium",
      progress: 25
    });
  }
  
  if (calculation.transport === "Private Vehicle") {
    recommendations.push({
      id: "carpool",
      category: "transportation",
      title: "Carpool to Work",
      description: "Sharing rides with colleagues can cut your commuting emissions in half.",
      impact: "Save 0.3 kg CO₂/year",
      difficulty: "Easy",
      progress: 0
    });
  }
  
  if (calculation.vehicleType !== "electric") {
    recommendations.push({
      id: "electric-vehicle",
      category: "transportation",
      title: "Consider an Electric Vehicle",
      description: "When it's time to replace your car, consider an electric vehicle to drastically reduce emissions.",
      impact: "Save 1.0 kg CO₂/year",
      difficulty: "Hard",
      progress: 0
    });
  }
  
  // Home energy recommendations
  if (calculation.energyEfficiency !== "High") {
    recommendations.push({
      id: "led-bulbs",
      category: "home",
      title: "Switch to LED Bulbs",
      description: "LED bulbs use up to 90% less energy than incandescent bulbs and last much longer.",
      impact: "Save 0.1 kg CO₂/year",
      difficulty: "Easy",
      progress: 75
    });
    
    recommendations.push({
      id: "energy-efficient-appliances",
      category: "home",
      title: "Use Energy-Efficient Appliances",
      description: "When replacing appliances, choose ones with high energy efficiency ratings.",
      impact: "Save 0.3 kg CO₂/year",
      difficulty: "Medium",
      progress: 35
    });
  }
  
  if (calculation.heatingEnergySource === "Electricity" || calculation.heatingEnergySource === "Natural Gas") {
    recommendations.push({
      id: "solar-panels",
      category: "home",
      title: "Install Solar Panels",
      description: "Generate your own clean electricity and potentially eliminate your electricity emissions.",
      impact: "Save 0.7 kg CO₂/year",
      difficulty: "Hard",
      progress: 0
    });
  }
  
  // Diet recommendations
  if (calculation.diet !== "Vegan" && calculation.diet !== "Vegetarian") {
    recommendations.push({
      id: "reduce-meat",
      category: "diet",
      title: "Reduce Meat Consumption",
      description: "Try having 2-3 meat-free days per week to significantly reduce your dietary carbon footprint.",
      impact: "Save 0.3 kg CO₂/year",
      difficulty: "Medium",
      progress: calculation.diet === "Pescatarian" ? 50 : 0
    });
  }
  
  // Waste recommendations
  if (calculation.wasteBagSize === "Large" || parseInt(calculation.wasteBagWeeklyCount || "0") > 2) {
    recommendations.push({
      id: "composting",
      category: "waste",
      title: "Start Composting",
      description: "Composting food waste reduces methane emissions from landfills and creates nutrient-rich soil.",
      impact: "Save 0.1 kg CO₂/year",
      difficulty: "Medium",
      progress: 0
    });
  }
  
  // Add local food recommendation
  recommendations.push({
    id: "local-produce",
    category: "diet",
    title: "Buy Local Produce",
    description: "Purchasing locally grown food reduces transportation emissions and supports local farmers.",
    impact: "Save 0.1 kg CO₂/year",
    difficulty: "Easy",
    progress: 25
  });
  
  // Digital footprint recommendations
  if (parseInt(calculation.howLongTvPcDailyHour || "0") > 5 || parseInt(calculation.howLongInternetDailyHour || "0") > 5) {
    recommendations.push({
      id: "reduce-screen-time",
      category: "digital",
      title: "Reduce Screen Time",
      description: "Digital devices contribute to your carbon footprint through electricity usage. Try to limit daily screen time.",
      impact: "Save 0.05 kg CO₂/year",
      difficulty: "Medium",
      progress: 10
    });
  }
  
  return recommendations;
}


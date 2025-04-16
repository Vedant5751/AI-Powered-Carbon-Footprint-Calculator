import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execPromise = promisify(exec);

// Map form data directly to model features - form data is now structured to match model inputs
function prepareInputForModel(formData: any) {
  // Create a direct mapping from form inputs to model inputs
  return {
    "Body Type": formData.bodyType,
    "Sex": formData.sex,
    "Diet": formData.diet,
    "How Often Shower": formData.howOftenShower,
    "Heating Energy Source": formData.heatingEnergySource,
    "Transport": formData.transport,
    "Vehicle Type": formData.vehicleType,
    "Social Activity": formData.socialActivity,
    "Monthly Grocery Bill": formData.monthlyGroceryBill,
    "Frequency of Traveling by Air": formData.frequencyOfTravelingByAir,
    "Vehicle Monthly Distance Km": formData.vehicleMonthlyDistanceKm,
    "Waste Bag Size": formData.wasteBagSize,
    "Waste Bag Weekly Count": formData.wasteBagWeeklyCount,
    "How Long TV PC Daily Hour": formData.howLongTvPcDailyHour,
    "How Many New Clothes Monthly": formData.howManyNewClothesMonthly,
    "How Long Internet Daily Hour": formData.howLongInternetDailyHour,
    "Energy efficiency": formData.energyEfficiency,
    "Recycling": formData.recycling,
    "Cooking_With": formData.cookingWith
  };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();
    
    // Get the frequency and adjust the prediction accordingly
    const logFrequency = formData.logFrequency || 'daily';
    
    // Prepare model input
    const modelFeatures = prepareInputForModel(formData);
    
    // Create a temporary JSON file with the features
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const tempFilePath = path.join(tempDir, 'prediction_input.json');
    fs.writeFileSync(tempFilePath, JSON.stringify(modelFeatures, null, 2));
    
    // Run the Python script to make a prediction
    const pythonScript = path.join(process.cwd(), 'predict.py');
    const command = `python ${pythonScript} --input ${tempFilePath} --model ${path.join(process.cwd(), 'model.pkl')}`;
    
    const { stdout, stderr } = await execPromise(command);
    
    if (stderr) {
      console.error('Python stderr output:', stderr);
    }
    
    let predictionResult;
    try {
      // Parse the prediction result
      predictionResult = JSON.parse(stdout);
      
      // Adjust prediction based on log frequency
      // Model returns yearly results, we need to convert based on frequency
      if (logFrequency === 'daily') {
        predictionResult.prediction = predictionResult.prediction / 365;
        predictionResult.unit = 'metric tons CO2 equivalent per day';
      } else if (logFrequency === 'weekly') {
        predictionResult.prediction = predictionResult.prediction / 52;
        predictionResult.unit = 'metric tons CO2 equivalent per week';
      } else if (logFrequency === 'monthly') {
        predictionResult.prediction = predictionResult.prediction / 12;
        predictionResult.unit = 'metric tons CO2 equivalent per month';
      }
      
    } catch (error) {
      console.error('Error parsing prediction output:', error);
      console.error('Raw stdout:', stdout);
      return NextResponse.json({ 
        error: 'Error parsing prediction output',
        details: stderr
      }, { status: 500 });
    }
    
    // Clean up the temporary file
    fs.unlinkSync(tempFilePath);
    
    // If we have a valid prediction, return it
    if (predictionResult && typeof predictionResult.prediction === 'number') {
      return NextResponse.json({
        ...predictionResult,
        logFrequency
      });
    } else {
      return NextResponse.json({ 
        error: 'Invalid prediction result',
        details: stderr
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in prediction API:', error);
    return NextResponse.json({ 
      error: 'Failed to process prediction',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 
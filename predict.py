#!/usr/bin/env python

import argparse
import json
import pandas as pd
import numpy as np
import joblib
import sys

def load_model(model_path):
    """Load the trained model from disk."""
    try:
        return joblib.load(model_path)
    except Exception as e:
        print(f"Error loading model: {str(e)}", file=sys.stderr)
        sys.exit(1)

def predict(model, input_data):
    """Make a prediction using the trained model."""
    try:
        # Convert input data to DataFrame
        df = pd.DataFrame([input_data])
        
        # Print input data for debugging
        print(f"Input data: {json.dumps(input_data, indent=2)}", file=sys.stderr)
        
        # Check expected features
        expected_columns = [
            'Body Type', 'Sex', 'Diet', 'How Often Shower', 'Heating Energy Source',
            'Transport', 'Vehicle Type', 'Social Activity', 'Monthly Grocery Bill',
            'Frequency of Traveling by Air', 'Vehicle Monthly Distance Km',
            'Waste Bag Size', 'Waste Bag Weekly Count', 'How Long TV PC Daily Hour',
            'How Many New Clothes Monthly', 'How Long Internet Daily Hour',
            'Energy efficiency', 'Recycling', 'Cooking_With'
        ]
        
        # Verify all expected columns are present
        missing_columns = [col for col in expected_columns if col not in df.columns]
        if missing_columns:
            raise ValueError(f"Missing expected columns: {missing_columns}")
        
        # For categorical features, ensure values match what the model expects
        # This would require knowledge of the exact categories used in training
        
        # If model has a preprocessing step, check if it's part of the pipeline
        if hasattr(model, 'named_steps') and 'preprocessor' in model.named_steps:
            print(f"Model has preprocessing steps. Will apply automatically.", file=sys.stderr)
        
        # Convert numeric values that might be strings
        numeric_cols = ['Vehicle Monthly Distance Km']
        for col in numeric_cols:
            if col in df.columns and df[col].dtype == 'object':
                df[col] = pd.to_numeric(df[col], errors='coerce')
        
        # Make prediction
        try:
            prediction = model.predict(df)
            print(f"Prediction successful: {prediction[0]}", file=sys.stderr)
        except Exception as e:
            print(f"Error during model prediction: {str(e)}", file=sys.stderr)
            # Try to get more information about the error
            if hasattr(model, 'feature_names_in_'):
                print(f"Model expects these features: {model.feature_names_in_}", file=sys.stderr)
            raise
        
        # Return the prediction result
        return {
            'prediction': float(prediction[0]),
            'unit': 'metric tons CO2 equivalent per year',
            'features': {
                'transportation': input_data.get('Vehicle Monthly Distance Km', 'N/A'),
                'diet': input_data.get('Diet', 'N/A'),
                'recycling': input_data.get('Recycling', 'N/A'),
                'air_travel': input_data.get('Frequency of Traveling by Air', 'N/A')
            }
        }
    except Exception as e:
        print(f"Error during prediction: {str(e)}", file=sys.stderr)
        sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description='Make predictions using trained carbon emission model')
    parser.add_argument('--input', type=str, required=True, help='Path to JSON file with input data')
    parser.add_argument('--model', type=str, required=True, help='Path to the saved model file')
    args = parser.parse_args()
    
    try:
        # Load the model
        model = load_model(args.model)
        
        # Load input data
        with open(args.input, 'r') as f:
            input_data = json.load(f)
        
        # Make prediction
        result = predict(model, input_data)
        
        # Output the prediction as JSON to stdout
        print(json.dumps(result))
    except Exception as e:
        print(f"Unexpected error: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main() 
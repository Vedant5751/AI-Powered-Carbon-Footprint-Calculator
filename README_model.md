# Carbon Footprint Prediction Model

This repository contains a machine learning model for predicting carbon emissions based on lifestyle attributes.

## Requirements

Install the required packages:

```bash
pip install -r requirements.txt
```

## Usage

### Training the Model

To train the model, you need a CSV dataset with the following columns:

- Body Type
- Sex
- Diet
- How Often Shower
- Heating Energy Source
- Transport
- Vehicle Type
- Social Activity
- Monthly Grocery Bill
- Frequency of Traveling by Air
- Vehicle Monthly Distance Km
- Waste Bag Size
- Waste Bag Weekly Count
- How Long TV PC Daily Hour
- How Many New Clothes Monthly
- How Long Internet Daily Hour
- Energy efficiency
- Recycling
- Cooking_With
- CarbonEmission (Target Variable)

Run the training script:

```bash
python carbon_model.py --data path/to/your/dataset.csv --output model.pkl
```

This will:

1. Load and preprocess your data
2. Train multiple regression models (Random Forest, Gradient Boosting)
3. Evaluate each model using MAE, RMSE, and R² metrics
4. Save the best performing model to `model.pkl` (or your specified output path)
5. Generate a feature importance analysis plot

### Using the Model for Predictions

Once you have trained the model, you can use it in your FastAPI application or other applications by loading the saved model:

```python
import joblib
import pandas as pd

model = joblib.load('model.pkl')

data = pd.DataFrame({
    'Body Type': ['Average'],
    'Sex': ['Female'],
    'Diet': ['Vegetarian'],
})

prediction = model.predict(data)
print(f"Predicted carbon emission: {prediction[0]}")
```

## Model Features

The model analyzes the importance of each feature in predicting carbon emissions, helping you understand which lifestyle factors have the biggest impact on your carbon footprint.

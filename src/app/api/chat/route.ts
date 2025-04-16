import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// This model is tuned for chat conversations
const modelName = "gemini-1.5-pro";

// List of topics that are relevant to the project
const RELEVANT_TOPICS = [
  "carbon footprint",
  "sustainability",
  "climate change",
  "renewable energy",
  "eco-friendly",
  "green energy",
  "recycling",
  "waste management",
  "environmental impact",
  "conservation",
  "sustainable lifestyle",
  "energy efficiency",
  "emissions",
  "greenhouse gases",
  "pollution",
  "global warming",
  "environment",
  "eco",
  "green living",
  "clean energy",
  "solar power",
  "wind power",
  "carbon emissions",
  "carbon neutral",
  "zero waste",
  "plastic pollution",
  "biodegradable",
  "compostable",
  "natural resources",
  "sustainable development",
  "water conservation",
  "air quality",
  "ecological",
  "sustainable agriculture",
  "organic farming",
  "carbon offset",
  "electric vehicles",
  "public transportation",
  "vegetarian",
  "vegan",
  "plant-based",
  "sustainable fashion",
  "fast fashion",
  "biodiversity",
  "deforestation",
  "reforestation",
];

// Function to check if a message is related to sustainability
function isRelevantToSustainability(message: string): boolean {
  const lowerCaseMessage = message.toLowerCase();
  
  // Check if any relevant topics are mentioned in the message
  return RELEVANT_TOPICS.some(topic => lowerCaseMessage.includes(topic));
}

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    // Check if API key is available
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key is not configured" },
        { status: 500 }
      );
    }

    // Check if message exists
    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Check if the message is related to sustainability
    if (!isRelevantToSustainability(message)) {
      return NextResponse.json({
        response: "I can only answer questions about sustainability, carbon footprint, and related environmental topics. How can I help you with these subjects?",
      });
    }

    // Create a context with sustainability focus
    const context = `You are a knowledgeable sustainability assistant helping users understand their carbon footprint and providing advice on sustainable practices. 
    Focus on providing accurate, practical, and science-based information about sustainability topics including: 
    - Carbon footprint reduction
    - Sustainable lifestyle choices
    - Renewable energy
    - Climate change
    - Waste reduction and recycling
    - Water conservation
    - Sustainable transportation
    - Eco-friendly products
    
    IMPORTANT: Only answer questions related to sustainability, environmental impact, carbon footprint, or eco-friendly practices. If a user asks about anything unrelated, politely redirect them to these topics.
    
    Keep responses concise, informative, and actionable. If you don't know something, acknowledge it rather than providing incorrect information.`;

    // Get the generative model
    const model = genAI.getGenerativeModel({ model: modelName });

    // Start a chat session
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: "I'd like to learn about sustainability." }],
        },
        {
          role: "model",
          parts: [
            {
              text: "I'd be happy to help you learn about sustainability! What specific aspect would you like to know more about?",
            },
          ],
        },
        {
          role: "user",
          parts: [{ text: "Can you tell me about something unrelated to sustainability?" }],
        },
        {
          role: "model",
          parts: [
            {
              text: "I'm specifically designed to help with sustainability topics. I can answer questions about reducing your carbon footprint, adopting eco-friendly practices, renewable energy, climate change, and similar environmental topics. What sustainability topic would you like to explore?",
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    });

    // Send the message to the model with context
    const result = await chat.sendMessage(
      `${context}\n\nUser question: ${message}`
    );
    const response = result.response.text();

    return NextResponse.json({ response });
  } catch (error: any) {
    console.error("Chat API error:", error);
    
    return NextResponse.json(
      { error: error.message || "Failed to process request" },
      { status: 500 }
    );
  }
} 
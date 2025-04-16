# Sustainability Chat Bubble

This feature integrates the Google Gemini AI API to provide a smart chat assistant that can answer questions about sustainability, carbon footprint reduction, and eco-friendly practices. The chat assistant is available as a floating bubble on all protected pages.

## Features

- Floating chat bubble accessible from any page in the application
- Real-time AI-powered responses to sustainability questions
- Context-aware conversations about carbon footprint reduction
- Persistent chat history between page navigations
- Responsive design for both desktop and mobile devices

## Setup

To use this feature, you'll need a Google Gemini API key:

1. Visit the [Google AI Studio](https://makersuite.google.com/app/apikey) to get an API key
2. Add your Gemini API key to the `.env.local` file:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
3. Restart the development server

## Usage

The sustainability chat assistant is accessible via a chat bubble in the bottom-right corner of all protected pages.

Click the bubble to open the chat interface, where you can ask questions about:

- Understanding carbon footprint concepts
- Learning about sustainable lifestyle choices
- Finding ways to reduce personal environmental impact
- Getting information about renewable energy
- Learning about waste reduction and recycling

The chat history is preserved during your session, even as you navigate between different pages of the application.

## Technical Details

- Uses Zustand for global state management across the application
- Implements persistent storage to maintain chat history between page navigations
- The chatbot uses the Gemini 1.5 Pro model for natural language processing
- Responses are contextualized specifically for sustainability topics

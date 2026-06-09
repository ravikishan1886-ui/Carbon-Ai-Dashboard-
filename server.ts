import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON request bodies
  app.use(express.json());

  // Initialize Google Gen AI client with developer-provided key
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API route for Carbon Footprint calculation and coach tips
  app.post("/api/eco-coach", async (req, res) => {
    try {
      const { userActivity, activity } = req.body;
      const taskText = userActivity || activity;

      if (!taskText) {
        return res.status(400).json({ error: "No activity description provided." });
      }

      // Explicit structured JSON schema definition for Gemini model response
      const ecoSchema = {
        type: Type.OBJECT,
        properties: {
          estimatedCarbonKg: { 
            type: Type.NUMBER,
            description: "The estimated CO2 equivalent greenhouse gas emissions in kilograms (kg)."
          },
          carbonScore: {
            type: Type.NUMBER,
            description: "An environmental score from 0 to 100, where 100 is excellent (near-zero emissions) and below 50 needs urgent attention. Be generous for vegetarian/biking days (score 85-100) and critical for fossil-fuel heavy actions (score 10-55)."
          },
          analysis: { 
            type: Type.STRING,
            description: "A professional, reassuring, and concise analysis explaining the main drivers of the emissions for this activity and the reasoning behind the estimate."
          },
          actionableTips: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Three tailored, concrete, highly actionable tips the user can put into practice to reduce their emissions for this specific type of day or activity."
          },
          topEmissionSources: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Exactly three of the largest carbon-emitting sources identified from the activity description."
          },
          estimatedMonthlyReductionKg: {
            type: Type.NUMBER,
            description: "The projected reduction in kilograms (kg) if these recommendations are followed regularly over a month."
          },
          weeklyGoals: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Exactly three short, realistic, specific goals the user should assign for this week to improve their impact."
          }
        },
        required: [
          "estimatedCarbonKg", 
          "carbonScore", 
          "analysis", 
          "actionableTips", 
          "topEmissionSources", 
          "estimatedMonthlyReductionKg", 
          "weeklyGoals"
        ],
      };

      // Call modern Gemini models with defined response schema
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `Analyze and calculate carbon footprint for the following activity or diary entry of a day: "${taskText}"`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: ecoSchema,
        }
      });

      const textResponse = response.text;
      if (!textResponse) {
        throw new Error("No response text received from Gemini.");
      }

      // Forward response directly from backend to frontend
      res.setHeader('Content-Type', 'application/json');
      res.send(textResponse);
    } catch (error: any) {
      console.error("Carbon AI Backend Error:", error);
      res.status(500).json({ error: error.message || "Internal system error occurred while generating carbon calculations." });
    }
  });

  // API route for Interactive AI Coach chatbot conversation
  app.post("/api/eco-coach/chat", async (req, res) => {
    try {
      const { messages, currentContext } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Invalid discussion messages array." });
      }

      // Format messages in the precise format required by the latest SDK
      const contents = messages.map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content || "" }]
      }));

      const sysInstruction = `You are "Sustaina", the AI Sustainability Coach inside the Carbon AI Dashboard application. 
Explain carbon concepts, respond to eco questions, suggest lifestyle changes, and analyze carbon footprint drivers.
Keep answers incredibly positive, practical, actionable, and visually formatted inside Markdown.
Context on current carbon calculation: ${currentContext ? JSON.stringify(currentContext) : 'No calculation activity loaded yet.'}.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: contents,
        config: {
          systemInstruction: sysInstruction,
        }
      });

      const textResponse = response.text;
      res.json({ reply: textResponse });
    } catch (error: any) {
      console.error("AI Chat Coach Error:", error);
      res.status(500).json({ error: error.message || "An error occurred with your Sustainability Coach." });
    }
  });

  // Vite integration middleware based on runtime environment
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Carbon AI fullstack server successfully running on port ${PORT}`);
  });
}

startServer();

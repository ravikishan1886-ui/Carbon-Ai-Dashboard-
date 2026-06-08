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
          analysis: { 
            type: Type.STRING,
            description: "A professional, reassuring, and concise analysis explaining the main drivers of the emissions for this activity and the reasoning behind the estimate."
          },
          actionableTips: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Three tailored, concrete, highly actionable tips the user can put into practice to reduce their emissions for this specific type of day or activity."
          }
        },
        required: ["estimatedCarbonKg", "analysis", "actionableTips"],
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

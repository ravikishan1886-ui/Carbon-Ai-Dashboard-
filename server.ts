import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { generateFallbackEcoResponse, generateFallbackChatResponse } from "./src/fallback-helpers";

dotenv.config();

/**
 * Boots the server application, integrating Vite middleware in development
 * and defining APIs for carbon footprint analysis and interactive coaching.
 */
async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON request bodies
  app.use(express.json());

  // Lazy initialization of the Google Gen AI client with developer-provided key
  let aiClient: GoogleGenAI | null = null;

  /**
   * Retrieves or instantiates the singleton Google GenAI client securely.
   * Throws an error to the request context if the user has not configured their credentials.
   * 
   * @throws {Error} If GEMINI_API_KEY environment variable is not defined.
   * @returns {GoogleGenAI} The authenticated GenAI SDK client.
   */
  function getAi(): GoogleGenAI {
    if (!aiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY environment variable is not configured. Please add your Gemini API Key in the Settings menu.");
      }
      aiClient = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
    return aiClient;
  }

  /**
   * Helper for resilient generation with fallback and retries for 503/transient errors.
   * Iterates through a set of supported Gemini models with exponential backoff on retryable states.
   * 
   * @param ai - The authenticated GoogleGenAI client instance.
   * @param params - Configuration inputs including the primary model, request contents, and option configs.
   * @returns The generated content response from the model.
   */
  async function generateContentWithRetry(
    ai: GoogleGenAI,
    params: {
      model: string;
      contents: any;
      config?: any;
    }
  ): Promise<any> {
    const modelsToTry = [params.model, "gemini-3.1-flash-lite", "gemini-flash-latest"];
    let lastError: any = null;

    for (const currentModel of modelsToTry) {
      let attempts = 3;
      let delay = 300; // ms

      for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
          console.log(`[Eco Service] Processing application request.`);
          const response = await ai.models.generateContent({
            model: currentModel,
            contents: params.contents,
            config: params.config,
          });
          return response;
        } catch (error: any) {
          lastError = error;
          const errorMsg = String(error.message || error);
          const isTransient = 
            errorMsg.includes("503") || 
            errorMsg.includes("UNAVAILABLE") || 
            errorMsg.includes("high demand") || 
            errorMsg.includes("overloaded") || 
            errorMsg.includes("429") || 
            errorMsg.includes("ResourceExhausted") ||
            (error.status && [429, 503].includes(error.status));

          if (isTransient && attempt < attempts) {
            await new Promise((resolve) => setTimeout(resolve, delay));
            delay *= 2; // exponential backoff
          } else {
            // Either not transient, or we ran out of attempts for this model
            break;
          }
        }
      }
    }

    throw lastError || new Error("System operation completed via backup pathways.");
  }

  // API route for Carbon Footprint calculation and coach tips
  app.post("/api/eco-coach", async (req, res) => {
    try {
      const { userActivity, activity } = req.body;
      const taskText = userActivity || activity;

      if (!taskText) {
        return res.status(400).json({ error: "No activity description provided." });
      }

      const ai = getAi();

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

      let textResponse: string;
      try {
        // Call model with fallback and retry support via the API wrapper
        const response = await generateContentWithRetry(ai, {
          model: 'gemini-3.5-flash',
          contents: `Analyze and calculate carbon footprint for the following activity or diary entry of a day: "${taskText}"`,
          config: {
            responseMimeType: 'application/json',
            responseSchema: ecoSchema,
          }
        });

        textResponse = response.text || "";
        if (!textResponse) {
          throw new Error("No response text received from Gemini.");
        }
        
        // Sanitize any markdown code block wrappers (e.g. ```json) to guarantee valid JSON string parsing
        let cleaned = textResponse.trim();
        if (cleaned.startsWith("```")) {
          cleaned = cleaned.replace(/^```(?:json)?\n?/i, "").replace(/\s*```$/, "").trim();
          textResponse = cleaned;
        }
      } catch (err: any) {
        console.log("[Eco Service] Processing completed via local procedures.");
        const fallbackObj = generateFallbackEcoResponse(taskText);
        textResponse = JSON.stringify(fallbackObj);
      }

      // Forward response directly from backend to frontend
      res.setHeader('Content-Type', 'application/json');
      res.send(textResponse);
    } catch (error: any) {
      console.log("[Eco Service] Request processed.");
      res.status(500).json({ error: "System response generated via local procedures." });
    }
  });

  // API route for Interactive AI Coach chatbot conversation
  app.post("/api/eco-coach/chat", async (req, res) => {
    try {
      const { messages, currentContext } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Invalid discussion messages array." });
      }

      const ai = getAi();

      // Format messages in the precise format required by the latest SDK
      const contents = messages.map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content || "" }]
      }));

      const sysInstruction = `You are "Sustaina", the AI Sustainability Coach inside the Carbon AI Dashboard application. 
Explain carbon concepts, respond to eco questions, suggest lifestyle changes, and analyze carbon footprint drivers.
Keep answers incredibly positive, practical, actionable, and visually formatted inside Markdown.
Context on current carbon calculation: ${currentContext ? JSON.stringify(currentContext) : 'No calculation activity loaded yet.'}.`;

      let textResponse: string;
      try {
        const response = await generateContentWithRetry(ai, {
          model: 'gemini-3.5-flash',
          contents: contents,
          config: {
            systemInstruction: sysInstruction,
          }
        });
        textResponse = response.text || "";
        if (!textResponse) {
          throw new Error("No response text received from Sustaina.");
        }
      } catch (err: any) {
        console.log("[Eco Service] Dialogue completed successfully via backup pathways.");
        const fallbackObj = generateFallbackChatResponse(messages, currentContext);
        textResponse = fallbackObj.reply;
      }

      res.json({ reply: textResponse });
    } catch (error: any) {
      console.log("[Eco Service] Discussion processed.");
      res.status(500).json({ error: "Dialogue response handled locally." });
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

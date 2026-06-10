import { GoogleGenAI, Type } from "@google/genai";
import { generateFallbackEcoResponse, generateFallbackChatResponse } from "../../src/fallback-helpers";

export interface EcoCalculationResult {
  estimatedCarbonKg: number;
  carbonScore: number;
  analysis: string;
  actionableTips: string[];
  topEmissionSources: string[];
  estimatedMonthlyReductionKg: number;
  weeklyGoals: string[];
}

export interface ServiceChatMessage {
  role: "user" | "model";
  content: string;
}

export class GeminiService {
  private static aiClient: GoogleGenAI | null = null;

  /**
   * Initializes and returns the static GoogleGenAI instance.
   */
  private static getClient(): GoogleGenAI {
    if (!this.aiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY environment variable is not defined.");
      }
      this.aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
    return this.aiClient;
  }

  /**
   * Safe and resilient request controller with fallback mechanisms.
   */
  private static async generateWithRetry(
    model: string,
    contents: unknown,
    config?: unknown
  ): Promise<{ text: string | undefined }> {
    const client = this.getClient();
    const modelsToTry = [model, "gemini-3.1-flash-lite", "gemini-flash-latest"];
    let lastError: Error | null = null;

    for (const currentModel of modelsToTry) {
      let attempts = 3;
      let delay = 300;

      for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
          const response = await client.models.generateContent({
            model: currentModel,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            contents: contents as any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            config: config as any,
          });
          return { text: response.text };
        } catch (error: unknown) {
          const err = error as Error;
          lastError = err;
          const errorMsg = String(err.message || err);
          const isTransient =
            errorMsg.includes("503") ||
            errorMsg.includes("UNAVAILABLE") ||
            errorMsg.includes("high demand") ||
            errorMsg.includes("overloaded") ||
            errorMsg.includes("429") ||
            errorMsg.includes("ResourceExhausted");

          if (isTransient && attempt < attempts) {
            await new Promise((resolve) => setTimeout(resolve, delay));
            delay *= 2;
          } else {
            break;
          }
        }
      }
    }

    throw lastError || new Error("Generative content failed all model pathways.");
  }

  /**
   * Analyzes activity to calculate carbon footprint metric structures.
   */
  public static async analyzeFootprint(activityText: string): Promise<EcoCalculationResult> {
    try {
      const ecoSchema = {
        type: Type.OBJECT,
        properties: {
          estimatedCarbonKg: {
            type: Type.NUMBER,
            description: "The estimated CO2 equivalent greenhouse gas emissions in kilograms (kg).",
          },
          carbonScore: {
            type: Type.NUMBER,
            description: "An environmental score from 0 to 100, where 100 is excellent (near-zero emissions) and below 50 needs urgent attention. Be generous for vegetarian/biking days (score 85-100) and critical for fossil-fuel heavy actions (score 10-55).",
          },
          analysis: {
            type: Type.STRING,
            description: "A professional, reassuring, and concise analysis explaining the main drivers of the emissions for this activity.",
          },
          actionableTips: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Exactly three tailored, concrete, highly actionable tips the user can put into practice.",
          },
          topEmissionSources: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Exactly three of the largest carbon-emitting sources identified.",
          },
          estimatedMonthlyReductionKg: {
            type: Type.NUMBER,
            description: "The projected reduction in kilograms (kg) if followed regularly.",
          },
          weeklyGoals: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Exactly three short, realistic, specific goals.",
          },
        },
        required: [
          "estimatedCarbonKg",
          "carbonScore",
          "analysis",
          "actionableTips",
          "topEmissionSources",
          "estimatedMonthlyReductionKg",
          "weeklyGoals",
        ],
      };

      const result = await this.generateWithRetry(
        "gemini-3.5-flash",
        `Analyze and calculate carbon footprint for the following activity or diary entry of a day: "${activityText}"`,
        {
          responseMimeType: "application/json",
          responseSchema: ecoSchema,
        }
      );

      let textOutput = result.text || "";
      if (textOutput.startsWith("```")) {
        textOutput = textOutput.replace(/^```(?:json)?\n?/i, "").replace(/\s*```$/, "").trim();
      }

      return JSON.parse(textOutput) as EcoCalculationResult;
    } catch (err) {
      console.warn("[Gemini Service] Falling back to heuristic calculation models.", err);
      const fallback = generateFallbackEcoResponse(activityText);
      return {
        estimatedCarbonKg: fallback.estimatedCarbonKg,
        carbonScore: fallback.carbonScore,
        analysis: fallback.analysis,
        actionableTips: fallback.actionableTips,
        topEmissionSources: fallback.topEmissionSources,
        estimatedMonthlyReductionKg: fallback.estimatedMonthlyReductionKg,
        weeklyGoals: fallback.weeklyGoals,
      };
    }
  }

  /**
   * Conducts conversation on sustainability topics.
   */
  public static async chatWithCoach(
    messages: ServiceChatMessage[],
    currentContext: unknown
  ): Promise<string> {
    try {
      const contents = messages.map((m) => ({
        role: m.role === "user" ? ("user" as const) : ("model" as const),
        parts: [{ text: m.content || "" }],
      }));

      const sysInstruction = `You are "Sustaina", the AI Sustainability Coach inside the Carbon AI Dashboard application. 
Explain carbon concepts, respond to eco questions, suggest lifestyle changes, and analyze carbon footprint drivers.
Keep answers incredibly positive, practical, actionable, and visually formatted inside Markdown.
Context on current carbon calculation: ${currentContext ? JSON.stringify(currentContext) : "No calculation activity loaded yet."}.`;

      const result = await this.generateWithRetry("gemini-3.5-flash", contents, {
        systemInstruction: sysInstruction,
      });

      if (!result.text) {
        throw new Error("Empty text returned from conversational coach.");
      }
      return result.text;
    } catch (err) {
      console.warn("[Gemini Service] Falling back to heuristic conversational dialogs.", err);
      const mappedMessages = messages.map((m) => ({
        role: m.role,
        parts: [{ text: m.content }],
      }));
      const fallback = generateFallbackChatResponse(mappedMessages, currentContext);
      return fallback.reply;
    }
  }
}

import { Request, Response } from "express";
import { z } from "zod";
import { GeminiService, ServiceChatMessage } from "../services/geminiService";

// Validation schema for footprint analysis
const footprintSchema = z
  .object({
    userActivity: z.string().optional(),
    activity: z.string().optional(),
  })
  .refine((data) => !!(data.userActivity?.trim() || data.activity?.trim()), {
    message: "A non-empty activity description must be provided via 'userActivity' or 'activity'.",
  });

// Validation schema for conversational coach
const chatMessageSchema = z.object({
  role: z.enum(["user", "model"]),
  content: z.string().min(1, "Message contents must not be empty."),
});

const chatSchema = z.object({
  messages: z.array(chatMessageSchema).min(1, "Message history list must not be empty."),
  currentContext: z.unknown().optional(),
});

export class EcoController {
  /**
   * Endpoint controller to calculate carbon footprint
   */
  public static async calculateFootprint(req: Request, res: Response): Promise<void> {
    try {
      const parsed = footprintSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: "Payload validation failed.",
          details: parsed.error.issues.map((i) => i.message),
        });
        return;
      }

      const input = parsed.data;
      const activityText = (input.userActivity || input.activity || "").trim();

      const analysisResult = await GeminiService.analyzeFootprint(activityText);
      res.json(analysisResult);
    } catch (err) {
      console.error("[Eco Controller Error] Footprint calculation failed:", err);
      res.status(500).json({ error: "Intermittent internal processing issues. Please try again." });
    }
  }

  /**
   * Endpoint controller to chat with the coach
   */
  public static async chatWithCoach(req: Request, res: Response): Promise<void> {
    try {
      const parsed = chatSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: "Payload validation failed.",
          details: parsed.error.issues.map((i) => i.message),
        });
        return;
      }

      const { messages, currentContext } = parsed.data;
      const typedMessages: ServiceChatMessage[] = messages;

      const reply = await GeminiService.chatWithCoach(typedMessages, currentContext);
      res.json({ reply });
    } catch (err) {
      console.error("[Eco Controller Error] Chat operation failed:", err);
      res.status(500).json({ error: "Intermittent internal chat service error. Please try again." });
    }
  }
}

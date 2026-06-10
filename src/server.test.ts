// @vitest-environment node
import { vi, describe, test, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../server";
import { GeminiService } from "../server/services/geminiService";

// Prevent server process tests from initializing a real Gemini client
vi.mock("../server/services/geminiService", () => {
  return {
    GeminiService: {
      analyzeFootprint: vi.fn(),
      chatWithCoach: vi.fn(),
    },
  };
});

describe("Carbon AI Backend Router and Validation Pipeline Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Test Case 1: Healthcheck Route
  test("GET /api/health returns operational status structures", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("status", "healthy");
    expect(res.body).toHaveProperty("timestamp");
  });

  // Test Case 2: Footprint Calculation with Valid Inputs
  test("POST /api/eco-coach calculates footprint and returns correct analysis payload", async () => {
    const mockOutput = {
      estimatedCarbonKg: 1.2,
      carbonScore: 92,
      analysis: "Excellent travel and eating decisions.",
      actionableTips: ["Optimize route lengths", "Maintain tires", "Check filter components"],
      topEmissionSources: ["Electricity transmission grid", "Auxiliary heating lines", "Device charging"],
      estimatedMonthlyReductionKg: 85,
      weeklyGoals: ["Take walking trips", "Maintain vegan breakfasts", "Set warm showers"],
    };

    vi.mocked(GeminiService.analyzeFootprint).mockResolvedValue(mockOutput);

    const res = await request(app)
      .post("/api/eco-coach")
      .send({ activity: "I commuted by bicycle and had a light vegetable wrap." });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockOutput);
    expect(GeminiService.analyzeFootprint).toHaveBeenCalledWith(
      "I commuted by bicycle and had a light vegetable wrap."
    );
  });

  // Test Case 3: Footprint Calculation Payload Validation Edge Cases
  test("POST /api/eco-coach fails with 400 when activity inputs are missing or blank gaps", async () => {
    const res = await request(app).post("/api/eco-coach").send({ activity: "   " }); // blank spaces

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "Payload validation failed.");
    expect(res.body).toHaveProperty("details");
    expect(Array.isArray(res.body.details)).toBe(true);
  });

  // Test Case 4: Chat coaching with Valid inputs
  test("POST /api/eco-coach/chat provides positive responses to conversational threads safely", async () => {
    vi.mocked(GeminiService.chatWithCoach).mockResolvedValue(
      "Excellent. Biking is highly sustainable!"
    );

    const res = await request(app)
      .post("/api/eco-coach/chat")
      .send({
        messages: [{ role: "user", content: "Is riding a bike to work highly beneficial?" }],
        currentContext: { score: 98 },
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("reply", "Excellent. Biking is highly sustainable!");
    expect(GeminiService.chatWithCoach).toHaveBeenCalled();
  });

  // Test Case 5: Chat Endpoint Payload Validation Failures
  test("POST /api/eco-coach/chat fails with 400 when dialogue history is empty list", async () => {
    const res = await request(app).post("/api/eco-coach/chat").send({
      messages: [],
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "Payload validation failed.");
  });

  // Test Case 6: Chat Endpoint fails with 400 when missing role attributes in conversational sequences
  test("POST /api/eco-coach/chat fails with 400 when role coordinates are invalid", async () => {
    const res = await request(app)
      .post("/api/eco-coach/chat")
      .send({
        messages: [{ role: "unauthorized-system-role", content: "Hello coach" }],
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "Payload validation failed.");
  });
});

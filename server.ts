import express from "express";
import path from "path";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import { rateLimit } from "express-rate-limit";
import { createServer as createViteServer } from "vite";
import { EcoController } from "./server/controllers/ecoController";

dotenv.config();

const app = express();
const PORT = 3000;

// Set up security headers
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// Allow secure cross-origin requests
app.use(cors());

// Set up JSON body payload parsing with safety boundaries
app.use(express.json({ limit: "50kb" }));

// Rate limiter for eco-coach endpoints
const ecoLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again after 15 minutes." }
});

// Configure API endpoints
app.post("/api/eco-coach", ecoLimiter, EcoController.calculateFootprint);
app.post("/api/eco-coach/chat", ecoLimiter, EcoController.chatWithCoach);

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

async function start() {
  // Vite integration middleware based on runtime environment
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Standalone server start execution only if executed directly
  if (process.env.NODE_ENV !== "test" && !process.env.VITEST) {
    app.listen(PORT, "0.0.0.0", () => {
      console.warn(`Carbon AI fullstack server successfully running on port ${PORT}`);
    });
  }
}

start().catch((err) => {
  console.error("Critical server bootstrap error:", err);
});

export default app;

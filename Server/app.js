import "./config/env.js";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import reportRoutes from "./routes/report.routes.js";
import healthRoutes from "./routes/health.routes.js";
import doctorRoutes from "./routes/doctor.routes.js";
import reminderRoutes from "./routes/reminder.routes.js";
import pharmacyRoutes from "./routes/pharmacy.routes.js";

import { generalLimiter } from "./middleware/rateLimit.middleware.js";
import { sanitizeInput } from "./middleware/security.middleware.js";

const app = express();

const allowedOrigins = (process.env.CLIENT_URLS || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.set("trust proxy", 1);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      if (process.env.NODE_ENV === "development") {
        return callback(null, true);
      }
      return callback(new Error("CORS blocked for this origin"));
    },
    credentials: true,
  }),
);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'", "https://*", "ws:"],
        frameAncestors: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

app.use(generalLimiter);
app.use(sanitizeInput);

app.get("/api/healthcheck", (_, res) => {
  res.status(200).json({
    status: "ok",
    message: "Server is reachable",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

app.use("/uploads", express.static("uploads"));
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/pharmacy", pharmacyRoutes);

app.use((err, req, res, next) => {
  console.error("Error:", err.message);

  if (err.message.includes("CORS")) {
    return res
      .status(403)
      .json({ message: "CORS not allowed for this origin" });
  }

  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Invalid JSON payload" });
  }

  res.status(500).json({
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

export default app;

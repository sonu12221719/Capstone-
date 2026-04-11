import rateLimit from "express-rate-limit";

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { message: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: "Too many authentication attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false
});

export const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { message: "Too many chat requests, please wait before sending another message" },
  standardHeaders: true,
  legacyHeaders: false
});

export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  message: { message: "Too many uploads, please try again later" },
  standardHeaders: true,
  legacyHeaders: false
});

export const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { message: "Too many AI requests, please wait a moment" },
  standardHeaders: true,
  legacyHeaders: false
});

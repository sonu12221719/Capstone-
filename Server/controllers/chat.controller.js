import { askGemini } from "../services/gemini.service.js";
import { getAIMemory, updateAIMemory } from "../services/memory.service.js";
import { medicalSafety } from "../services/medicalSafety.service.js";
import { explainableAI } from "../services/explainableAI.service.js";

import ChatHistory from "../models/ChatHistory.model.js";
import User from "../models/User.model.js";
import HealthRecord from "../models/HealthRecord.model.js";

import { healthPrompt } from "../utils/promptTemplates.js";


const extractHealthData = (message, response) => {
  const symptoms = [];
  const diagnoses = [];
  const medications = [];

  const combinedText = `${message || ""} ${response || ""}`;

  const safePush = (arr, value) => {
    if (value && value.length > 2 && value.length < 100) {
      arr.push(value.trim());
    }
  };

  const patterns = {
    symptoms: [
      /symptoms?[:\s]+([^.]+)/gi,
      /(?:experiencing|having|suffering|sense of)\s+([^.]+)/gi,
    ],
    diagnoses: [
      /diagnosis[:\s]+([^.]+)/gi,
      /(?:may be|possible|probable|indicative|suggest(?:s|ing)?|indicat(?:es|ing)|consistent with|likely|could be|might be)[:\s]+([^.]+)/gi,
      /(?:you (?:may|might) have|appears? to be|points? to)[:\s]+([^.]+)/gi,
    ],
    medications: [
      /(?:medication|medicine|drug)[:\s]+([^.]+)/gi,
      /(?:take|prescribe|recommend)[:\s]+(\w+\s*(?:mg|ml)?)/gi,
    ],
  };

  let match;

  Object.entries(patterns).forEach(([type, regexList]) => {
    regexList.forEach((regex) => {
      while ((match = regex.exec(combinedText)) !== null) {
        safePush(
          type === "symptoms"
            ? symptoms
            : type === "diagnoses"
            ? diagnoses
            : medications,
          match[1] || match[0]
        );
      }
    });
  });

  return {
    symptoms: [...new Set(symptoms)].slice(0, 10),
    diagnoses: [...new Set(diagnoses)].slice(0, 5),
    medications: [...new Set(medications)].slice(0, 10),
  };
};


const detectRiskPatterns = (memory = {}, currentData = {}) => {
  const patterns = [];

  const allSymptoms = [
    ...(memory.frequentSymptoms || []),
    ...(currentData.symptoms || []),
  ];

  const counts = {};
  allSymptoms.forEach((s) => {
    const key = s.toLowerCase();
    counts[key] = (counts[key] || 0) + 1;
  });

  Object.entries(counts).forEach(([symptom, count]) => {
    if (count >= 3) patterns.push(`Recurring: ${symptom}`);
  });

  if (currentData.symptoms?.some((s) => /chest|heart|breathing/i.test(s))) {
    patterns.push("Cardiovascular concern");
  }

  if (currentData.symptoms?.some((s) => /fatigue|weakness/i.test(s))) {
    patterns.push("Energy concern");
  }

  return patterns;
};


export const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    
    const emergencyCheck = medicalSafety.detectEmergency(message);
    if (emergencyCheck?.isEmergency) {
      return res.status(200).json({
        isEmergency: true,
        emergency: emergencyCheck,
        disclaimer: medicalSafety.generateDisclaimer(),
      });
    }

    
    const memory = (await getAIMemory(req.user.id)) || {};

    
    const prompt = healthPrompt(user, memory, message);

    
    const aiResponse = await askGemini(prompt);

    if (!aiResponse || typeof aiResponse !== "string") {
      throw new Error("Invalid AI response");
    }

    
    await ChatHistory.create({
      userId: req.user.id,
      userMessage: message,
      aiResponse,
    });

    // 🧠 Extract data
    const extracted = extractHealthData(message, aiResponse);

    // 🚨 Red flags
    const redFlags = medicalSafety.detectRedFlags(extracted.symptoms);

    // 📊 Analysis
    const analysis = {
      symptoms: extracted.symptoms,
      diagnosis: extracted.diagnoses,
      hasRedFlags: redFlags.length > 0,
    };

    // 🎯 Confidence (SAFE)
    let confidence = 0.5;
    try {
      const raw = medicalSafety.calculateConfidence(analysis);
      if (typeof raw === "number" && !isNaN(raw)) {
        confidence = raw;
      }
    } catch (e) {
      console.warn("Confidence error:", e.message);
    }

    // 🧠 Reasoning
    let reasoning = {};
    try {
      reasoning = explainableAI.analyzeReasoning(
        message,
        extracted.symptoms,
        memory,
        user
      );
    } catch {
      reasoning = { confidenceFactors: [] };
    }

    // 🔁 Memory update
    if (extracted.symptoms.length) {
      await updateAIMemory(req.user.id, {
        frequentSymptoms: extracted.symptoms,
        pastDiagnoses: extracted.diagnoses,
        medicationsHistory: extracted.medications,
        riskPatterns: detectRiskPatterns(memory, extracted),
      });
    }

    // 🏥 Health record — save whenever symptoms OR diagnoses were found
    if (extracted.symptoms.length || extracted.diagnoses.length) {
      await HealthRecord.create({
        userId: req.user.id,
        source: "chat",
        symptoms: extracted.symptoms,
        diagnosis: extracted.diagnoses.length
          ? extracted.diagnoses.join(", ")
          : "Health consultation",
      });
    }

    // ✅ Final Response
    return res.status(200).json({
      input: message,
      response: aiResponse,

      extracted,

      redFlags,

      confidence: {
        score: Number(confidence.toFixed(2)),
        level: medicalSafety.getConfidenceLabel(confidence),
        factors: reasoning.confidenceFactors || [],
      },

      explanation: reasoning,

      recommendations: {
        seekProfessionalHelp:
          redFlags.length > 0 || confidence < 0.5,
      },

      disclaimer: medicalSafety.generateDisclaimer(),
    });

  } catch (error) {
    console.error("❌ Chat Error:", error.message);

    return res.status(500).json({
      message: "AI chat failed",
      error: error.message,
    });
  }
};


// =========================

// =========================
export const getChatHistory = async (req, res) => {
  try {
    const chats = await ChatHistory.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({ chats });

  } catch (error) {
    res.status(500).json({ message: "Failed to fetch chat history" });
  }
};
import Tesseract from "tesseract.js";
import fs from "fs";
import path from "path";
import { askGemini } from "./gemini.service.js";

// ── PDF text extraction using pdf-parse v2 ────────────────────────────────────
async function extractTextFromPDF(filePath) {
  try {
    const { PDFParse } = await import("pdf-parse");
    const buffer = fs.readFileSync(filePath);
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    await parser.destroy();
    return result.text || "";
  } catch (err) {
    console.error("[PDF] Extraction failed:", err.message);
    throw new Error("Failed to extract text from PDF. The file may be scanned or encrypted.");
  }
}

// ── Image text extraction using Tesseract OCR ─────────────────────────────────
async function extractTextFromImage(filePath) {
  try {
    const result = await Tesseract.recognize(filePath, "eng", {
      logger: (m) => {
        if (m.status === "recognizing text") {
          process.stdout.write(`\r[OCR] ${Math.round(m.progress * 100)}%`);
        }
      },
    });
    process.stdout.write("\n");
    return result.data.text || "";
  } catch (err) {
    console.error("[OCR] Image extraction failed:", err.message);
    throw new Error("Failed to extract text from image.");
  }
}

// ── Gemini AI analysis of extracted text ─────────────────────────────────────
async function analyzeWithGemini(rawText, isPDF) {
  if (!rawText || rawText.trim().length < 20) {
    throw new Error("Extracted text is too short or empty to analyze.");
  }

  const fileTypeLabel = isPDF ? "PDF medical report/prescription" : "scanned prescription image";

  const prompt = `You are an expert medical prescription and lab report analyzer.

Analyze the following text extracted from a ${fileTypeLabel} and extract all important medical information.

Return ONLY a valid JSON object (no markdown, no extra text) with this exact structure:
{
  "patientInfo": {
    "name": "patient name or null",
    "age": "age or null",
    "gender": "gender or null",
    "date": "date of prescription/report or null"
  },
  "doctorInfo": {
    "name": "doctor name or null",
    "specialization": "specialization or null",
    "hospital": "hospital/clinic name or null"
  },
  "diagnosis": "primary diagnosis as a clear sentence, or 'Not specified'",
  "symptoms": ["list", "of", "symptoms", "mentioned"],
  "medicines": [
    {
      "name": "medicine name",
      "dosage": "dosage strength e.g. 500mg",
      "frequency": "how often e.g. twice daily",
      "duration": "how long e.g. 5 days",
      "instructions": "special instructions e.g. take after meals or null"
    }
  ],
  "labResults": [
    {
      "test": "test name",
      "value": "result value",
      "normalRange": "normal range if mentioned or null",
      "status": "normal or abnormal or borderline"
    }
  ],
  "instructions": ["general instructions from the doctor"],
  "warnings": ["important warnings or precautions"],
  "followUp": "follow-up instructions or date if mentioned, or null",
  "summary": "2-3 sentence plain-language summary of this document for the patient"
}

Rules:
- Use null for missing string fields, [] for missing array fields
- Do NOT invent data not present in the text
- For medicines, extract every drug mentioned even if details are partial
- For lab results, only include if actual test values are present

Text to analyze:
"""
${rawText.slice(0, 6000)}
"""`;

  try {
    const response = await askGemini(prompt);
    // Extract JSON by finding the outermost { ... } boundaries.
    // This handles cases where cleanText leaves a "json\n" prefix or
    // other surrounding text after stripping markdown fences.
    const start = response.indexOf("{");
    const end = response.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) {
      throw new Error("No JSON object found in Gemini response");
    }
    return JSON.parse(response.slice(start, end + 1));
  } catch (parseErr) {
    console.error("[Gemini] JSON parse failed:", parseErr.message);
    return {
      patientInfo: { name: null, age: null, gender: null, date: null },
      doctorInfo: { name: null, specialization: null, hospital: null },
      diagnosis: "Could not fully parse — see raw text",
      symptoms: [],
      medicines: [],
      labResults: [],
      instructions: [],
      warnings: [],
      followUp: null,
      summary: "AI analysis returned an unexpected format. The text was extracted successfully but could not be structured.",
    };
  }
}

// ── Main export ───────────────────────────────────────────────────────────────
export const processPrescription = async (filePath, mimeType = "") => {
  const isPDF =
    mimeType === "application/pdf" ||
    path.extname(filePath).toLowerCase() === ".pdf";

  let rawText = "";

  if (isPDF) {
    console.log("[Report] Extracting text from PDF...");
    rawText = await extractTextFromPDF(filePath);
  } else {
    console.log("[Report] Running OCR on image...");
    rawText = await extractTextFromImage(filePath);
  }

  if (!rawText || rawText.trim().length < 10) {
    throw new Error(
      isPDF
        ? "The PDF appears to be a scanned image (no selectable text). Try uploading as a JPEG/PNG instead."
        : "Could not extract readable text from the image. Ensure the image is clear and well-lit."
    );
  }

  console.log(`[Report] Extracted ${rawText.length} chars. Sending to Gemini AI...`);

  const analysis = await analyzeWithGemini(rawText, isPDF);

  // Flatten medicines to HealthRecord schema shape
  const medicines = (analysis.medicines || []).map((m) => ({
    name: m.name || "Unknown",
    dosage: [m.dosage, m.frequency].filter(Boolean).join(" — ") || "As prescribed",
    duration: m.duration || "As prescribed",
  }));

  return {
    diagnosis: analysis.diagnosis || "Pending review",
    symptoms: analysis.symptoms || [],
    medicines,
    rawText,
    analysis,
    processed: true,
  };
};

import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy initialization helper for Gemini Client
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || "dummy-key-for-init",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// AI Voice Call Assistant Endpoint
app.post("/api/ai-call", async (req, res) => {
  try {
    const { message, studentName, currentPhase, wordContext, history, voiceName: reqVoiceName } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Mensaje requerido" });
    }

    const nameToUse = studentName || "Estudiante MOVA";
    const phaseInfo = currentPhase ? `Fase actual de la sesión: ${currentPhase} de 5.` : "";
    const wordInfo = wordContext ? `Palabra en práctica actual: "${wordContext}".` : "";
    const selectedVoiceName = reqVoiceName || "Charon";

    const systemInstruction = `Eres el Profesor Virtual José Jorge Muñoz y hablas con un auténtico y marcado TONO Y ACENTO ARGENTINO (usando vos, che, tenés, mirá, sos, bárbaro, de diez, impecable, etc.), docente de inglés de la Institución Educativa MOVA. Estás en una LLAMADA DE VOZ EN REAL TIME con el estudiante "${nameToUse}". ${phaseInfo} ${wordInfo}

REGLAS DE INTERACCIÓN DE LA LLAMADA DE VOZ:
1. Hablá SIEMPRE en vos y con modismos argentinos entusiastas, amables y motivadores (ej: "¡Che, qué grande!", "¡Sos un genio!", "Mirá, tenés que deletrear...", "¡Bárbaro!", "¡De diez!").
2. Como es una LLAMADA DE VOZ, respondé de forma concisa, clara y fluida (máximo 2 a 3 frases cortas), para que la síntesis de voz argentina se escuche súper natural.
3. Si el estudiante te pide deletrear o practicar una palabra, pronúnciala claramente y deletréala letra por letra en mayúsculas separada por guiones (ej: "W - A - T - E - R").
4. Si el estudiante responde o deletrea, evalualo con calidez. Si cometió un error, corregilo con buena onda y dale un truco nemotécnico o de pronunciación.
5. Usá expresiones amables como "Good job, che!", "Awesome spelling!", "¡A seguir practicando en MOVA!".`;

    // Construct request contents
    const contents: any[] = [];

    if (Array.isArray(history) && history.length > 0) {
      // Add previous conversation turns if provided
      for (const turn of history.slice(-6)) { // keep recent context
        if (turn.role && turn.text) {
          contents.push({
            role: turn.role === "user" ? "user" : "model",
            parts: [{ text: turn.text }],
          });
        }
      }
    }

    // Add latest user message
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-live-preview",
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: selectedVoiceName,
            },
          },
        },
      },
    });

    const replyText = response.text || "¡Excelente pronunciación! Sigue practicando tu deletreo.";

    return res.json({
      reply: replyText,
    });
  } catch (error: any) {
    console.error("Error in AI Call endpoint:", error);
    return res.status(500).json({
      error: "Error procesando la llamada con el Asistente IA.",
      reply: "¡Hola! Tuve una breve interferencia en la línea, pero estoy aquí para ayudarte. ¿Qué palabra te gustaría deletrear o practicar hoy?",
    });
  }
});

// Health check route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "Spelling Quest MOVA" });
});

async function startServer() {
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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

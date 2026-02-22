import { GoogleGenAI } from "@google/genai";

let aiClient: GoogleGenAI | null = null;

export function getAIClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set");
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

export const ANALYST_MODEL = "gemini-3.1-pro-preview";
export const SEARCH_MODEL = "gemini-3.1-pro-preview";
export const FALLBACK_MODEL = "gemini-3-flash-preview";

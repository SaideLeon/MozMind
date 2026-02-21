import { GoogleGenAI, Content } from "@google/genai";

// Initialize Gemini API
// We use a lazy initialization pattern to avoid issues if the key is missing initially
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
export const SEARCH_MODEL = "gemini-3.1-pro-preview"; // Using Pro for search capabilities too
export const FALLBACK_MODEL = "gemini-3-flash-preview";

export async function analyzeCode(
  files: { path: string; content: string }[],
  userQuery?: string
) {
  const ai = getAIClient();
  
  const fileContext = files.map(f => `--- ${f.path} ---\n${f.content}\n`).join("\n");
  
  const prompt = `
    You are an expert Senior Software Engineer and Code Analyst.
    
    Here is the code from a GitHub repository:
    ${fileContext}
    
    ${userQuery ? `User Request: ${userQuery}` : "Please perform a comprehensive analysis of this codebase."}
    
    Your task:
    1. Summarize the purpose of the project.
    2. Identify the tech stack.
    3. List 3-5 major strengths.
    4. List 3-5 areas for improvement (bugs, security risks, performance, code quality).
    5. If the user asked a specific question, answer it in detail.
    
    IMPORTANT: You MUST respond in Portuguese (pt-BR).
    Format your response in Markdown.
  `;

  try {
    const response = await ai.models.generateContent({
      model: ANALYST_MODEL,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }] // Enable search for context if needed
      }
    });
    return response;
  } catch (error: any) {
    // Check for quota exceeded error (429)
    if (error.status === 429 || error.message?.includes("429")) {
      console.warn("Quota exceeded for Pro model. Falling back to Flash model.");
      const response = await ai.models.generateContent({
        model: FALLBACK_MODEL,
        contents: prompt,
        // Flash might not support search tools or might have different config requirements
        // Removing tools for fallback to ensure higher success rate
      });
      return response;
    }
    throw error;
  }
}

export async function generateBlueprint(
  files: { path: string; content: string }[],
  context: string
) {
  const ai = getAIClient();
  
  const fileContext = files.map(f => `--- ${f.path} ---\n${f.content}\n`).join("\n");
  
  const prompt = `
    You are an elite Software Architect and Technical Lead.
    
    Your task is to generate a comprehensive, explicit, and highly detailed TECHNICAL BLUEPRINT for the provided codebase.
    This blueprint will be used by an AI coding assistant ("vibe code") to refactor, improve, or rebuild the project.
    
    Input Context:
    ${context}
    
    Codebase:
    ${fileContext}
    
    The Blueprint MUST include the following sections (be extremely explicit, no summaries):
    
    # 1. Project Overview & Architecture
    - Exact purpose of the application.
    - Current Architecture Diagram (Mermaid or text description).
    - Data Flow Analysis.
    
    # 2. Tech Stack & Dependencies
    - Core Frameworks (versions).
    - UI Libraries.
    - State Management.
    - External Services/APIs.
    
    # 3. Component Analysis (Deep Dive)
    - List every major component.
    - Analyze props, state, and side effects.
    - Identify anti-patterns or "smells" in specific files.
    
    # 4. Refactoring Strategy (The "Vibe Code" Plan)
    - Step-by-step plan to modernize or fix the code.
    - Specific file renames, moves, or deletions.
    - New directory structure proposal.
    
    # 5. Implementation Guidelines
    - Coding standards (naming conventions, typing rules).
    - Error handling strategy.
    - Testing strategy.
    
    # 6. Explicit Tasks for the AI
    - Task 1: [Actionable instruction]
    - Task 2: [Actionable instruction]
    ...
    
    IMPORTANT: 
    - Do NOT summarize. Be verbose and technical.
    - Respond in Portuguese (pt-BR).
    - Format strictly in Markdown.
  `;

  try {
    const response = await ai.models.generateContent({
      model: ANALYST_MODEL,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });
    return response;
  } catch (error: any) {
    if (error.status === 429 || error.message?.includes("429")) {
      console.warn("Quota exceeded for Pro model. Falling back to Flash model.");
      const response = await ai.models.generateContent({
        model: FALLBACK_MODEL,
        contents: prompt
      });
      return response;
    }
    throw error;
  }
}

export async function thinkAndSuggest(
  history: { role: string; content: string }[],
  currentInput: string,
  context: string
) {
  const ai = getAIClient();

  const systemInstruction = `
    You are a thoughtful and rigorous Lead Engineer. 
    When a user suggests an improvement, you must "think quite a lot" about it.
    
    Process:
    1. Analyze the user's suggestion deeply. Consider edge cases, architectural impact, performance, and security.
    2. Formulate a set of clarifying questions to ensure the improvement is well-defined.
    3. Propose a plan or counter-proposal if the suggestion has flaws.
    4. Search for existing solutions, libraries, or YouTube tutorials that could help.
    5. ALWAYS end with a specific question or set of options for the user to confirm before proceeding.
    
    Your goal is to reach a mutual agreement with the user on the best path forward.
    IMPORTANT: You MUST respond in Portuguese (pt-BR).
  `;

  const contents: Content[] = [
    { role: 'user', parts: [{ text: `Context (Code Summary/Snippet): ${context}` }] },
    ...history.map(h => ({ role: h.role === 'user' ? 'user' : 'model', parts: [{ text: h.content }] })),
    { role: 'user', parts: [{ text: currentInput }] }
  ];

  try {
    const response = await ai.models.generateContent({
      model: ANALYST_MODEL,
      contents,
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }]
      }
    });
    return response;
  } catch (error: any) {
    if (error.status === 429 || error.message?.includes("429")) {
      console.warn("Quota exceeded for Pro model. Falling back to Flash model.");
      const response = await ai.models.generateContent({
        model: FALLBACK_MODEL,
        contents,
        config: {
           systemInstruction
        }
      });
      return response;
    }
    throw error;
  }
}

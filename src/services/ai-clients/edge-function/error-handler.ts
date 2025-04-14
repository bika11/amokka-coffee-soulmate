
import { OpenAIEdgeClient } from "./openai-edge-client";
import { GeminiEdgeClient } from "./gemini-edge-client";
import { AICompletionResult } from "@/interfaces/ai-client.interface";

/**
 * Handles errors from edge function calls and implements fallback strategies
 */
export async function handleEdgeFunctionError(
  response: Response, 
  currentModelType: 'openai' | 'gemini'
): Promise<AICompletionResult> {
  const errorText = await response.text();
  console.error(`Error response from Edge Function (${response.status}):`, errorText);
  
  // If OpenAI is not configured, automatically fall back to Gemini
  if ((response.status === 401 || response.status === 500) && currentModelType === 'openai') {
    console.log("Attempting fallback to edge-function-gemini");
    throw new Error(`Edge Function error (${response.status}). Falling back to Gemini.`);
  }
  
  // For other errors, just throw with the specific error status
  let errorMessage = `Edge Function returned status ${response.status}: ${errorText}`;
  
  if (response.status === 401) {
    errorMessage = "Authentication error with the AI service. Please check your API keys.";
  } else if (response.status === 429) {
    errorMessage = "Rate limit exceeded for the AI service. Please try again later.";
  } else if (response.status === 500) {
    errorMessage = "The AI service encountered an internal error. This may be due to API key configuration issues.";
  }
  
  throw new Error(errorMessage);
}

/**
 * Provider adapter contract.
 * Implement against the current official API documentation of your chosen provider.
 * Never expose provider secrets to the browser.
 */
export async function editImage({ file, operation, options }) {
  if (!process.env.OPENAI_API_KEY && !process.env.GEMINI_API_KEY) {
    const error = new Error("AI provider is not configured. Add a server-side API key and implement its adapter.");
    error.status = 503;
    throw error;
  }
  // Deliberately fail closed: do not pretend an AI edit happened.
  // Add a provider-specific implementation here after verifying its current API.
  const error = new Error(`No adapter is implemented for operation: ${operation}`);
  error.status = 501;
  throw error;
}

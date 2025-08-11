/**
 * @file AI module for interacting with the OpenAI API via OpenRouter.
 * @description This module handles the communication with the AI model to get trading commands.
 * @author Your Name
 * @version 1.0.1
 */

import { OpenAI } from "openai";

// --- AI Client Initialization ---

/**
 * The AI client configured to use the OpenRouter API.
 * The API key is read from the `OR_TOKEN` environment variable.
 * @type {OpenAI}
 */
const aiClient = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OR_TOKEN,
});

// --- Core Function ---

/**
 * Prompts the AI with a message history and retrieves a structured JSON command.
 *
 * @param {Array<Object>} messages - The history of messages to send to the AI.
 *   Each object should have `role` ('system', 'user', or 'assistant') and `content`.
 * @returns {Promise<Object>} A promise that resolves to the JSON command from the AI.
 * @throws {Error} Throws an error if the API call fails, the response is invalid,
 *   or the response content cannot be parsed as JSON.
 */
export async function callOpenRouterAPI(messages) {
    try {
        console.log("Sending request to AI...");

        const response = await aiClient.chat.completions.create({
            model: "openai/gpt-oss-20b:free", // Updated to a more standard and reliable model
            messages: messages,
            response_format: { type: "json_object" }
        });

        // Validate the response structure
        if (!response || !response.choices || response.choices.length === 0) {
            // If the structure is invalid, log the entire response for debugging
            console.log("Invalid response structure. Full response:", response);
            throw new Error("Invalid response structure from AI API.");
        }

        const messageContent = response.choices[0].message.content;
        
        // If the message content is empty, log the full response and throw an error
        if (!messageContent) {
            console.log("AI response content is empty. Full response:", response);
            throw new Error("AI response content is empty.");
        }

        // The content is expected to be a JSON string, so we parse it.
        return JSON.parse(messageContent);

    } catch (error) {
        // Log the specific error and re-throw it to be handled by the caller
        console.error("Error calling AI API:", error.message);
        if (error instanceof SyntaxError) {
            // This error occurs if JSON.parse fails
            throw new Error("Failed to parse AI response as JSON.");
        }
        // Re-throw the original or a new error to ensure the calling function knows about the failure
        throw new Error(`AI API call failed: ${error.message}`);
    }
}

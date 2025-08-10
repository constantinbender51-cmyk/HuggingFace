// ai.js
import { OpenAI } from "openai";

// Initialize the AI client
// The API key is read from process.env, which should be populated by dotenv in main.js
const aiClient = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OR_TOKEN,
});

/**
 * Prompts the AI with a message history and gets a command.
 * @param {Array<Object>} messages - The history of messages to send to the AI.
 * @returns {Promise<Object>} - A promise that resolves to the JSON command from the AI.
 */
export async function callHuggingfaceAPI(messages) {
    const response = await aiClient.chat.completions.create({
        model: "openai/gpt-oss-20b:free",
        messages,
        response_format: { type: "json_object" }
    });
    // Corrected using template literals
    return JSON.parse(response.choices[0].message.content);
}

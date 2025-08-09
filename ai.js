// ai.js
import { OpenAI } from "openai";
import dotenv from "dotenv";

dotenv.config();

// Initialize the AI client
const aiClient = new OpenAI({
    baseURL: "https://router.huggingface.co/v1",
    apiKey: process.env.HF_TOKEN,
});

/**
 * Prompts the AI with a message history and gets a command.
 * @param {Array<Object>} messages - The history of messages to send to the AI.
 * @returns {Promise<Object>} - A promise that resolves to the JSON command from the AI.
 */
export async function callHuggingfaceAPI(messages) {
    const response = await aiClient.chat.completions.create({
        model: "openai/gpt-oss-120b:novita",
        messages,
        response_format: { type: "json_object" }
    });
    return JSON.parse(response.choices[0].message.content);
}

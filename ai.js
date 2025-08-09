// ai.js
import { OpenAI } from "openai";

// Initialize the AI client
// The API key is read from process.env, which should be populated by dotenv in main.js
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
    console.log("in the function " + ${ JSON.parse(response.choices[0].message.content) });
    return JSON.parse(response.choices[0].message.content);
}

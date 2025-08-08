// main.js
import { OpenAI } from "openai";
import dotenv from "dotenv";
import KrakenFuturesApi from "./krakenApi.js";
import { systemPrompt } from "./systemPrompt.js";
import { CommandExecutor } from "./commandExecutor.js";

dotenv.config();

// Initialize Kraken API client
const krakenApi = new KrakenFuturesApi(
    process.env.KRAKEN_API_KEY,
    process.env.KRAKEN_API_SECRET
);

// Initialize Command Executor
const commandExecutor = new CommandExecutor(krakenApi);

// Initialize OpenAI client for Hugging Face
const aiClient = new OpenAI({
    baseURL: "https://router.huggingface.co/v1",
    apiKey: process.env.HF_TOKEN,
});

async function getAICommand(prompt) {
    try {
        const response = await aiClient.chat.completions.create({
            model: "openai/gpt-oss-120b:novita",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" }
        });
        
        return JSON.parse(response.choices[0].message.content);
    } catch (error) {
        console.error("AI Command Error:", error);
        throw error;
    }
}

async function main() {
    try {
        // Example prompt - you can modify this or get from user input
        const userPrompt = "Get the order book for BTC/USD and then place a limit buy order for 0.1 BTC at $50,000";
        
        // Get command from AI
        const command = await getAICommand(userPrompt);
        console.log("AI Generated Command:", JSON.stringify(command, null, 2));
        
        // Execute the command using the CommandExecutor
        const result = await commandExecutor.executeCommand(command);
        console.log("Execution Result:", JSON.stringify(result, null, 2));
        
    } catch (error) {
        console.error("Main Process Error:", error);
    }
}

main();











// main.js
import { OpenAI } from "openai";
import dotenv from "dotenv";
import KrakenFuturesApi from "./krakenApi.js";
import systemPrompt from "./systemPrompt.js";
import readline from 'readline/promises';
import { CommandExecutor} from "./commandExecutor.js";



console.log("Starting application...");
const executor = new CommandExecutor(new KrakenFuturesApi());

dotenv.config();

// Initialize services
const krakenApi = new KrakenFuturesApi(
    process.env.KRAKEN_API_KEY,
    process.env.KRAKEN_API_SECRET
);
const commandExecutor = new CommandExecutor(krakenApi);
const aiClient = new OpenAI({
    baseURL: "https://router.huggingface.co/v1",
    apiKey: process.env.HF_TOKEN,
});

// Create terminal interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function getAICommand(messages) {
    const response = await aiClient.chat.completions.create({
        model: "openai/gpt-oss-120b:novita",
        messages,
        response_format: { type: "json_object" }
    });
    return JSON.parse(response.choices[0].message.content);
}
async function mainLoop() {
    const messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: "BEGIN" } // Initial trigger
    ];
    
    let iteration = 0;
    const maxIterations = 20;
    
    while (iteration < maxIterations) {
        iteration++;
        console.log(`\n[Cycle ${iteration}]`);
        
        try {
            // Get command from AI
            const command = await getAICommand(messages);
            console.log("> Command:", JSON.stringify(command, null, 2));
            
            // Check for termination
            if (command.command === "doNothing" && 
                command.parameters.reason.toLowerCase().includes("complete")) {
                console.log("\nSession complete:", command.parameters.reason);
                break;
            }
            
            // Execute command
            const result = await commandExecutor.executeCommand(command);
            console.log("< Result:", JSON.stringify(result, null, 2));
            
            // Update message history
            messages.push(
                { role: "assistant", content: JSON.stringify(command) },
                { role: "user", content: JSON.stringify(result) }
            );
            
            // Optional: Add artificial delay
            console.log("Waiting for 60 minutes.");
            await new Promise(resolve => setTimeout(resolve, 60 * 60 * 1000));
            
            
        } catch (error) {
            console.error("! Error:", error.message);
            messages.push({
                role: "user",
                content: `ERROR: ${error.message}`
            });
        }
    }
}
async function main() {
    try {
        console.log("testing functions");
        console.log(process.env.KRAKEN_API_KEY+"/n"+process.env.KRAKEN_API_SECRET);
        
        console.log("Starting trading session...\n");
        await mainLoop();
    } catch (error) {
        console.error("Fatal error:", error);
    } finally {
        rl.close();
    }
}

main();











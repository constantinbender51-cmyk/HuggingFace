// main.js
import { OpenAI } from "openai";
import dotenv from "dotenv";
import KrakenFuturesApi from "./krakenApi.js";
import systemPrompt from "./systemPrompt.js";
import readline from 'readline/promises';
import { CommandExecutor} from "./commandExecutor.js";


console.log("Starting application...");

dotenv.config();

let messages = [
        { role: "autonomous_trading_agent", content: systemPrompt },
        { role: "user", content: ">" } // Initial trigger
    ];

// Initialize services
const krakenApi = new KrakenFuturesApi(
    process.env.KRAKEN_API_KEY,
    process.env.KRAKEN_API_SECRET
);
const commandExecutor = new CommandExecutor(krakenApi, messages);
const aiClient = new OpenAI({
    baseURL: "https://router.huggingface.co/v1",
    apiKey: process.env.HF_TOKEN,
});

// Create terminal interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let actionPlan = {};
const INTERVAL = 60; //trading_bot_loop_interval in seconds

async function getAICommand(messages) {
    const response = await aiClient.chat.completions.create({
        model: "openai/gpt-oss-120b:novita",
        messages,
        response_format: { type: "json_object" }
    });
    return JSON.parse(response.choices[0].message.content);
}
// Define a variable to hold the action plan.

// 2. Call the function to update the action plan

async function mainLoop() {
    //TEST SECTION BEGIN
    messages.length=0;
    messages.push(
        { role: "system", content: systemPrompt },
        { role: "user", content: "> Some previous user input" },
        { role: "assistant", content: '{ "command": "getOpenPositions", "parameters": {} }' },
        { role: "user", content: "> Some other action" }
    );
    console.log("--- Before calling clearTerminal ---");
    console.log(`Message count: ${messages.length}`);
    console.log(JSON.stringify(messages, null, 2));
    console.log("-------------------------------------\n");

    // 3. Define the command to be executed.
    // The 'clearTerminal' command has no parameters.
    const clearTerminalCommand = {
        command: "clearTerminal",
        parameters: {} 
    };

    try {
        // 4. Execute the command.
        const result = await commandExecutor.executeCommand(clearTerminalCommand);
        console.log("Execution result:", result); // Should show { status: 'Terminal cleared' } or similar

    } catch (error) {
        console.error("An error occurred during command execution:", error);
    }

    console.log("\n--- After calling clearTerminal ---");
    console.log(`Message count: ${messages.length}`);
    // The 'clearTerminal' function in generalCommands.js should have modified the array.
    console.log(JSON.stringify(messages, null, 2)); 
    console.log("------------------------------------");
    //TEST SECTION END
    let iteration = 0;
    const maxIterations = 8;
    
    while (iteration < maxIterations) {
        iteration++;
        console.log(`\n[Cycle ${iteration}]`);
        
        try {
            // Get command from AI
            const command = await getAICommand(messages);
            console.log("> Command:", JSON.stringify(command, null, 2));
            
            // Execute command
            const result = await commandExecutor.executeCommand(command);
            console.log("< Result:", JSON.stringify(result, null, 2));
            
            // Update message history
            messages.push(
                { role: "autonomous_trading_agent", content: JSON.stringify(command) },
                { role: "user", content: ">" + JSON.stringify(result) }
            );
            await new Promise(resolve => setTimeout(resolve, INTERVAL * 1000));
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
        await mainLoop();
    } catch (error) {
        console.error("Fatal error:", error);
    } finally {
        rl.close();
    }
}

main();











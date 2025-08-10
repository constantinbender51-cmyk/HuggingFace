// main.js
import dotenv from "dotenv";
dotenv.config(); // Load environment variables at the very top

import readline from 'readline/promises';
import KrakenFuturesApi from "./krakenApi.js";
import systemPrompt from "./systemPrompt.js";
import { CommandExecutor } from "./commandExecutor.js";
import sharedState from './state.js';
import { callHuggingfaceAPI } from './ai.js'; // Import the new AI function

console.log("Starting application...");

let messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: ">" } // Initial trigger
];

// Initialize services
const krakenApi = new KrakenFuturesApi(
    process.env.KRAKEN_API_KEY,
    process.env.KRAKEN_API_SECRET
);
const commandExecutor = new CommandExecutor(krakenApi, messages);

// Create terminal interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const INTERVAL = 5 * 60; // trading_bot_loop_interval in seconds

async function mainLoop() {
    //TEST SECTION BEGIN
    let testData = '';
    console.log("--- Before calling ---");
    console.log(`testData: ${testData}`);
    console.log("-------------------------------------\n");

    const testCommand = {
        command: "getAccountAvailableMargin",
        parameters: { 
                    }
    };

    try {
        testData = await commandExecutor.executeCommand(testCommand);
    } catch (error) {
        console.error("An error occurred during command execution:", error);
    }

    console.log("\n--- After calling ---");
    console.log(`message: ${testData}`);
    console.log("------------------------------------");
    //TEST SECTION END
    let iteration = 0;
    const maxIterations = 8;

    while (iteration < maxIterations) {
        iteration++;
        console.log(`\n[Cycle ${iteration}]`);

        try {
            // Get command from AI by calling the new function
            const command = await callHuggingfaceAPI(messages);
            console.log("> Command:", JSON.stringify(command, null, 2));

            // Execute command
            const result = await commandExecutor.executeCommand(command);
            console.log("< Result:", JSON.stringify(result, null, 2));

            // Update message history
            messages.push(
                { role: "assistant", content: JSON.stringify(command) },
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

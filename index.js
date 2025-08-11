// main.js
/**
 * @file Main entry point for the trading bot application.
 * @author Your Name
 * @version 1.0.0
 */

// Import necessary modules
import dotenv from "dotenv";
import readline from 'readline/promises';
import KrakenFuturesApi from "./krakenApi.js";
import systemPrompt from "./systemPrompt.js";
import { CommandExecutor } from "./commandExecutor.js";
import { callOpenRouterAPI } from './ai.js';

// Load environment variables from a .env file
dotenv.config();

// --- Global Constants and State ---

/**
 * The interval in seconds for the main trading loop.
 * @type {number}
 */
const TRADING_LOOP_INTERVAL = 2* 60;

/**
 * The maximum number of iterations for the main loop.
 * @type {number}
 */
const MAX_ITERATIONS = 10;

/**
 * The message history for the AI conversation.
 * @type {Array<Object>}
 */
let messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: ">" } // Initial trigger for the AI
];

// --- Service Initialization ---

/**
 * An instance of the KrakenFuturesApi for interacting with the Kraken API.
 * @type {KrakenFuturesApi}
 */
const krakenApi = new KrakenFuturesApi(
    process.env.KRAKEN_API_KEY,
    process.env.KRAKEN_API_SECRET
);

/**
 * An instance of the CommandExecutor to handle command execution.
 * @type {CommandExecutor}
 */
const commandExecutor = new CommandExecutor(krakenApi, messages);

/**
 * The readline interface for command-line interaction.
 * @type {readline.Interface}
 */
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// --- Test Section ---

/**
 * A test function to verify command execution.
 * @async
 */
async function runTest() {
    console.log("--- Running Test Section ---");
    const testCommand = {
        command: "getAccountAvailableMargin",
        parameters: {}
    };

    try {
        const result = await commandExecutor.executeCommand(testCommand);
        console.log(`Test Command Result: ${JSON.stringify(result, null, 2)}`);
    } catch (error) {
        console.error("An error occurred during the test:", error);
    }
    console.log("--- Test Section End ---\n");
}

// --- Main Application Logic ---

/**
 * The main loop for the trading bot.
 * It retrieves a command from the AI, executes it, and repeats.
 * @async
 */
async function mainLoop() {
    for (let iteration = 1; iteration <= MAX_ITERATIONS; iteration++) {
        console.log(`\n[Cycle ${iteration}]`);

        try {
            // Get a command from the AI
            const command = await callOpenRouterAPI(messages);
            console.log("> Command:", JSON.stringify(command, null, 2));
            console.log(`> Result Length: ${resultString.length} characters`);

            // Execute the received command
            const result = await commandExecutor.executeCommand(command);
            const resultString = JSON.stringify(result, null, 2); // 
            console.log("< Result:", JSON.stringify(result, null, 2));
            console.log(`> Result Length: ${resultString.length} characters`);

            // Update the message history for the next iteration
            messages.push(
                { role: "assistant", content: `>${JSON.stringify(command)}` },
                { role: "user", content: `>${JSON.stringify(result)}` }
            );
            const totalChars = messages.reduce((acc, msg) => {
                return acc + JSON.stringify(msg).length;
            }, 0);
            console.log(`> Message history now contains ${totalChars} characters.`);

            // Wait for the specified interval before the next cycle
            await new Promise(resolve => setTimeout(resolve, TRADING_LOOP_INTERVAL * 1000));
        } catch (error) {
            console.error("! Error:", error.message);
            messages.push({
                role: "user",
                content: `ERROR: ${error.message}`
            });
        }
    }
}

/**
 * The main function to start the application.
 * @async
 */
async function main() {
    console.log("Starting application...");
    try {
        //await runTest(); // Optional: run a test before starting the main loop
        await mainLoop();
    } catch (error) {
        console.error("A fatal error occurred:", error);
    } finally {
        rl.close();
        console.log("\nApplication finished.");
    }
}

// Start the application
main();

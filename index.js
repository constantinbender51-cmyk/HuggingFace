// main.js
import { OpenAI } from "openai";
import dotenv from "dotenv";
import KrakenFuturesApi from "./krakenApi.js";
import systemPrompt from "./systemPrompt.js";
import readline from 'readline/promises';
// TEST IMPORTS FIRST
try {
    console.log("Testing imports...");
    const testImport = await import('./commandExecutor.js');
    console.log("Import success!", testImport);
} catch (e) {
    console.error("IMPORT FAILED!", e);
    process.exit(1);
}



console.log("Starting application...");
const executor = new CommandExecutor(new KrakenFuturesApi());
const result = await executor.executeCommand({ test: "command" });
console.log("Final result:", result);
// commandExecutor.js

console.log("CommandExecutor imported successfully");
export class CommandExecutor {
    constructor(krakenApi) {
        this.krakenApi = krakenApi;
    }

    async executeCommand(command) {
        try {
            console.log(`Executing: ${command.command}`);
            
            switch(command.command) {
                // Public endpoints
                case 'getInstruments':
                    return await this.krakenApi.getInstruments();
                case 'getTickers':
                    return await this.krakenApi.getTickers();
                case 'getOrderbook':
                    return await this.krakenApi.getOrderbook(command.parameters);
                case 'getHistory':
                    return await this.krakenApi.getHistory(command.parameters);
                    
                // Private endpoints
                case 'getAccounts':
                    return await this.krakenApi.getAccounts();
                case 'getOpenPositions':
                    return await this.krakenApi.getOpenPositions();
                case 'getOpenOrders':
                    return await this.krakenApi.getOpenOrders();
                case 'getRecentOrders':
                    return await this.krakenApi.getRecentOrders(command.parameters);
                case 'getFills':
                    return await this.krakenApi.getFills(command.parameters);
                case 'getAccountLog':
                    return await this.krakenApi.getAccountLog();
                case 'getTransfers':
                    return await this.krakenApi.getTransfers(command.parameters);
                case 'getNotifications':
                    return await this.krakenApi.getNotifications();
                    
                // Order management
                case 'sendOrder':
                    return await this.krakenApi.sendOrder(command.parameters);
                case 'editOrder':
                    return await this.krakenApi.editOrder(command.parameters);
                case 'cancelOrder':
                    return await this.krakenApi.cancelOrder(command.parameters);
                case 'cancelAllOrders':
                    return await this.krakenApi.cancelAllOrders(command.parameters);
                case 'cancelAllOrdersAfter':
                    return await this.krakenApi.cancelAllOrdersAfter(command.parameters);
                case 'batchOrder':
                    return await this.krakenApi.batchOrder(command.parameters);
                    
                // Special actions
                case 'callDeepseekAPI':
                    // Implement your Deepseek API call here
                    return { result: "Deepseek API called", parameters: command.parameters };
                case 'doNothing':
                    return { status: "No action taken", reason: command.parameters.reason };
                    
                default:
                    throw new Error(`Unknown command: ${command.command}`);
            }
        } catch (error) {
            console.error(`Execution Error (${command.command}):`, error);
            throw error;
        }
    }
} 
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
            await new Promise(resolve => setTimeout(resolve, 3 * 60 * 1000));
            
        } catch (error) {
            console.error("! Error:", error.message);
            messages.push({
                role: "user",
                content: `ERROR: ${error.message}`
            });
        }
    }
    
    if (iteration >= maxIterations) {
        console.log("\nMaximum cycles reached");
    }
}

async function main() {
    try {
        console.log("Starting trading session...\n");
        await mainLoop();
    } catch (error) {
        console.error("Fatal error:", error);
    } finally {
        rl.close();
    }
}

main();

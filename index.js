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

let actionPlan = {};

async function getAICommand(messages) {
    const response = await aiClient.chat.completions.create({
        model: "openai/gpt-oss-120b:novita",
        messages,
        response_format: { type: "json_object" }
    });
    return JSON.parse(response.choices[0].message.content);
}
// Define a variable to hold the action plan.
let actionPlan = {};

/**
 * Updates the actionPlan variable with a new value.
 *
 * @param {object} updatedActionPlan - The new action plan object.
 * @returns {string} Returns 'success' after updating the variable.
 */
function writeToActionPlan(updatedActionPlan) {
  // Update the global actionPlan variable with the provided data.
  actionPlan = updatedActionPlan;

  // You could add more logic here, like saving to a file or database.
  // For now, we just log it to the console.
  console.log('Action plan updated:', actionPlan);

  return 'success';
}

// 2. Call the function to update the action plan

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
                { rol: "assistant", content: JSON.stringify(command) },
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
//Bot functions




async function main() {
    try {
        console.log("Starting trading session...\n");
        const result = writeToActionPlan('do something [ ]\notify operator [ ]');

// 3. Print the result
        console.log(`Function returned: ${result}`); // Output: Function returned: success

// 4. Verify the original variable has been updated
        console.log('Current actionPlan variable:', actionPlan);
        
        await mainLoop();
    } catch (error) {
        console.error("Fatal error:", error);
    } finally {
        rl.close();
    }
}

main();











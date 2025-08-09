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
//handler functions 
async function fetchKrakenData(pair = 'XBTUSD', interval = 60, since = null) {
  try {
    // If 'since' is not provided, default to fetching data for the last 4 days.
    const sinceParam = since || Math.floor((Date.now() - (4 * 24 * 60 * 60 * 1000)) / 1000);

    const response = await fetch(
      `https://api.kraken.com/0/public/OHLC?pair=${pair}&interval=${interval}&since=${sinceParam}`
    );
    const data = await response.json();

    if (data.error && data.error.length > 0) {
      console.error('Kraken API error:', data.error);
      return null;
    }

    // The pair name in the response might be different from the one sent (e.g., XXBTZUSD for XBTUSD).
    const resultKey = Object.keys(data.result)[0];
    const ohlcData = data.result[resultKey];

    // Format the data into a more readable array of objects.
    return ohlcData.map(item => {
      const [time, open, high, low, close, vwap, volume, count] = item.map(Number);
      return {
        date: new Date(time * 1000).toISOString(),
        timestamp: time,
        open,
        high,
        low,
        close,
        vwap,
        volume,
        count
      };
    });
  } catch (error) {
    console.error('Error fetching Kraken OHLC data:', error);
    return null;
  }
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
//Bot functions




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











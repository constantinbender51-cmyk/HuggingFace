// main.js
import { OpenAI } from "openai";
import dotenv from "dotenv";
import KrakenFuturesApi from "./krakenApi.js";
import { systemPrompt } from "./systemPrompt.js";  // Import the prompt

dotenv.config();

// Initialize Kraken API client
const krakenApi = new KrakenFuturesApi(
    process.env.KRAKEN_API_KEY,
    process.env.KRAKEN_API_SECRET
);

// Initialize OpenAI client for Hugging Face
const aiClient = new OpenAI({
    baseURL: "https://router.huggingface.co/v1",
    apiKey: process.env.HF_TOKEN,
});

const systemPrompt = `
You are an API command generator for Kraken Futures trading. Respond with JSON-formatted commands that can be executed by our system.
The JSON must contain these fields:
- command: The name of the function to call
- parameters: An object containing all required parameters

Available commands:
1. Data Fetching:
- getInstruments(): Get all available instruments
- getTickers(): Get current tickers
- getOrderbook({symbol}): Get order book for a specific symbol
- getHistory({symbol, lastTime}): Get historical data (lastTime is optional)
- getAccounts(): Get account information
- getOpenPositions(): Get open positions
- getOpenOrders(): Get open orders
- getRecentOrders({symbol}): Get recent orders for a symbol
- getFills({lastFillTime}): Get fills since lastFillTime
- getAccountLog(): Get account log
- getTransfers({lastTransferTime}): Get transfers since lastTransferTime
- getNotifications(): Get notifications

2. Order Management:
- sendOrder({orderType, symbol, side, size, limitPrice}): Place a new order
- editOrder({orderId, size, limitPrice}): Edit an existing order
- cancelOrder({order_id}): Cancel an order
- cancelAllOrders({symbol}): Cancel all orders for a symbol
- cancelAllOrdersAfter({timeout}): Cancel all orders after timeout
- batchOrder({batchJson}): Place batch orders

3. Special Actions:
- callDeepseekAPI({prompt}): Call the Deepseek API with a prompt
- doNothing({reason}): Take no action (provide reason)

Response format example:
{
    "command": "sendOrder",
    "parameters": {
        "orderType": "lmt",
        "symbol": "pi_xbtusd",
        "side": "buy",
        "size": 1,
        "limitPrice": 50000
    }
}
`;

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

async function executeCommand(command) {
    try {
        console.log(`Executing: ${command.command}`);
        
        switch(command.command) {
            // Public endpoints
            case 'getInstruments':
                return await krakenApi.getInstruments();
            case 'getTickers':
                return await krakenApi.getTickers();
            case 'getOrderbook':
                return await krakenApi.getOrderbook(command.parameters);
            case 'getHistory':
                return await krakenApi.getHistory(command.parameters);
                
            // Private endpoints
            case 'getAccounts':
                return await krakenApi.getAccounts();
            case 'getOpenPositions':
                return await krakenApi.getOpenPositions();
            case 'getOpenOrders':
                return await krakenApi.getOpenOrders();
            case 'getRecentOrders':
                return await krakenApi.getRecentOrders(command.parameters);
            case 'getFills':
                return await krakenApi.getFills(command.parameters);
            case 'getAccountLog':
                return await krakenApi.getAccountLog();
            case 'getTransfers':
                return await krakenApi.getTransfers(command.parameters);
            case 'getNotifications':
                return await krakenApi.getNotifications();
                
            // Order management
            case 'sendOrder':
                return await krakenApi.sendOrder(command.parameters);
            case 'editOrder':
                return await krakenApi.editOrder(command.parameters);
            case 'cancelOrder':
                return await krakenApi.cancelOrder(command.parameters);
            case 'cancelAllOrders':
                return await krakenApi.cancelAllOrders(command.parameters);
            case 'cancelAllOrdersAfter':
                return await krakenApi.cancelAllOrdersAfter(command.parameters);
            case 'batchOrder':
                return await krakenApi.batchOrder(command.parameters);
                
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

async function main() {
    try {
        // Example prompt - you can modify this or get from user input
        const userPrompt = "Get the order book for BTC/USD and then place a limit buy order for 0.1 BTC at $50,000";
        
        // Get command from AI
        const command = await getAICommand(userPrompt);
        console.log("AI Generated Command:", JSON.stringify(command, null, 2));
        
        // Execute the command
        const result = await executeCommand(command);
        console.log("Execution Result:", JSON.stringify(result, null, 2));
        
    } catch (error) {
        console.error("Main Process Error:", error);
    }
}

main();

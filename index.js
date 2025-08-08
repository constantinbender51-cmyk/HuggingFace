import { OpenAI } from "openai";
import dotenv from "dotenv";

dotenv.config();

const client = new OpenAI({
    baseURL: "https://router.huggingface.co/v1",
    apiKey: process.env.HF_TOKEN,
});

const systemPrompt = `
You are an API command generator. Respond with JSON-formatted commands that can be executed by our system.
The JSON must contain these fields:
- command: The name of the function to call
- parameter1: First parameter (if needed)
- parameter2: Second parameter (if needed)
- parameter3: Third parameter (if needed)
- ... (additional parameters as needed)

Available commands:
1. Data Fetching:
- getInstruments(): Get all available instruments
- getTickers(): Get current tickers
- getOrderbook(symbol): Get order book for a specific symbol
- getHistory(symbol, lastTime): Get historical data (lastTime is optional)
- getAccounts(): Get account information
- getOpenPositions(): Get open positions
- getOpenOrders(): Get open orders
- getRecentOrders(symbol): Get recent orders for a symbol
- getFills(lastFillTime): Get fills since lastFillTime
- getAccountLog(): Get account log
- getTransfers(lastTransferTime): Get transfers since lastTransferTime
- getNotifications(): Get notifications

2. Order Management:
- sendOrder(orderParams): Place a new order
- editOrder(editParams): Edit an existing order
- cancelOrder(cancelParams): Cancel an order
- cancelAllOrders(symbol): Cancel all orders for a symbol
- cancelAllOrdersAfter(timeoutSeconds): Cancel all orders after timeout
- batchOrder(batchJson): Place batch orders

3. Special Actions:
- callDeepseekAPI(prompt): Call the Deepseek API with a prompt
- doNothing(reason): Take no action (provide reason)

Available order actions:
- sendOrder: { "orderType": "lmt"|"mkt", "symbol": string, "side": "buy"|"sell", "size": integer, "limitPrice": float }
- editOrder: { "orderId": string, "size": integer, "limitPrice": float }
- cancelOrder: { "order_id": string }
- cancelAllOrders: { "symbol": string }
- doNothing: { "reason": string }

Always respond with valid JSON containing the command and parameters.
`;

async function getCommand(prompt) {
    try {
        const chatCompletion = await client.chat.completions.create({
            model: "openai/gpt-oss-120b:novita",
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            response_format: { type: "json_object" }
        });

        return JSON.parse(chatCompletion.choices[0].message.content);
    } catch (error) {
        console.error("Error calling Hugging Face API:", error);
        throw error;
    }
}

// Example usage
async function main() {
    try {
        const userPrompt = "Get the order book for BTC/USD and then place a limit buy order for 1 BTC at $50,000";
        console.log(`Sending prompt: "${userPrompt}"`);
        
        const command = await getCommand(userPrompt);
        console.log("Generated command:");
        console.log(JSON.stringify(command, null, 2));
    } catch (error) {
        console.error("Failed to get response:", error.message);
    }
}

main();

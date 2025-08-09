// testExecutor.js
import dotenv from "dotenv";
import KrakenFuturesApi from "./krakenApi.js";
import { CommandExecutor } from "./commandExecutor.js";

// Load environment variables from .env file
dotenv.config();

console.log("Starting Command Executor test script...");

// --- MOCK DATA ---
// Use realistic data for testing. You might need to adjust these.
const MOCK_DATA = {
    symbol: 'pi_xbtusd', // A common symbol for testing
    orderId: 'some-fake-order-id', // Use a real ID for tests that might succeed
    timeout: 60 // in seconds
    // Example: 14 days ago from now
    const sinceTimestamp = Math.floor((Date.now() - 14 * 24 * 60 * 60 * 1000) / 1000);

};

// --- TEST SETUP ---
async function runTests() {
    // Initialize the real API and Executor
    // Ensure your .env file has the necessary KRAKEN_API_KEY and KRAKEN_API_SECRET
    const krakenApi = new KrakenFuturesApi(
        '2J/amVE61y0K0k34qVduE2fSiQTMpppw6Y+K+b+qt9zk7o+UvtBQTwBq', '6CEQlIa0+YrlxBXWAfdvkpcCpVK3UT5Yidpg/o/36f60WWETLU1bU1jJwHK14LqFJq1T3FRj1Pdj/kk8zuhRiUJi'
    );
    console.log(process.env.KRAKEN_API_KEY);
    console.log(process.env.KRAKEN_API_SECRET);
    const executor = new CommandExecutor(krakenApi);
    // --- COMMAND DEFINITIONS ---
    // An array of all commands to test, with required parameters.
    const commandsToTest = [
        // Public endpoints
        { command: 'getInstruments', parameters: {} },
        { command: 'getTickers', parameters: {} },
        { command: 'getOrderbook', parameters: { symbol: MOCK_DATA.symbol } },
        { command: 'getHistory', parameters: { symbol: MOCK_DATA.symbol, interval: 5 } },

        // Private endpoints (require authentication)
        { command: 'getAccounts', parameters: {} },
        { command: 'getOpenPositions', parameters: {} },
        { command: 'getOpenOrders', parameters: {} },
        { command: 'getFills', parameters: {} }, // `lastFillTime` is optional
        
        // Order management (These will likely fail if parameters are not perfect, which is expected)
        { 
            command: 'sendOrder', 
            parameters: { orderType: 'lmt', symbol: MOCK_DATA.symbol, side: 'buy', size: 1, limitPrice: 10000 } 
        },
        { 
            command: 'editOrder', 
            parameters: { orderId: MOCK_DATA.orderId, size: 2, limitPrice: 10001 } 
        },
        { 
            command: 'cancelOrder', 
            parameters: { order_id: MOCK_DATA.orderId } 
        },
        { 
            command: 'cancelAllOrders', 
            parameters: { symbol: MOCK_DATA.symbol } 
        },
        { 
            command: 'cancelAllOrdersAfter', 
            parameters: { timeout: MOCK_DATA.timeout } 
        },

        // Special actions
        { 
            command: 'callDeepseekAPI', 
            parameters: { prompt: "Test prompt for Deepseek." } 
        },
        { 
            command: 'doNothing', 
            parameters: { reason: "This is a test of the doNothing command." } 
        },
        
        // Commands from your prompt that were not in the executor switch case
        // Adding these to show they are handled by the 'default' case
        { command: 'getRecentOrders', parameters: { symbol: MOCK_DATA.symbol } },
        { command: 'getAccountLog', parameters: {} },
        { command: 'getTransfers', parameters: {} },
        { command: 'batchOrder', parameters: { /* batchJson would go here */ } }
        
        {
        command: 'fetchKrakenData', 
        parameters: { 
            pair: MOCK_DATA.pair, 
            interval: 60, // Hourly
            since: MOCK_DATA.sinceTimestamp 
        } 
    },

    // 2. Get account available margin
    { 
        command: 'getAccountAvailableMargin', 
        parameters: {} 
    },

    // 3. Get open positions
    { 
        command: 'getOpenPositions', 
        parameters: {} 
    },

    // 4. Get open orders
    { 
        command: 'getOpenOrders', 
        parameters: {} 
    },

    // 5. Send order (example for each type)
    { 
        command: 'sendOrder', 
        parameters: { 
            orderType: 'lmt', 
            symbol: MOCK_DATA.symbol, 
            side: 'buy', 
            size: 1, 
            limitPrice: 100000 
        } 
    },
    { 
        command: 'sendOrder', 
        parameters: { 
            orderType: 'mkt', 
            symbol: MOCK_DATA.symbol, 
            side: 'sell', 
            size: 1 
        } 
    },
    { 
        command: 'sendOrder', 
        parameters: { 
            orderType: 'stp', 
            symbol: MOCK_DATA.symbol, 
            side: 'buy', 
            size: 1, 
            limitPrice: 110000, 
            stopPrice: 109500 
        } 
    },

    // 6. Cancel order
    { 
        command: 'cancelOrder', 
        parameters: { 
            order_id: MOCK_DATA.orderId 
        } 
    },

    // 7. Call Deepseek API
    { 
        command: 'callDeepseekAPI', 
        parameters: { 
            message: "Analyze the current market sentiment for Bitcoin." 
        } 
    },

    // 8. Clear terminal
    { 
        command: 'clearTerminal', 
        parameters: {} 
    },

    // 9. Write to action plan
    { 
        command: 'writeToActionPlan', 
        parameters: { 
            updatedActionPlan: "- Look up exchange data [x]\n- Analyze market trends [ ]\n- Place buy order [ ]" 
        } 
    },

    // 10. Wait
    { 
        command: 'wait', 
        parameters: { 
            minutes: 5 
        } 
    },

    // 11. Notify operator
    { 
        command: 'notifyOperator', 
        parameters: { 
            message: "Trade execution successful. Position opened for BTC/USD." 
        } 
    }
];
    
    ];

    // --- EXECUTION LOOP ---
    for (const cmd of commandsToTest) {
        console.log(`\n-----------------------------------------`);
        console.log(`[TESTING] > Command: ${cmd.command}`);
        console.log(`          > Parameters: ${JSON.stringify(cmd.parameters)}`);
        console.log(`-----------------------------------------`);

        try {
            const result = await executor.executeCommand(cmd);
            console.log(`[SUCCESS] < Result:`, JSON.stringify(result, null, 2));
        } catch (error) {
            // An error is an expected outcome for many of these calls (e.g., canceling a non-existent order)
            // The important thing is that the system handled it without crashing.
            console.error(`[CAUGHT_ERROR] < Error for ${cmd.command}: ${error.message}`);
        }
        // Add a small delay to avoid hitting API rate limits
        await new Promise(resolve => setTimeout(resolve, 1000)); 
    }

    console.log("\n\nTest script finished.");
}

// Run the main test function
runTests().catch(err => {
    console.error("\nA fatal error occurred during the test script execution:", err);
});

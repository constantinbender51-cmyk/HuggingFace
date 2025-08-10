// At the top of commandExecutor.js, alongside other imports
import { clearTerminal, writeActionPlan, notifyOperator, writeNotes, clearActionPlan } from './generalCommands.js'; // Assuming it's in a file named generalCommands.js
import { callHuggingfaceAPI } from './ai.js';// commandExecutor.js
export class CommandExecutor {
    constructor(krakenApi, messages) {
        this.krakenApi = krakenApi;
        this.messages = messages;
        
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
                case 'fetchKrakenData': // <-- Add the new case here
                    return await this.krakenApi.fetchKrakenData(command.parameters);
                    
                    
                // Private endpoints
                case 'getAccounts':
                    return await this.krakenApi.getAccounts();
                // In commandExecutor.js

// ... (inside the switch statement)

case 'getAccountAvailableMargin': { // Use braces to create a new block scope
    const accountData = await this.krakenApi.getAccounts();
            return  accountData.accounts.flex ;
   }

// ... (rest of the switch statement)
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
                case 'callHuggingfaceAPI':
                    // --- CORRECTED IMPLEMENTATION ---
                    // The 'command.parameters' might contain a new user message or prompt.
                    // You should add it to the existing history before making the call.
                    
                    // 1. Create a new message object from the parameters
                    const newUserMessage = { 
                        { role: "system", 
                        content: "..."},
                        { role: 'user', 
                        content: command.parameters.prompt || JSON.stringify(command.parameters)
                        }// Use a 'prompt' field or stringify the whole object
                    };
                    
                    // 2. Combine with existing message history
                    const fullMessageHistory = newUserMessage;
                    console.log(fullMessageHistory);
                    // 3. Call the API with the complete history
                    const response = await callHuggingfaceAPI(fullMessageHistory); 
                    console.log(response);
                    return response;
                case 'clearTerminal':
                    return clearTerminal(this.messages);
                case 'writeActionPlan':
                    return writeActionPlan(command.parameters);
                case 'writeNotes':
                    return writeNotes(command.parameters);
                case 'notifyOperator':
                    return await notifyOperator(command.parameters);
                    // Inside the switch statement in commandExecutor.js
                case 'clearActionPlan':
                    return clearActionPlan();            

                //SUPER special actions
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

// At the top of commandExecutor.js, alongside other imports
import { clearTerminal, writeToActionPlan, notifyOperator, writeNotes } from './generalCommands.js'; // Assuming it's in a file named generalCommands.js
// commandExecutor.js
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
                case 'clearTerminal':
                    return clearTerminal(this.messages);
                case 'writeToActionPlan':
                    return writeToActionPlan(command.parameters);
                case 'writeNotes':
                    return writeNotes(command.parameters);
                case 'notifyOperator':
                    return await notifyOperator(command.parameters);

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









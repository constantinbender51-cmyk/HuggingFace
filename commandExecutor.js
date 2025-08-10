// commandExecutor.js
/**
 * @file Command Executor for handling API calls and general actions.
 * @description This module routes commands from the AI to the appropriate functions,
 *              acting as a central dispatcher for all bot actions.
 * @author Your Name
 * @version 1.0.0
 */

import { callOpenRouterAPI } from './ai.js';
import {
    clearTerminal,
    writeActionPlan,
    notifyOperator,
    writeNotes,
    clearActionPlan
} from './generalCommands.js';

/**
 * The CommandExecutor class is responsible for interpreting and executing commands.
 * It uses a `switch` statement to route a command to the corresponding method
 * in the Kraken API service or to a general-purpose function.
 */
export class CommandExecutor {
    /**
     * Constructs the CommandExecutor.
     * @param {object} krakenApi - An instance of the KrakenFuturesApi client.
     * @param {Array<object>} messages - The shared message history for AI interaction.
     */
    constructor(krakenApi, messages) {
        this.krakenApi = krakenApi;
        this.messages = messages;
    }

    /**
     * Executes a given command by routing it to the appropriate handler.
     * @param {object} command - The command object to execute.
     * @param {string} command.command - The name of the command.
     * @param {object} [command.parameters] - The parameters for the command.
     * @returns {Promise<any>} A promise that resolves with the result of the command execution.
     * @throws {Error} Throws an error if the command is unknown or if execution fails.
     */
    async executeCommand(command) {
        if (!command || typeof command.command !== 'string') {
            throw new Error("Invalid command object provided.");
        }

        console.log(`Executing command: ${command.command}`);
        try {
            switch (command.command) {
                // --- Kraken Public Market Data Endpoints ---
                case 'getInstruments':
                    return await this.krakenApi.getInstruments();
                case 'getTickers':
                    return await this.krakenApi.getTickers();
                case 'getOrderbook':
                    return await this.krakenApi.getOrderbook(command.parameters);
                case 'getHistory':
                    return await this.krakenApi.getHistory(command.parameters);
                case 'getHistoricalBTCPriceData':
                    return await this.krakenApi.fetchKrakenData(command.parameters);

                // --- Kraken Private Account Data Endpoints ---
                case 'getAccounts':
                    return await this.krakenApi.getAccounts();
                case 'getAccountAvailableMargin': {
                    const accountData = await this.krakenApi.getAccounts();
                    // Assuming 'flex' contains the relevant margin info.
                    // This could be made more robust by checking if `accountData.accounts.flex` exists.
                    return accountData.accounts.flex;
                }
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

                // --- Kraken Private Order Management Endpoints ---
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
                // --- General Purpose & Bot Control Commands ---
                case 'callAI': {
                    // This command delegates a complex thinking task to an external AI model.
                    // 'TradingBrain' uses this to analyze data, formulate strategies, or summarize information.

                    // 1. Extract the new message from the parameters.
                    const newMessageContent = command.parameters?.message;
                    if (!newMessageContent) {
                        throw new Error("The 'callAI' command requires a 'message' parameter.");
                    }

                    // 2. Construct the message payload for the external AI call.
                    // It starts with a new system prompt, followed by the existing conversation history
                    // (excluding the original system message), and finally the new user message.
                    const newMessages = [
                        { 
                            role: 'system', 
                            content: 'You are a powerful, general-purpose AI assistant. Please provide a clear, detailed, and helpful response to the user\'s request.' 
                        },
                        // Spread the existing messages, skipping the first (original system message).
                        ...this.messages.slice(1),
                        { 
                            role: 'user', 
                            content: newMessageContent 
                        }
                    ];

                    console.log("Delegating task to external AI with payload:", newMessages);

                    // 3. Make the API call and return the response to 'TradingBrain'.
                    // The result of this call will become part of the history that 'TradingBrain' sees in its next cycle.
                    return await callOpenRouterAPI(newMessages);
                }

                case 'clearTerminal':
                    return clearTerminal(this.messages);
                case 'writeActionPlan':
                    return writeActionPlan(command.parameters);
                case 'clearActionPlan':
                    return clearActionPlan();
                case 'writeNotes':
                    return writeNotes(command.parameters);
                case 'notifyOperator':
                    return await notifyOperator(command.parameters);
                case 'doNothing':
                    return { status: "No action taken", reason: command.parameters?.reason || "No reason provided." };

                // --- Default Case for Unknown Commands ---
                default:
                    throw new Error(`Unknown command: ${command.command}`);
            }
        } catch (error) {
            console.error(`Execution Error (${command.command}):`, error.message);
            // Re-throw the error to be handled by the calling function (e.g., mainLoop)
            throw error;
        }
    }
}

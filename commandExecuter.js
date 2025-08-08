// commandExecutor.js
import KrakenFuturesApi from "./krakenApi.js";

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
                    return await

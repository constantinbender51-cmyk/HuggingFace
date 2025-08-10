// generalCommands.js
/**
 * @file General-purpose commands for the trading bot.
 * @description This module provides a set of non-trading functions that handle state management,
 *              operator notifications, and other utility actions.
 * @author Your Name
 * @version 1.0.0
 */

import fetch from 'node-fetch';
import systemPrompt from './systemPrompt.js';
import sharedState from './state.js';

// --- Constants ---

/**
 * The topic for ntfy.sh notifications.
 * It is recommended to move this to a `.env` file for better security and configuration.
 * @type {string}
 */
const NTFY_TOPIC = process.env.NTFY_TOPIC || 'constantin-bot-notifications-xyz123';

// --- State Management Commands ---

/**
 * Resets the AI's message history to its initial state.
 * This is useful for clearing context and starting a fresh interaction.
 *
 * @param {Array<object>} messages - The message history array to be cleared and reset.
 * @returns {{status: string, message: string}} A confirmation object.
 */
export function clearTerminal(messages) {
    console.log("Executing clearTerminal: Resetting message history.");

    // Validate input to ensure it's a mutable array
    if (!Array.isArray(messages)) {
        const errorMsg = "clearTerminal Error: Input must be an array.";
        console.error(errorMsg);
        return { status: "Error", message: errorMsg };
    }

    // Clear the existing array efficiently
    messages.length = 0;

    // Restore the initial system and user prompts
    messages.push(
        { role: "system", content: systemPrompt },
        { role: "user", content: ">" } // Initial trigger for the AI
    );

    return { status: "Success", message: "Message history has been cleared." };
}

/**
 * Writes or overwrites the strategic action plan in the shared state.
 *
 * @param {object} parameters - The parameters for the command.
 * @param {string} parameters.actionPlan - The new content for the action plan.
 * @returns {{status: string, message: string, newActionPlan: string}} A result object.
 */
export function writeActionPlan(parameters) {
    const { actionPlan } = parameters || {};

    /*if (typeof actionPlan !== 'string') {
        const errorMsg = "writeActionPlan Error: 'actionPlan' parameter must be a non-empty string.";
        console.error(errorMsg);
        return { status: "Error", message: errorMsg };
    }*/

    sharedState.actionPlan = actionPlan;
    console.log(`Action Plan Updated: "${sharedState.actionPlan}"`);

    return {
        status: "Success",
        message: "Action plan has been updated.",
        newActionPlan: sharedState.actionPlan
    };
}

/**
 * Clears the action plan in the shared state by setting it to an empty string.
 *
 * @returns {{status: string, message: string}} A confirmation object.
 */
export function clearActionPlan() {
    console.log("Executing clearActionPlan: Resetting the action plan.");
    sharedState.actionPlan = ''; // Reset to an empty string

    return {
        status: "Success",
        message: "Action plan has been cleared."
    };
}

/**
 * Writes or appends notes to the shared state for internal context.
 *
 * @param {object} parameters - The parameters for the command.
 * @param {string} parameters.notes - The content to be written.
 * @param {boolean} [parameters.append=false] - If true, appends to existing notes.
 * @returns {{status: string, message: string, currentNotes: string}} A result object.
 */
export function writeNotes(parameters) {
    const { notes, append = false } = parameters || {};

    if (typeof notes !== 'string') {
        const errorMsg = "writeNotes Error: 'notes' parameter must be a string.";
        console.error(errorMsg);
        return { status: "Error", message: errorMsg };
    }

    if (append && sharedState.notes) {
        sharedState.notes += `\n${notes}`; // Append with a newline
        console.log(`Notes Appended. Current Notes: "${sharedState.notes}"`);
    } else {
        sharedState.notes = notes; // Overwrite or initialize
        console.log(`Notes Overwritten. Current Notes: "${sharedState.notes}"`);
    }

    return {
        status: "Success",
        message: `Notes have been successfully ${append ? 'appended' : 'updated'}.`,
        currentNotes: sharedState.notes
    };
}

// --- Utility Commands ---

/**
 * Pauses execution for a specified number of minutes.
 *
 * @param {object} parameters - The parameters for the command.
 * @param {number} parameters.minutes - The number of minutes to wait.
 * @returns {Promise<{status: string, message: string}>} A promise that resolves upon completion.
 */
export async function wait(parameters) {
    const minutes = parameters?.minutes;

    if (typeof minutes !== 'number' || minutes <= 0) {
        const errorMsg = `wait Error: 'minutes' parameter must be a positive number. Received: ${minutes}`;
        console.error(errorMsg);
        return { status: "Error", message: errorMsg };
    }

    console.log(`Pausing execution for ${minutes} minute(s)...`);
    await new Promise(resolve => setTimeout(resolve, minutes * 60 * 1000));
    console.log(`Wait finished after ${minutes} minute(s).`);

    return { status: "Success", message: `Waited for ${minutes} minute(s).` };
}

/**
 * Sends a notification to the operator via ntfy.sh.
 *
 * @param {object} parameters - The parameters for the command.
 * @param {string} parameters.message - The message to send.
 * @returns {Promise<{status: string, message: string}>} A promise that resolves with the operation status.
 */
export async function notifyOperator(parameters) {
    const { message } = parameters || {};

    if (!message || typeof message !== 'string') {
        const errorMsg = "notifyOperator Error: 'message' parameter is missing or invalid.";
        console.error(errorMsg);
        return { status: "Error", message: errorMsg };
    }

    console.log(`Sending notification: "${message}"`);

    try {
        const response = await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
            method: 'POST',
            headers: {
                'Title': 'Bot Notification',
                'Content-Type': 'text/plain',
            },
            body: message
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`ntfy.sh API error - Status: ${response.status}, Body: ${errorBody}`);
        }

        console.log('Notification sent successfully.');
        return { status: "Success", message: "Notification sent." };

    } catch (error) {
        console.error('Failed to send notification:', error.message);
        return { status: "Error", message: `Failed to send notification: ${error.message}` };
    }
}

import systemPrompt from './systemPrompt.js';
import sharedState from './state.js';
import fetch from 'node-fetch';

// Define the ntfy.sh topic for notifications.
// It's good practice to keep this configurable, perhaps in an environment variable.
const NTFY_TOPIC = 'constantin-bot-notifications-xyz123'; // Replace with your actual topic

/**
 * Clears the terminal or console screen.
 * @returns {void}
 */
export function clearTerminal(messages) {
  console.log("Executing clearTerminal: Resetting message history.");

  // 1. Clear the existing array. .length = 0 is the most efficient way.
  messages.length = 0;

  // 2. Push the initial state back into the array.
  messages.push(
    { role: "system", content: systemPrompt },
    { role: "user", content: ">" }
  );
  return 'Terminal cleared';
}

/**
 * Writes or updates a strategic action plan.
 * @param {object} parameters - The parameters for the command.
 * @param {string} parameters.updatedActionPlan - The new content for the action plan.
 * @returns {void}
 */

export function writeToActionPlan(parameters) {
  
  // Update the actionPlan in the shared state object
  sharedState.actionPlan = parameters.actionPlan;
  
  console.log(`Action Plan Updated: "${sharedState.actionPlan}"`);
  
  return { 
    status: "Success", 
    message: "Action plan has been updated.",
    newActionPlan: sharedState.actionPlan 
  };
}
/**
 * Pauses execution for a specified number of minutes.
 * @param {object} parameters - The parameters for the command.
 * @param {number} parameters.minutes - The number of minutes to wait.
 * @returns {Promise<void>}
 */
export async function wait(parameters) {
  const minutes = parameters.minutes || 0;
  console.log(`Function called: wait. Pausing for ${minutes} minute(s).`);
  // This is a simple implementation of a wait function.
  if (minutes > 0) {
    await new Promise(resolve => setTimeout(resolve, minutes * 60 * 1000));
  }
  console.log(`Wait finished after ${minutes} minute(s).`);
}


/**
 * Sends a notification to the operator via ntfy.sh.
 * This function is asynchronous as it performs a network request.
 *
 * @param {object} parameters - The parameters for the command.
 * @param {string} parameters.message - The message content to send in the notification.
 * @returns {Promise<void>} A promise that resolves when the notification has been sent, or rejects on error.
 */
export async function notifyOperator(parameters) {
  const { message } = parameters;
  const notificationTitle = 'Operator Notification';

  if (!message) {
    console.error("notifyOperator Error: 'message' parameter is missing or empty.");
    return; // Exit if there is no message to send
  }

  console.log(`Sending notification to operator: "${message}"`);

  try {
    const response = await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
      method: 'POST',
      headers: {
        'Title': notificationTitle,
        'Content-Type': 'text/plain', // Explicitly set content type
      },
      body: message
    });

    if (!response.ok) {
      // ntfy.sh provides useful error messages in the response body
      const errorBody = await response.text();
      throw new Error(`Failed to send notification. Status: ${response.status}. Body: ${errorBody}`);
    }

    console.log('Notification sent successfully.');

  } catch (error) {
    console.error('Failed to execute notifyOperator:', error);
    // Depending on the application's needs, you might want to re-throw the error
    // or handle it silently.
  }
}

/**
 * Writes or appends notes to a shared state for internal context.
 * This allows the AI to keep track of observations or temporary information.
 *
 * @param {object} parameters - The parameters for the command.
 * @param {string} parameters.notes - The content to be written to the notes.
 * @param {boolean} [parameters.append=false] - If true, appends the new notes to existing notes. If false (default), overwrites them.
 * @returns {object} A status object confirming the action.
 */
export function writeNotes(parameters) {
  const { notes, append = false } = parameters;

  if (typeof notes !== 'string') {
    const errorMessage = "writeNotes Error: 'notes' parameter must be a string.";
    console.error(errorMessage);
    return { status: "Error", error: errorMessage };
  }

  if (append) {
    // Append with a newline for better readability
    sharedState.notes = sharedState.notes ? `${sharedState.notes}\n${notes}` : notes;
    console.log(`Notes Appended. New Notes: "${sharedState.notes}"`);
  } else {
    // Overwrite existing notes
    sharedState.notes = notes;
    console.log(`Notes Overwritten. New Notes: "${sharedState.notes}"`);
  }

  return {
    status: "Success",
    message: `Notes have been successfully ${append ? 'appended' : 'updated'}.`,
    currentNotes: sharedState.notes
  };
}




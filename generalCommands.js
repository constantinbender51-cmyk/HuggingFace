import systemPrompt from './systemPrompt.js';
import sharedState from './state.js';
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
 * Sends a notification to the operator.
 * @param {object} parameters - The parameters for the command.
 * @param {string} parameters.message - The message to send.
 * @returns {void}
 */
export function notifyOperator(parameters) {
  console.log(`Function called: notifyOperator with message: "${parameters.message}"`);
  // In a real application, this could send an email, a Slack message, or a push notification.
}


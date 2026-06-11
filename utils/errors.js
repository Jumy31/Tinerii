import { logger } from './logger.js';

/**
 * Custom error class for bot errors
 */
export class BotError extends Error {
  constructor(message, code = 'UNKNOWN_ERROR') {
    super(message);
    this.name = 'BotError';
    this.code = code;
  }
}

/**
 * Handle command execution errors
 * @param {*} error - Error object
 * @param {*} interaction - Discord interaction
 * @param {string} commandName - Name of the command that failed
 */
export async function handleCommandError(error, interaction, commandName) {
  logger.error(`Error in command ${commandName}:`, error);

  const errorMessage = error.message || 'An unknown error occurred';
  const reply = {
    content: `❌ **Error in command \`${commandName}\`**\n\`\`\`${errorMessage}\`\`\``,
    ephemeral: true,
  };

  try {
    if (interaction.replied) {
      await interaction.followUp(reply);
    } else if (interaction.deferred) {
      await interaction.editReply(reply);
    } else {
      await interaction.reply(reply);
    }
  } catch (err) {
    logger.error('Failed to send error message:', err);
  }
}

/**
 * Handle event errors
 * @param {*} error - Error object
 * @param {string} eventName - Name of the event
 */
export function handleEventError(error, eventName) {
  logger.error(`Error in event ${eventName}:`, error);
}

/**
 * Validate command arguments
 * @param {*} interaction - Discord interaction
 * @param {Array<string>} requiredArgs - Required argument names
 * @returns {boolean}
 */
export function validateArgs(interaction, requiredArgs = []) {
  for (const arg of requiredArgs) {
    const value = interaction.options.get(arg);
    if (!value) {
      return false;
    }
  }
  return true;
}

/**
 * Check if user has permission
 * @param {*} interaction - Discord interaction
 * @param {string} permission - Permission to check
 * @returns {boolean}
 */
export function hasPermission(interaction, permission) {
  if (!interaction.member) return false;
  return interaction.member.permissions.has(permission);
}

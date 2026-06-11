/**
 * Simple logger utility with different log levels
 */

const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

const colors = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
};

const currentLogLevel = process.env.LOG_LEVEL ? LogLevel[process.env.LOG_LEVEL.toUpperCase()] || LogLevel.INFO : LogLevel.INFO;

/**
 * Format timestamp as HH:MM:SS
 * @returns {string}
 */
function getTimestamp() {
  const now = new Date();
  return now.toLocaleTimeString('en-US', { hour12: false });
}

/**
 * Log debug message
 * @param {string} message - Message to log
 * @param {*} data - Additional data
 */
function debug(message, data = '') {
  if (currentLogLevel <= LogLevel.DEBUG) {
    console.log(`${colors.dim}[${getTimestamp()}]${colors.reset} ${colors.cyan}[DEBUG]${colors.reset} ${message}`, data);
  }
}

/**
 * Log info message
 * @param {string} message - Message to log
 * @param {*} data - Additional data
 */
function info(message, data = '') {
  if (currentLogLevel <= LogLevel.INFO) {
    console.log(`${colors.bright}[${getTimestamp()}]${colors.reset} ${colors.green}[INFO]${colors.reset} ${message}`, data);
  }
}

/**
 * Log warning message
 * @param {string} message - Message to log
 * @param {*} data - Additional data
 */
function warn(message, data = '') {
  if (currentLogLevel <= LogLevel.WARN) {
    console.warn(`${colors.bright}[${getTimestamp()}]${colors.reset} ${colors.yellow}[WARN]${colors.reset} ${message}`, data);
  }
}

/**
 * Log error message
 * @param {string} message - Message to log
 * @param {*} error - Error object or data
 */
function error(message, error = '') {
  if (currentLogLevel <= LogLevel.ERROR) {
    console.error(`${colors.bright}[${getTimestamp()}]${colors.reset} ${colors.red}[ERROR]${colors.reset} ${message}`, error);
  }
}

export const logger = {
  debug,
  info,
  warn,
  error,
};

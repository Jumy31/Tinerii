import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { logger } from '../utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'db', 'database.db');

// Ensure db directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    logger.error('Database connection error:', err);
  } else {
    logger.info(`Database connected at ${dbPath}`);
  }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

/**
 * Initialize database tables
 */
export async function initializeDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Users table
      db.run(
        `
        CREATE TABLE IF NOT EXISTS users (
          user_id TEXT PRIMARY KEY,
          username TEXT NOT NULL,
          balance INTEGER DEFAULT 1000,
          level INTEGER DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        `,
        (err) => {
          if (err) {
            logger.error('Error creating users table:', err);
            reject(err);
          } else {
            logger.info('✓ Users table ready');
          }
        }
      );

      // Transactions table
      db.run(
        `
        CREATE TABLE IF NOT EXISTS transactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT NOT NULL,
          type TEXT NOT NULL,
          amount INTEGER NOT NULL,
          reason TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(user_id)
        )
        `,
        (err) => {
          if (err) {
            logger.error('Error creating transactions table:', err);
            reject(err);
          } else {
            logger.info('✓ Transactions table ready');
            resolve();
          }
        }
      );
    });
  });
}

/**
 * Run a database query (for INSERT, UPDATE, DELETE)
 * @param {string} sql - SQL query
 * @param {array} params - Query parameters
 * @returns {Promise}
 */
export function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

/**
 * Get a single row from database
 * @param {string} sql - SQL query
 * @param {array} params - Query parameters
 * @returns {Promise}
 */
export function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

/**
 * Get all rows from database
 * @param {string} sql - SQL query
 * @param {array} params - Query parameters
 * @returns {Promise}
 */
export function dbAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

/**
 * Get or create a user
 * @param {string} userId - Discord user ID
 * @param {string} username - Discord username
 * @returns {Promise}
 */
export async function getOrCreateUser(userId, username) {
  try {
    let user = await dbGet(
      'SELECT * FROM users WHERE user_id = ?',
      [userId]
    );

    // If user doesn't exist, create them
    if (!user) {
      await dbRun(
        'INSERT INTO users (user_id, username, balance) VALUES (?, ?, ?)',
        [userId, username, 1000] // Starting balance: 1000
      );
      logger.info(`New user created: ${username} (${userId})`);
      user = await dbGet('SELECT * FROM users WHERE user_id = ?', [userId]);
    }

    return user;
  } catch (error) {
    logger.error('Error in getOrCreateUser:', error);
    throw error;
  }
}

/**
 * Update user balance
 * @param {string} userId - Discord user ID
 * @param {number} amount - Amount to add/subtract
 * @returns {Promise}
 */
export async function updateBalance(userId, amount) {
  try {
    await dbRun(
      'UPDATE users SET balance = balance + ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
      [amount, userId]
    );
    return await dbGet('SELECT balance FROM users WHERE user_id = ?', [userId]);
  } catch (error) {
    logger.error('Error updating balance:', error);
    throw error;
  }
}

/**
 * Get user balance
 * @param {string} userId - Discord user ID
 * @returns {Promise}
 */
export async function getBalance(userId) {
  try {
    const user = await dbGet('SELECT balance FROM users WHERE user_id = ?', [userId]);
    return user ? user.balance : null;
  } catch (error) {
    logger.error('Error getting balance:', error);
    throw error;
  }
}

/**
 * Record a transaction
 * @param {string} userId - Discord user ID
 * @param {string} type - Transaction type (add/remove/transfer)
 * @param {number} amount - Amount
 * @param {string} reason - Reason for transaction
 * @returns {Promise}
 */
export async function recordTransaction(userId, type, amount, reason = '') {
  try {
    await dbRun(
      'INSERT INTO transactions (user_id, type, amount, reason) VALUES (?, ?, ?, ?)',
      [userId, type, amount, reason]
    );
    logger.info(`Transaction recorded: ${userId} - ${type} - ${amount}`);
  } catch (error) {
    logger.error('Error recording transaction:', error);
    throw error;
  }
}

export default db;

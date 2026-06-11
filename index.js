import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Client, Collection, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
import { initializeDatabase } from './database/database.js';
import { logger } from './utils/logger.js';

// Load environment variables
dotenv.config();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Validate required environment variables
const requiredEnvVars = ['DISCORD_TOKEN', 'CLIENT_ID', 'GUILD_ID'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    logger.error(`Missing environment variable: ${envVar}`);
    process.exit(1);
  }
}

// Create Discord client with necessary intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Initialize collections for commands and cooldowns
client.commands = new Collection();
client.cooldowns = new Collection();

/**
 * Load all command files from the commands directory
 */
async function loadCommands() {
  const commandsPath = path.join(__dirname, 'commands');

  // Recursively get all .js files from commands directory
  const getAllFiles = (dir) => {
    let files = [];
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        files = [...files, ...getAllFiles(fullPath)];
      } else if (item.endsWith('.js')) {
        files.push(fullPath);
      }
    }

    return files;
  };

  const commandFiles = getAllFiles(commandsPath);
  let loadedCount = 0;

  for (const filePath of commandFiles) {
    try {
      const command = await import(`file://${filePath}`);

      if (!command.data || !command.execute) {
        logger.warn(`Skipping ${path.basename(filePath)} - missing data or execute`);
        continue;
      }

      client.commands.set(command.data.name, command);
      loadedCount++;
    } catch (error) {
      logger.error(`Error loading command ${filePath}:`, error);
    }
  }

  logger.info(`Successfully loaded ${loadedCount} commands`);
}

/**
 * Load all event files from the events directory
 */
async function loadEvents() {
  const eventsPath = path.join(__dirname, 'events');
  const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith('.js'));
  let loadedCount = 0;

  for (const file of eventFiles) {
    try {
      const event = await import(`file://${path.join(eventsPath, file)}`);

      if (!event.name || !event.execute) {
        logger.warn(`Skipping ${file} - missing name or execute`);
        continue;
      }

      if (event.once) {
        client.once(event.name, (...args) => event.execute(client, ...args));
      } else {
        client.on(event.name, (...args) => event.execute(client, ...args));
      }

      loadedCount++;
    } catch (error) {
      logger.error(`Error loading event ${file}:`, error);
    }
  }

  logger.info(`Successfully loaded ${loadedCount} events`);
}

/**
 * Initialize the bot
 */
async function initialize() {
  try {
    logger.info('🤖 Starting Discord Bot...');

    // Initialize database
    await initializeDatabase();
    logger.info('✅ Database initialized');

    // Load commands and events
    await loadCommands();
    await loadEvents();

    // Login to Discord
    await client.login(process.env.DISCORD_TOKEN);
    logger.info('✅ Bot logged in successfully');
  } catch (error) {
    logger.error('Failed to initialize bot:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start the bot
initialize();

export default client;

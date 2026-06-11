/**
 * Bot configuration settings
 */

export const settings = {
  // Economy settings
  economy: {
    startingBalance: 1000,
    maxBalance: 999999999,
    minTransaction: 1,
  },

  // Cooldown settings (in seconds)
  cooldowns: {
    ping: 0,
    balance: 0,
    addmoney: 5,
    removemoney: 5,
    profile: 0,
    help: 0,
  },

  // Embed colors
  colors: {
    success: 0x00ff00,
    error: 0xff0000,
    info: 0x0099ff,
    warning: 0xffaa00,
    primary: 0x5865f2,
  },

  // Bot settings
  bot: {
    prefix: process.env.PREFIX || '!',
    allowDM: true,
    deleteCommands: false,
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    timestamps: true,
  },
};

export default settings;

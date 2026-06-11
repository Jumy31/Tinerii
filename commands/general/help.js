import { SlashCommandBuilder } from 'discord.js';
import { createPrimaryEmbed, addField } from '../../utils/embed.js';

/**
 * Help command - Display all available commands
 */

export const data = new SlashCommandBuilder()
  .setName('help')
  .setDescription('View all available commands and their descriptions');

export async function execute(interaction) {
  try {
    await interaction.deferReply();

    // Create help embed
    const embed = createPrimaryEmbed(
      '📖 Bot Commands Help',
      'Here are all the available commands you can use:'
    );

    // General commands
    addField(
      embed,
      '**🎮 General Commands**',
      '`/ping` - Check bot latency and status',
      false
    );

    // Economy commands
    addField(
      embed,
      '**💰 Economy Commands**',
      '`/balance [user]` - Check balance of you or another user\n' +
      '`/addmoney <user> <amount> [reason]` - Add money to a user (Admin)\n' +
      '`/removemoney <user> <amount> [reason]` - Remove money from a user (Admin)',
      false
    );

    // User commands
    addField(
      embed,
      '**👤 User Commands**',
      '`/profile [user]` - View your profile or another user\'s profile',
      false
    );

    // Additional info
    addField(
      embed,
      '**ℹ️ Information**',
      'All commands are slash commands (/) and can be used anywhere on the server.\n' +
      'Some commands require Administrator permissions.',
      false
    );

    embed.setColor(0x5865f2);

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error('Help command error:', error);
    await interaction.reply({
      content: '❌ An error occurred while displaying help.',
      ephemeral: true,
    });
  }
}

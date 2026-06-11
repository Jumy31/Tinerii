import { SlashCommandBuilder } from 'discord.js';
import { createInfoEmbed } from '../../utils/embed.js';

/**
 * Ping command - Check bot latency
 */

export const data = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Check if the bot is online and measure latency');

export async function execute(interaction) {
  try {
    // Defer reply to ensure we have time to respond
    await interaction.deferReply();

    // Calculate latency
    const latency = Math.round(interaction.client.ws.ping);
    const responseTime = Date.now() - interaction.createdTimestamp;

    // Create embed
    const embed = createInfoEmbed('Pong! 🏓', `
**Bot Latency:** ${latency}ms
**Response Time:** ${responseTime}ms
**Status:** Online ✅
    `);

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error('Ping command error:', error);
    await interaction.reply({
      content: '❌ An error occurred while executing the ping command.',
      ephemeral: true,
    });
  }
}

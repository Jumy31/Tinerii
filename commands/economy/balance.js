import { SlashCommandBuilder } from 'discord.js';
import { getOrCreateUser } from '../../database/database.js';
import { createSuccessEmbed, createErrorEmbed } from '../../utils/embed.js';
import { logger } from '../../utils/logger.js';

/**
 * Balance command - Check user's balance
 */

export const data = new SlashCommandBuilder()
  .setName('balance')
  .setDescription('Check your balance or another user\'s balance')
  .addUserOption((option) =>
    option
      .setName('user')
      .setDescription('The user to check balance for (default: yourself)')
      .setRequired(false)
  );

export async function execute(interaction) {
  try {
    await interaction.deferReply();

    // Get target user (default to command executor)
    const targetUser = interaction.options.getUser('user') || interaction.user;
    const userData = await getOrCreateUser(targetUser.id, targetUser.username);

    // Create success embed with balance
    const embed = createSuccessEmbed(
      `Balance for ${targetUser.username}`,
      `
**💰 Balance:** $${userData.balance.toLocaleString()}
**📊 Level:** ${userData.level}
**📅 Account Created:** <t:${Math.floor(new Date(userData.created_at).getTime() / 1000)}:R>
      `
    );

    embed.setThumbnail(targetUser.displayAvatarURL());

    await interaction.editReply({ embeds: [embed] });
    logger.info(`Balance checked for ${targetUser.username} - $${userData.balance}`);
  } catch (error) {
    logger.error('Balance command error:', error);
    const embed = createErrorEmbed('Error', 'An error occurred while checking balance.');
    await interaction.editReply({ embeds: [embed] });
  }
}

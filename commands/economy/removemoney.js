import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { getOrCreateUser, updateBalance, recordTransaction } from '../../database/database.js';
import { createSuccessEmbed, createErrorEmbed } from '../../utils/embed.js';
import { logger } from '../../utils/logger.js';

/**
 * Remove money command - Admin only
 */

export const data = new SlashCommandBuilder()
  .setName('removemoney')
  .setDescription('Remove money from a user (Admin only)')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addUserOption((option) =>
    option.setName('user').setDescription('User to remove money from').setRequired(true)
  )
  .addIntegerOption((option) =>
    option
      .setName('amount')
      .setDescription('Amount of money to remove')
      .setRequired(true)
      .setMinValue(1)
  )
  .addStringOption((option) =>
    option.setName('reason').setDescription('Reason for removing money').setRequired(false)
  );

export async function execute(interaction) {
  try {
    await interaction.deferReply();

    // Check permissions
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      const embed = createErrorEmbed('Permission Denied', 'You do not have permission to use this command.');
      return await interaction.editReply({ embeds: [embed] });
    }

    const targetUser = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');
    const reason = interaction.options.getString('reason') || 'Admin penalty';

    // Get or create user
    const userData = await getOrCreateUser(targetUser.id, targetUser.username);
    const newBalance = Math.max(0, userData.balance - amount);
    const actualAmount = userData.balance - newBalance;

    // Update balance and record transaction
    await updateBalance(targetUser.id, -actualAmount);
    await recordTransaction(targetUser.id, 'remove', actualAmount, reason);

    // Create success embed
    const embed = createSuccessEmbed(
      'Money Removed Successfully',
      `
**User:** ${targetUser.username}
**Amount Removed:** $${actualAmount.toLocaleString()}
**Previous Balance:** $${userData.balance.toLocaleString()}
**New Balance:** $${newBalance.toLocaleString()}
**Reason:** ${reason}
      `
    );

    embed.setThumbnail(targetUser.displayAvatarURL());

    await interaction.editReply({ embeds: [embed] });
    logger.info(`Removed $${actualAmount} from ${targetUser.username} - Reason: ${reason}`);
  } catch (error) {
    logger.error('Removemoney command error:', error);
    const embed = createErrorEmbed('Error', 'An error occurred while removing money.');
    await interaction.editReply({ embeds: [embed] });
  }
}

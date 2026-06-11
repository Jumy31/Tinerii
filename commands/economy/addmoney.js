import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { getOrCreateUser, updateBalance, recordTransaction } from '../../database/database.js';
import { createSuccessEmbed, createErrorEmbed } from '../../utils/embed.js';
import { logger } from '../../utils/logger.js';

/**
 * Add money command - Admin only
 */

export const data = new SlashCommandBuilder()
  .setName('addmoney')
  .setDescription('Add money to a user (Admin only)')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addUserOption((option) =>
    option.setName('user').setDescription('User to add money to').setRequired(true)
  )
  .addIntegerOption((option) =>
    option
      .setName('amount')
      .setDescription('Amount of money to add')
      .setRequired(true)
      .setMinValue(1)
  )
  .addStringOption((option) =>
    option.setName('reason').setDescription('Reason for adding money').setRequired(false)
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
    const reason = interaction.options.getString('reason') || 'Admin gift';

    // Get or create user
    const userData = await getOrCreateUser(targetUser.id, targetUser.username);
    const newBalance = userData.balance + amount;

    // Update balance and record transaction
    await updateBalance(targetUser.id, amount);
    await recordTransaction(targetUser.id, 'add', amount, reason);

    // Create success embed
    const embed = createSuccessEmbed(
      'Money Added Successfully',
      `
**User:** ${targetUser.username}
**Amount Added:** $${amount.toLocaleString()}
**Previous Balance:** $${userData.balance.toLocaleString()}
**New Balance:** $${newBalance.toLocaleString()}
**Reason:** ${reason}
      `
    );

    embed.setThumbnail(targetUser.displayAvatarURL());

    await interaction.editReply({ embeds: [embed] });
    logger.info(`Added $${amount} to ${targetUser.username} - Reason: ${reason}`);
  } catch (error) {
    logger.error('Addmoney command error:', error);
    const embed = createErrorEmbed('Error', 'An error occurred while adding money.');
    await interaction.editReply({ embeds: [embed] });
  }
}

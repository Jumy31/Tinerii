import { SlashCommandBuilder } from 'discord.js';
import { getOrCreateUser, dbAll } from '../../database/database.js';
import { createPrimaryEmbed } from '../../utils/embed.js';
import { logger } from '../../utils/logger.js';

/**
 * Profile command - View user profile with statistics
 */

export const data = new SlashCommandBuilder()
  .setName('profile')
  .setDescription('View your profile or another user\'s profile')
  .addUserOption((option) =>
    option
      .setName('user')
      .setDescription('The user to view profile for (default: yourself)')
      .setRequired(false)
  );

export async function execute(interaction) {
  try {
    await interaction.deferReply();

    // Get target user
    const targetUser = interaction.options.getUser('user') || interaction.user;
    const userData = await getOrCreateUser(targetUser.id, targetUser.username);

    // Get transaction count
    const transactions = await dbAll(
      'SELECT COUNT(*) as count FROM transactions WHERE user_id = ?',
      [targetUser.id]
    );
    const transactionCount = transactions[0]?.count || 0;

    // Get total money earned
    const earned = await dbAll(
      'SELECT SUM(amount) as total FROM transactions WHERE user_id = ? AND type = "add"',
      [targetUser.id]
    );
    const totalEarned = earned[0]?.total || 0;

    // Get total money spent
    const spent = await dbAll(
      'SELECT SUM(amount) as total FROM transactions WHERE user_id = ? AND type = "remove"',
      [targetUser.id]
    );
    const totalSpent = spent[0]?.total || 0;

    // Create profile embed
    const embed = createPrimaryEmbed(
      `${targetUser.username}'s Profile`,
      `
**💰 Account Information**
┌ Balance: **$${userData.balance.toLocaleString()}**
┌ Level: **${userData.level}**
└ Account Created: <t:${Math.floor(new Date(userData.created_at).getTime() / 1000)}:R>

**📊 Statistics**
┌ Total Transactions: **${transactionCount}**
┌ Total Earned: **$${totalEarned.toLocaleString()}**
└ Total Spent: **$${totalSpent.toLocaleString()}**
    `
    );

    embed.setThumbnail(targetUser.displayAvatarURL());
    embed.setColor(0x5865f2);

    await interaction.editReply({ embeds: [embed] });
    logger.info(`Profile viewed for ${targetUser.username}`);
  } catch (error) {
    logger.error('Profile command error:', error);
    await interaction.reply({
      content: '❌ An error occurred while fetching the profile.',
      ephemeral: true,
    });
  }
}

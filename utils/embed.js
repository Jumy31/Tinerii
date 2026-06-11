import { EmbedBuilder } from 'discord.js';

const colors = {
  success: 0x00ff00,
  error: 0xff0000,
  info: 0x0099ff,
  warning: 0xffaa00,
  primary: 0x5865f2,
};

/**
 * Create a success embed
 * @param {string} title - Embed title
 * @param {string} description - Embed description
 * @returns {EmbedBuilder}
 */
export function createSuccessEmbed(title, description) {
  return new EmbedBuilder()
    .setColor(colors.success)
    .setTitle(`✅ ${title}`)
    .setDescription(description)
    .setTimestamp();
}

/**
 * Create an error embed
 * @param {string} title - Embed title
 * @param {string} description - Embed description
 * @returns {EmbedBuilder}
 */
export function createErrorEmbed(title, description) {
  return new EmbedBuilder()
    .setColor(colors.error)
    .setTitle(`❌ ${title}`)
    .setDescription(description)
    .setTimestamp();
}

/**
 * Create an info embed
 * @param {string} title - Embed title
 * @param {string} description - Embed description
 * @returns {EmbedBuilder}
 */
export function createInfoEmbed(title, description) {
  return new EmbedBuilder()
    .setColor(colors.info)
    .setTitle(`ℹ️ ${title}`)
    .setDescription(description)
    .setTimestamp();
}

/**
 * Create a warning embed
 * @param {string} title - Embed title
 * @param {string} description - Embed description
 * @returns {EmbedBuilder}
 */
export function createWarningEmbed(title, description) {
  return new EmbedBuilder()
    .setColor(colors.warning)
    .setTitle(`⚠️ ${title}`)
    .setDescription(description)
    .setTimestamp();
}

/**
 * Create a primary embed
 * @param {string} title - Embed title
 * @param {string} description - Embed description
 * @returns {EmbedBuilder}
 */
export function createPrimaryEmbed(title, description) {
  return new EmbedBuilder()
    .setColor(colors.primary)
    .setTitle(title)
    .setDescription(description)
    .setTimestamp();
}

/**
 * Create an embed with custom color
 * @param {string} title - Embed title
 * @param {string} description - Embed description
 * @param {number} color - Hex color code
 * @returns {EmbedBuilder}
 */
export function createEmbed(title, description, color = colors.primary) {
  return new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setDescription(description)
    .setTimestamp();
}

/**
 * Add field to embed
 * @param {EmbedBuilder} embed - Embed to modify
 * @param {string} name - Field name
 * @param {string} value - Field value
 * @param {boolean} inline - Is field inline
 * @returns {EmbedBuilder}
 */
export function addField(embed, name, value, inline = false) {
  return embed.addFields({ name, value, inline });
}

/**
 * Set embed thumbnail
 * @param {EmbedBuilder} embed - Embed to modify
 * @param {string} url - Thumbnail URL
 * @returns {EmbedBuilder}
 */
export function setThumbnail(embed, url) {
  return embed.setThumbnail(url);
}

/**
 * Set embed author
 * @param {EmbedBuilder} embed - Embed to modify
 * @param {string} name - Author name
 * @param {string} url - Author URL
 * @param {string} iconUrl - Author icon URL
 * @returns {EmbedBuilder}
 */
export function setAuthor(embed, name, url = null, iconUrl = null) {
  return embed.setAuthor({ name, url, iconURL: iconUrl });
}

/**
 * Set embed footer
 * @param {EmbedBuilder} embed - Embed to modify
 * @param {string} text - Footer text
 * @param {string} iconUrl - Footer icon URL
 * @returns {EmbedBuilder}
 */
export function setFooter(embed, text, iconUrl = null) {
  return embed.setFooter({ text, iconURL: iconUrl });
}

export const embedColors = colors;

import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, Message, MessageEmbed } from "discord.js";
import { BotClient } from "../../core/client";
import { Command } from "../../core/command";

const data = new SlashCommandBuilder()
.setName('ban')
.setDescription('Ban a user from your server.')
.addUserOption(opt => opt.setName('user').setDescription('Choose the user you want to ban from the server.').setRequired(true))
.addBooleanOption(opt => opt.setName('dm').setDescription('Want bot to DM the user then set it to true.'))
.addStringOption(opt => opt.setName('reason').setDescription('Why you want to ban this user?'))

module.exports = class BanCommand extends Command {
  constructor(client: BotClient) {
    super(data, client);
    this.module = 'Moderation';
    this._bot_permission.push("BAN_MEMBERS");
  }

  async exec(interaction: CommandInteraction) {
    if(!interaction.guild) return this.client.util.replyError('Command can only be executed inside a guild.', interaction);
    const user = interaction.options.getUser('user', true);
    const DM = interaction.options.getBoolean('dm', false) || false;
    const reason = interaction.options.getString('reason', false) || `Moderator: ${interaction.user.tag}[${interaction.user.id}] requested with **no reason**`;

    const target = interaction.guild.members.cache.get(user.id) || await interaction.guild.members.fetch(user.id);

    if(!target.bannable) return interaction.reply({ ephemeral: true, content: "I do not have permission to ban this user." });
    const logEmbed = new MessageEmbed()
    .setTimestamp()
    .setThumbnail()

    target.ban({
      reason: reason
    })

    if(DM) {
      const embed = new MessageEmbed()
      .setColor('DARK_RED')
      .setThumbnail(user.displayAvatarURL())
      .setDescription(`You are banned from the server **${interaction.guild.name}** for "${reason}"`)
      .setTimestamp();
      target.send({ embeds: [embed]}).catch(err => err)
    }
  }
}
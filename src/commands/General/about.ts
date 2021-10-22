import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { BotClient } from "../../core/client";
import { Command } from "../../core/command";
import { description, version } from "../../../package.json"
const ms = require('ms')

const data = new SlashCommandBuilder()
.setName('about')
.setDescription('Get to know more about the bot')

module.exports = class AboutCommand extends Command {
  constructor(client: BotClient) {
    super(data, client);
  }

  async exec(interaction: CommandInteraction) {
    const owner = this.client.users.cache.get('479801755757183006') || await this.client.users.fetch("479801755757183006");
    const embed = this.client.util.embed('main')
    .setTitle(`Guardian Info`)
    .setURL(this.client.util.config.link.supportServer)
    .setAuthor('Shashank#3736', owner.displayAvatarURL(), this.client.util.config.link.githubProfile)
    .setDescription(description)
    .addField('Developer', owner.tag, true)
    .addField('Ping', `${this.client.ws.ping}ms`, true)
    .addField('Version', `${version}`, true)
    .addField('Uptime', ms(this.client.uptime), true)
    .addField('Credits', 'This bot is coded by using [discord.js-template](https://github.com/Shashank3736/discord.js-template) made by [Shashank3736](https://github.com/Shashank3736) with love.')
    .setTimestamp()
    .setThumbnail(this.client.util.config.images.githubUserAvatar);

    interaction.reply({ embeds: [embed]});
  }
}
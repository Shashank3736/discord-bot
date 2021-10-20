import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { BotClient } from "../../core/client";
import { Command } from "../../core/command";

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
    .setDescription(`A bot which is contains things that other multipurpose bot miss.`)
    .addField('Developer', owner.tag, true)
    .addField('Ping', `${this.client.ws.ping}ms`, true)
    .addField('Version', `${this.client.util.version}`, true)
    .setTimestamp()
    .setThumbnail(this.client.util.config.images.githubUserAvatar);

    interaction.reply({ embeds: [embed]});
  }
}
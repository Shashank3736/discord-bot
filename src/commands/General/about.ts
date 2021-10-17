import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed } from "discord.js";
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
    const embed = new MessageEmbed()
    .setTitle(`[Guardian Info]()`)
    .setColor("BLURPLE")
  }
}

//https://avatars2.githubusercontent.com/u/58896906?v=4?s=100
import { SlashCommandBuilder } from "@discordjs/builders";
import { BotClient } from "../../core/client";
import { Command } from "../../core/command";

const data = new SlashCommandBuilder()
.setName('config')
.setDescription('Change settings of your server.')
.addSubcommandGroup(grp => grp.setName('set').setDescription('Set config values for your server.')
  .addSubcommand(cmd => cmd.setName('log').setDescription('Set log channels for your server.')
    .addChannelOption(opt => opt.setName('channel').setDescription('Select channel where you want to send logs').setRequired(true))
    .addStringOption(opt => opt.setName('type').setDescription('Which type of logs you want to send there?'))))

module.exports = class ConfigCommand extends Command {
  constructor(client: BotClient) {
    super(data, client);
    this.permit_level = 5;
  }
}
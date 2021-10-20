import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { BotClient } from "../../core/client";
import { Command } from "../../core/command";

const data = new SlashCommandBuilder()
.setName('reload')
.setDescription('Reload a command.')
.addStringOption(opt => opt.setName('command').setDescription('Write the name of command you want to reload').setRequired(true));

module.exports = class ReloadCommand extends Command {
  constructor(client: BotClient) {
    super(data, client);

    this._developer = true;
  }

  async exec(interaction: CommandInteraction) {
    const commandID = interaction.options.getString('command', true);
    
    const command = this.client.commands.get(commandID);
    if(!command) return this.client.util.replyError(`Incorrect command name: ${commandID}`, interaction);

    try {
      command.reload();
      interaction.reply({ content: 'Command reloaded successfully! '});
    } catch (error) {
      this.client.util.replyError(`An error occured while the bot tried to reload the command.\n\n${error}`, interaction)
    }
  }
}
import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import { BotClient } from '../core/client';
import { Command } from '../core/command';

const data = new SlashCommandBuilder()
  .setName('help')
  .setDescription('Get help of a command.')
  .addStringOption((opt) => opt.setName('command').setDescription('Command you want help for.'))
  .addBooleanOption((opt) => opt.setName('hide').setDescription('You want to hide help message or not.'))
module.exports = class HelpCommand extends Command {
  constructor(client: BotClient) {
    super(data, client);
  }

  async exec(interaction: CommandInteraction) {
    const command = interaction.options.getString('command', false);
    const hide = interaction.options.getBoolean('hide', false) || false;
    const all = interaction.options.getBoolean('all', false);

    if (command) {
      const cmd = this.client.commands.get(command);
      if (!cmd) interaction.reply({ ephemeral: true, content: 'ERROR: COMMAND NOT AVAILABLE.' });
      else cmd.help(interaction);
    } else {
      const embed = new MessageEmbed()
        .setTitle('Help')
        .setThumbnail(this.client.user?.displayAvatarURL())
        .setColor('BLURPLE');

      let description = '';
      for (const [_id, cmd] of this.client.commands) {
        description += `\`[${cmd.getPermitLevel(interaction.guild ? interaction.guild.id : undefined)}] ${cmd.data.name}\`: ${cmd.data.description}\n`;
      }
      embed.setDescription(description);

      interaction.reply({ ephemeral: hide, embeds: [embed] });
    }
  }
};

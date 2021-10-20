import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { BotClient } from '../../core/client';
import { Command } from '../../core/command';

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

    if (command) {
      const commands = command.split(' ');
      if(commands.length === 2) {
        const cmd = this.client.commands.get(commands[0]);
        if(!cmd) return interaction.reply({ ephemeral: true, content: 'ERROR: COMMAND NOT AVAILABLE.' });

        const subcmd = cmd.toJSON().options.find(sub => sub.name === commands[1]);
        if(!subcmd) return interaction.reply({ ephemeral: true, content: 'ERROR: COMMAND NOT AVAILABLE.' });

        const embed = this.client.util.createHelpEmbed(subcmd, { 
          permit_level: cmd.getPermitLevel(interaction.guild?.id), 
          prefix: `/${commands[0]} `,
          description: cmd._descriptions[subcmd.name]})[0];
          
        interaction.reply({ embeds: [embed] });
      } else if(commands.length === 3) {
        const cmdFile = this.client.commands.get(commands[0]);
        const cmd = this.client.commands.get(commands[0])?.toJSON();
        if(!cmd || !cmdFile) return interaction.reply({ ephemeral: true, content: 'ERROR: COMMAND NOT AVAILABLE.' });

        const subcmdgrp = cmd.options.find(grp => grp.name === commands[1]);
        if(!subcmdgrp) return interaction.reply({ ephemeral: true, content: 'ERROR: COMMAND NOT AVAILABLE.' });

        const subcmd = subcmdgrp.options.find(sub => sub.name === commands[2]);
        if(!subcmd) return interaction.reply({ ephemeral: true, content: 'ERROR: COMMAND NOT AVAILABLE.' });

        const embed = this.client.util.createHelpEmbed(subcmd, {
          permit_level: cmdFile.getPermitLevel(interaction.guild?.id),
          prefix: `/${cmd.name} ${subcmdgrp.name} `
        })[0];

        interaction.reply({ embeds: [embed] })
      } else {
        const cmd = this.client.commands.get(commands[0]);
        if (!cmd) interaction.reply({ ephemeral: true, content: 'ERROR: COMMAND NOT AVAILABLE.' });
        else cmd.help(interaction);
      }
    } else {
      const embed = this.client.util.embed('main')
        .setTitle('Help')
        .setThumbnail(this.client.user?.displayAvatarURL() || this.client.util.config.images.githubUserAvatar);

      let description = '';
      for (const [_id, cmd] of this.client.commands) {
        description += `\`[${cmd.getPermitLevel(interaction.guild ? interaction.guild.id : undefined)}] ${cmd.data.name}\`: ${cmd.data.description}\n`;
      }
      embed.setDescription(description);

      interaction.reply({ ephemeral: hide ? true : false, embeds: [embed] });
    }
  }

  async adv_exec(interaction: CommandInteraction) {
    const commandJSON = this.client.commands.map(cmd => cmd.toJSON());
    const onlyCmd = commandJSON.filter(cmd => cmd.options)
  }
};

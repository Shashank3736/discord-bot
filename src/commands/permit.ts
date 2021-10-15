import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, Options } from 'discord.js';
import { BotClient } from '../core/client';
import { Command } from '../core/command';
import { PermissionManager } from '../core/permission';
import { clean, hastebin } from '../helper/util';

const db = require('quick.db');

const permsSlashCommand = new SlashCommandBuilder()
  .setName('permit')
  .setDescription('Customise the permissions for your server bot commands.')
  .addSubcommand((cmd) => cmd.setName('reset').setDescription('Reset permit level in your server to default.'))
  .addSubcommand((subcmd) => subcmd.setName('enable')
    .setDescription('Enable a command in your server.')
    .addStringOption((option) => option.setName('command').setDescription('Write the name of command.').setRequired(true)))
  .addSubcommand((subcmd) => subcmd.setName('disable')
    .setDescription('Disable a command in your server.')
    .addStringOption((opt) => opt.setName('command').setDescription('Write the name of command.').setRequired(true)))
// add group= "add";
  .addSubcommandGroup((grp) => grp.setName('set')
    .setDescription('Set permission level for your server')
    .addSubcommand((subcmd) => subcmd
    // add cmd = "role";
      .setName('role')
      .setDescription('Set permission level for a role.')
      .addIntegerOption((option) => option
        .setName('permit_level')
        .setDescription('Choose permit level.')
        .addChoice('REGULAR', 1)
        .addChoice('SUPPORTER', 2)
        .addChoice('MODERATOR', 3)
        .addChoice('ADMINISTRATOR', 4)
        .addChoice('OWNER', 5)
        .setRequired(true))
      .addRoleOption((option) => option
        .setName('role')
        .setDescription('Choose role.')
        .setRequired(true)))
  // add cmd = "user";
    .addSubcommand((subcmd) => subcmd
      .setName('user')
      .setDescription('Set permission for a member.')
      .addIntegerOption((option) => option
        .setName('permit_level')
        .setDescription('Choose permit level')
        .addChoice('REGULAR', 1)
        .addChoice('SUPPORTER', 2)
        .addChoice('MODERATOR', 3)
        .addChoice('ADMINISTRATOR', 4)
        .addChoice('OWNER', 5)
        .setRequired(true))
      .addUserOption((option) => option
        .setName('user')
        .setDescription('Select user.')
        .setRequired(true)))
    .addSubcommand((subcmd) => subcmd
      .setName('command')
      .setDescription('Set new permission level for your server command')
      .addStringOption((option) => option.setName('command').setRequired(true).setDescription('Write the name of command.'))
      .addIntegerOption((option) => option
        .setName('permit_level')
        .setDescription('Select permit level.')
        .addChoice('REGULAR', 1)
        .addChoice('SUPPORTER', 2)
        .addChoice('MODERATOR', 3)
        .addChoice('ADMINISTRATOR', 4)
        .addChoice('OWNER', 5)
        .setRequired(true))))
  .addSubcommandGroup((grp) => grp.setName('remove')
    .setDescription('Remove permission level from a role, user or command.')
    .addSubcommand((subcmd) => subcmd
      .setName('role')
      .setDescription('Remove permission level from a role.')
      .addRoleOption((option) => option
        .setName('role')
        .setDescription('Choose the role.')
        .setRequired(true)))
    .addSubcommand((subcmd) => subcmd
      .setName('user')
      .setDescription('Remove permission level from a member.')
      .addUserOption((option) => option
        .setName('user')
        .setDescription('Choose the member.')
        .setRequired(true)))
    .addSubcommand((subcmd) => subcmd.setName('command')
      .setDescription('Commad you want to get permission level')
      .addStringOption((option) => option.setName('command').setDescription('Write the name of command.').setRequired(true))))
  .addSubcommandGroup((grp) => grp.setName('get')
    .setDescription('Get permit level of a role, user, or command.')
    .addSubcommand((subcmd) => subcmd
      .setName('role')
      .setDescription('Check permission level of a role.')
      .addRoleOption((option) => option
        .setName('role')
        .setDescription('Choose the role')
        .setRequired(true)))
    .addSubcommand((subcmd) => subcmd
      .setName('user')
      .setDescription('Check permission level of a member.')
      .addUserOption((option) => option
        .setName('user')
        .setDescription('Choose the member.')
        .setRequired(true)))
    .addSubcommand((subcmd) => subcmd.setName('command')
      .setDescription('Commad you want to get permission level')
      .addStringOption((option) => option.setName('command').setDescription('Write the name of command.').setRequired(true))));

module.exports = class PermissionCommand extends Command {
  constructor(client: BotClient) {
    super(permsSlashCommand, client);
    this.permit_level = 5;
    this._description = `You may set permissions based on individual command names, or permission levels.
    
    Acceptable permission levels are:
    - **Owner** [5] (absolute control over the bot)
    - **Administrator** [4] (administrative powers such as setting activities)
    - **Moderator** [3] (ability to block)
    - **Supporter** [2] (access to core Modmail supporting functions)
    - **Regular** [1] (most basic interactions such as help and about)
    
    By default, owner is set to the absolute bot owner and regular is @everyone.
    
    To set permissions in your server type \`/permit set (role|user|command) [arg1] [arg2]\``
  }

  // run when command= /permit set role
  async set_role(interaction: CommandInteraction) {
    if (!interaction.guildId) return interaction.reply({ ephemeral: true, content: 'MISSING_GUILD_ID: This command can only be run inside a server.' });
    const permsManager = new PermissionManager(interaction.client, interaction.guildId);
    const target = interaction.options.getRole('role', true);
    const permit = interaction.options.getInteger('permit_level', true);

    try {
      permsManager.push(target.id, 'ROLE', permit);
      interaction.reply({ content: `Permit level for **${target.name}** is set to \`${permit}\`` });
    } catch (error) {
      const error_txt = await clean(error);
      return interaction.reply({ ephemeral: true, content: `SET_ROLE_ERROR: ${error_txt}` });
    }
  }

  // run when command= /permit set command
  async set_command(interaction: CommandInteraction) {
    if (!interaction.guildId) return interaction.reply({ ephemeral: true, content: 'MISSING_GUILD_ID: This command can only be run inside a server.' });
    const permsManager = new PermissionManager(interaction.client, interaction.guildId);
    const target = interaction.options.getString('command', true);
    const permit = interaction.options.getInteger('permit_level', true);

    const cmd = interaction.client.commands.get(target);

    try {
      permsManager.push(cmd.data.name, 'COMMAND', permit);
      interaction.reply({ content: `Permit level for **${cmd.data.name}** is set to \`${permit}\`` });
    } catch (error) {
      const error_txt = await clean(error);
      return interaction.reply({ ephemeral: true, content: `SET_ROLE_ERROR: ${error_txt}` });
    }
  }

  async set_user(interaction: CommandInteraction) {
    if (!interaction.guildId) return interaction.reply({ ephemeral: true, content: 'MISSING_GUILD_ID: This command can only be run inside a server.' });
    const permsManager = new PermissionManager(interaction.client, interaction.guildId);
    const target = interaction.options.getUser('user', true);
    const permit = interaction.options.getInteger('permit_level', true);

    try {
      permsManager.push(target.id, 'USER', permit);
      interaction.reply({ content: `Permit level for **${target.toString()}** is set to \`${permit}\`` });
    } catch (error) {
      const error_txt = await clean(error);
      return interaction.reply({ ephemeral: true, content: `SET_ROLE_ERROR: ${error_txt}` });
    }
  }

  async remove_role(interaction: CommandInteraction) {
    if (!interaction.guildId) return interaction.reply({ ephemeral: true, content: 'MISSING_GUILD_ID: This command can only be run inside a server.' });
    const permsManager = new PermissionManager(interaction.client, interaction.guildId);
    const target = interaction.options.getRole('role', true);

    try {
      permsManager.remove(target.id, 'ROLE');
      interaction.reply({ content: `${target.toString()} removed from permit database.` });
    } catch (err) {
      interaction.reply({ content: `ERROR: ${await clean(err)}` });
    }
  }

  async remove_user(interaction: CommandInteraction) {
    if (!interaction.guildId) return interaction.reply({ ephemeral: true, content: 'MISSING_GUILD_ID: This command can only be run inside a server.' });
    const permsManager = new PermissionManager(interaction.client, interaction.guildId);
    const target = interaction.options.getUser('user', true);

    permsManager.remove(target.id, 'USER');
    interaction.reply({ content: `Member ${target.toString()} removed from permit system.` });
  }

  async remove_command(interaction: CommandInteraction) {
    if (!interaction.guildId) return interaction.reply({ ephemeral: true, content: 'MISSING_GUILD_ID: This command can only be run inside a server.' });
    const permsManager = new PermissionManager(interaction.client, interaction.guildId);
    const target = interaction.options.getString('command', true);

    permsManager.remove(target, 'COMMAND');
    interaction.reply({ content: `Command **${target}** is reset to its default permit level.` });
  }

  async get_role(interaction: CommandInteraction) {
    if (!interaction.guildId) return interaction.reply({ ephemeral: true, content: 'MISSING_GUILD_ID: This command can only be run inside a server.' });
    const permsManager = new PermissionManager(interaction.client, interaction.guildId);
    const target = interaction.options.getRole('role', true);
    const permit = await permsManager.get(target.id, 'ROLE', 1);

    interaction.reply({ content: `Permit level for role ${target.toString()}: \`${permit}\`` });
  }

  async get_user(interaction: CommandInteraction) {
    if (!interaction.guildId) return interaction.reply({ ephemeral: true, content: 'MISSING_GUILD_ID: This command can only be run inside a server.' });
    const permsManager = new PermissionManager(interaction.client, interaction.guildId);
    const target = interaction.options.getUser('user', true);
    const permit = await permsManager.getMemberLevel(target.id);

    interaction.reply({ content: `Permit level for ${target.toString()}: \`${permit}\`` });
  }

  async get_command(interaction: CommandInteraction) {
    if (!interaction.guildId) return interaction.reply({ ephemeral: true, content: 'MISSING_GUILD_ID: This command can only be run inside a server.' });
    const permsManager = new PermissionManager(interaction.client, interaction.guildId);
    const target = interaction.options.getString('command', true);

    const cmd = interaction.client.commands.get(target);
    const permit = permsManager.get(cmd.data.name, 'COMMAND', cmd.permit_level);

    interaction.reply({ content: `Permit for **${cmd.data.name}**: \`${permit}\`` });
  }

  async cmd_enable(interaction: CommandInteraction) {
    if (!interaction.guildId) return interaction.reply({ ephemeral: true, content: 'MISSING_GUILD_ID: This command can only be run inside a server.' });
    const permsManager = new PermissionManager(interaction.client, interaction.guildId);
    const target = interaction.options.getString('command', true);

    const cmd = interaction.client.commands.get(target);
    permsManager.remove(cmd.data.name, 'COMMAND');

    interaction.reply({ content: 'Command successfully enabled in your server.' });
  }

  async cmd_disable(interaction: CommandInteraction) {
    if (!interaction.guildId) return interaction.reply({ ephemeral: true, content: 'MISSING_GUILD_ID: This command can only be run inside a server.' });
    const permsManager = new PermissionManager(interaction.client, interaction.guildId);
    const target = interaction.options.getString('command', true);

    const cmd = interaction.client.commands.get(target);
    permsManager.push(cmd.data.name, 'COMMAND', -1);

    interaction.reply({ content: 'Command successfully disabled in your server.' });
  }

  async cmd_reset(interaction: CommandInteraction) {
    interaction.permitManager.reset();
    return interaction.reply({ content: 'Permit level is reset in your server.' });
  }
};

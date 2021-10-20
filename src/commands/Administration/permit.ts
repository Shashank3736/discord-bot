/**
 * @todo
 * Update permit responses to embeds
 */

import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import { BotClient } from '../../core/client';
import { Command } from '../../core/command';
import { PermissionManager, PermitLevel } from '../../core/permission';
import { clean } from '../../helper/util';

const db = require('quick.db');

const permsSlashCommand = new SlashCommandBuilder()
  .setName('permit')
  .setDescription('Customise the permissions for your server bot commands.')
  .addSubcommand((cmd) => cmd.setName('list').setDescription('List all the permit level you set for this server.'))
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
    this.module = 'Administration';
    this._description = `You may set permissions based on individual command names, or permission levels.
    
    Acceptable permission levels are:
    - **Owner** [5] (absolute control over the bot)
    - **Administrator** [4] (administrative powers such as setting activities)
    - **Moderator** [3] (ability to block)
    - **Supporter** [2] (access to core Modmail supporting functions)
    - **Regular** [1] (most basic interactions such as help and about)
    
    By default, owner is set to the absolute server owner and regular is @everyone.
    
    To set permissions in your server type \`/permit set <role|user|command> [arg1] [arg2]\`\n`;
    this._descriptions = {
      list: 'Run `/permit list` if you want to list all the pemission levels you set for this server.' +
      ' It divides the content in 3 part commands, role and user.\n\n' + 
      '> Note: It only shows list of permission which you set in this server. The dafault like owner have 5 and @everyone have 1 permit level is not shown here.',
      set: `Set permission in your server for role, user or command.
      
      It's recommended to not set OWNER permission level to any random person but only trusted one. As the bot treates server ownwer and person with \`OWNER\` permssion level same way.
      **Format:** /permit set [SUBCOMMAND: role | user | command ] [permit_level:PERMIT_TYPE] [target: role | user | command]
      `,
      get: `Get the permit level for a user, role or command.
      
      This command will show you the permission level of a role, user, or command.
      All the roles and users are by default set to 1. To change them see \`/help permit set\`.
      `,
      remove: `Remove permit level from a user, role or command which you set earlier.
      
      This command will help you to make a role, user or command in its default value.
      
      > Note: If you want to set your complete server to default permission then run \`/permit reset\``
    }
  }
  /**
   * Run `/permit list` if you want to list all the pemission levels you set for this server.
   * It divides the content in 3 part commands, role and user.
   * 
   * > Note: It only shows list of permission which you set in this server. The dafault like owner have 5 and @everyone have 1 permit level is not shown here. 
   */
  async cmd_list(interaction: CommandInteraction) {
    const getFieldString = (arr: PermitLevel[]) => arr.length > 0 ? arr.map(opt => `\`${opt.id} [${opt.permitLevel}]\``) : ['`None`'];
    if(!interaction.guild) return this.client.util.replyError('Command can only be executed inside a server.', interaction);
    const perms = new PermissionManager(this.client, interaction.guild?.id);
    const embed = this.client.util.embed('main')
    .setTitle('Permission Level for '+interaction.guild.name)
    .setDescription(`Permissions you set till date for command, role and user`);

    const commands = perms.permission.filter(opt => opt.type === 'COMMAND');
    const role = perms.permission.filter(opt => opt.type === 'ROLE');
    const user = perms.permission.filter(opt => opt.type === 'USER');

    embed.addField('Role', getFieldString(role).join(', '))
    .addField('Command', getFieldString(commands).join(', '))
    .addField('User', getFieldString(user).join(', '));

    return interaction.reply({ embeds: [embed] });
  }

  // run when command= /permit set role
  async set_role(interaction: CommandInteraction) {
    if (!interaction.guildId) return interaction.reply({ ephemeral: true, content: 'MISSING_GUILD_ID: This command can only be run inside a server.' });
    const permsManager = new PermissionManager(interaction.client, interaction.guildId);
    const target = interaction.options.getRole('role', true);
    const permit = interaction.options.getInteger('permit_level', true);

    try {
      permsManager.push(target.id, 'ROLE', permit);
      const embed = this.client.util.embed("success").setDescription(`Permit level for **${target.name}** is set to \`${permit}\``);
      interaction.reply({ embeds: [embed] });
    } catch (error) {
      const error_txt = await clean(error);
      return this.client.util.replyError(`SET_ROLE_ERROR: ${error_txt}`, interaction);
    }
  }

  // run when command= /permit set command
  async set_command(interaction: CommandInteraction) {
    if (!interaction.guildId) return interaction.reply({ ephemeral: true, content: 'MISSING_GUILD_ID: This command can only be run inside a server.' });
    const permsManager = new PermissionManager(interaction.client, interaction.guildId);
    const target = interaction.options.getString('command', true);
    const permit = interaction.options.getInteger('permit_level', true);

    const cmd = this.client.commands.get(target);
    if(!cmd) return this.client.util.replyError(`No such command exist in database ${target}.`, interaction);

    try {
      permsManager.push(cmd.data.name, 'COMMAND', permit);
      const embed = this.client.util.embed('success').setDescription(`Permit level for **${cmd.data.name}** is set to \`${permit}\``)
      interaction.reply({ embeds: [embed] });
    } catch (error) {
      const error_txt = await clean(error);
      return this.client.util.replyError(`SET_COMMAND_ERROR: ${error_txt}`, interaction);
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
      return this.client.util.replyError(`SET_USER_ERROR: ${error_txt}`, interaction);
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
      return this.client.util.replyError(`REMOVE_ROLE_ERROR: ${err}`, interaction);
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

    const cmd = this.client.commands.get(target);
    if(!cmd) return this.client.util.replyError(`No such command exist in database ${target}.`, interaction);

    const permit = cmd.getPermitLevel(interaction.guild?.id);

    interaction.reply({ content: `Permit for **${cmd.data.name}**: \`${permit}\`` });
  }

  async cmd_enable(interaction: CommandInteraction) {
    if (!interaction.guildId) return interaction.reply({ ephemeral: true, content: 'MISSING_GUILD_ID: This command can only be run inside a server.' });
    const permsManager = new PermissionManager(interaction.client, interaction.guildId);
    const target = interaction.options.getString('command', true);

    const cmd = this.client.commands.get(target);
    if(!cmd) return this.client.util.replyError(`No such command exist in database ${target}.`, interaction);

    permsManager.remove(cmd.data.name, 'COMMAND');

    interaction.reply({ content: 'Command successfully enabled in your server.' });
  }

  async cmd_disable(interaction: CommandInteraction) {
    if (!interaction.guildId) return interaction.reply({ ephemeral: true, content: 'MISSING_GUILD_ID: This command can only be run inside a server.' });
    const permsManager = new PermissionManager(interaction.client, interaction.guildId);
    const target = interaction.options.getString('command', true);

    const cmd = this.client.commands.get(target);
    if(!cmd) return this.client.util.replyError(`No such command exist in database ${target}.`, interaction);

    permsManager.push(cmd.data.name, 'COMMAND', -1);

    interaction.reply({ content: 'Command successfully disabled in your server.' });
  }

  async cmd_reset(interaction: CommandInteraction) {
    interaction.permitManager.reset();
    return interaction.reply({ content: 'Permit level is reset in your server.' });
  }
};

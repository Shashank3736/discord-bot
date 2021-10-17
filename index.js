const { SlashCommandBuilder } = require("@discordjs/builders");

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
      .addStringOption((option) => option.setName('command').setDescription('Write the name of command.').setRequired(true)))).toJSON()

console.log(permsSlashCommand.options);
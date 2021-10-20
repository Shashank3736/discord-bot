import { SlashCommandBuilder } from "@discordjs/builders";

const data = new SlashCommandBuilder()
.setName('config')
.setDescription('Config bot configuration values like color, avatar etc.')
//create set subcommand group
.addSubcommandGroup(grp => grp.setName('set')
  .setDescription('Set config value for your bot.')
  //create subcommand set.avatar
  .addSubcommand(subcmd => subcmd.setName('avatar').setDescription('Set avatar for the bot.')
    .addStringOption(opt => opt.setName('avatar_url').setRequired(true).setDescription('Write the image url here.')))
  //create set.status
  .addSubcommand(sub => sub.setName('status').setDescription('Set your bot status as idle, offline, online or dnd.')
    .addStringOption(opt => opt.setName('status').setDescription('Choose the status option from here.').setRequired(true).addChoices([['IDLE', 'idle'], ['OFFLINE', 'offline'], ['DND', 'dnd'], ['ONLINE', 'online']])))
  //create set.activity
  .addSubcommand(sub => sub.setName('activity').setDescription('Set activity for your bot.')
    .addStringOption(opt => opt.setRequired(true).setName('type').setDescription('Choose the type of activity.').addChoices([['Playing', 'playing'], ['Watching', "watching"], ['Listening', 'listening'], ['Streaming', 'streaming']]))
    .addStringOption(opt => opt.setName('content').setDescription('Write the message status will have like "to your worries"').setRequired(true)))
  //create set.name
  .addSubcommand(sub => sub.setName('name').setDescription('Set the name of bot.')
    .addStringOption(opt => opt.setName('name').setDescription('Write new name for your bot.').setRequired(true)))
  //create set.color
  .addSubcommand(sub => sub.setName('color').setDescription('Set custom embed color for your bot.')
    .addStringOption(opt => opt.setName('type').setDescription('Choose the type of embed color you want to change').setRequired(true)
      .addChoices([['Main (Which generally used.)', 'embed_main_color'], ['Wrong (When there is an error)', 'embed_error_color'], ['Log Color', 'embed_log_color']]))
    .addStringOption(opt => opt.setName('colour').setRequired(true).setDescription('Write your colour code.'))))

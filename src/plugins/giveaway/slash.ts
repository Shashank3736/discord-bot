import { SlashCommandBuilder } from "@discordjs/builders";

export const giveawaySlashCommand = new SlashCommandBuilder()
.setName('giveaway')
.setDescription('Create, edite, reroll giveaway by using this command.')
//cmd start
.addSubcommand(cmd => cmd.setName('start').setDescription('Start giveaway in your server!')
    .addChannelOption(opt => opt.setName('channel').setDescription('Channel where you want to start giveaway').setRequired(true))
    .addStringOption(opt => opt.setName('prize').setDescription('Prize the winner will get in this giveaway.').setRequired(true))
    .addStringOption(opt => opt.setRequired(true).setName('duration').setDescription('How long this giveaway will run?'))
    .addIntegerOption(opt => opt.setName('winners').setDescription('No. of winners').setRequired(true))
    .addRoleOption(opt => opt.setName('role_requirement').setDescription('Role require to participate in this giveaway.'))
    .addStringOption(opt => opt.setName('message_requirement').setDescription('No. of messages required to participate in a giveaway.'))
    .addStringOption(opt => opt.setDescription('Server member must join to participate in this giveaway.').setName('server_requirement')))
//cmd end
.addSubcommand(cmd => cmd.setName('end').setDescription('End an ongoing giveaway in your server.')
    .addStringOption(opt => opt.setName('giveaway_id').setDescription('Giveaway ID of the giveaway you want to end.').setRequired(true)))
//cmd reroll
.addSubcommand(cmd => cmd.setName('reroll').setDescription('Reroll giveaway in your server.')
    .addStringOption(opt => opt.setName('giveaway_id').setRequired(true).setDescription('Giveaway ID of the giveaway you want to reroll.')))
//cmd edit
.addSubcommand(cmd => cmd.setName('edit').setDescription('Edit a giveaway in your server')
    .addStringOption(opt => opt.setName('giveaway_id').setDescription('Giveaway ID of the giveaway you want to edit.').setRequired(true))
    .addStringOption(opt => opt.setName('duration').setDescription('New duration'))
    .addIntegerOption(opt => opt.setName('winnerCount').setDescription('New winner count.'))
    .addStringOption(opt => opt.setName('prize').setDescription('New prize.')))
//cmd delete
.addSubcommand(cmd => cmd.setName('delete').setDescription('Delete a giveaway from your server.')
    .addStringOption(opt => opt.setName('giveaway_id').setDescription('Giveaway ID of the giveaway you want to delete.').setRequired(true)))
//cmd pause
.addSubcommand(cmd => cmd.setName('pause').setDescription('Pause a giveaway in your server')
    .addStringOption(opt => opt.setName('giveaway_id').setDescription('Giveaway ID of the giveaway you want to pause.').setRequired(true)))
//cmd unpause
.addSubcommand(cmd => cmd.setName('unpause').setDescription('Unpause a giveawa in your server.')
    .addStringOption(opt => opt.setName('giveaway_id').setDescription('Giveaway ID of the giveaway you want to unpause.').setRequired(true)))



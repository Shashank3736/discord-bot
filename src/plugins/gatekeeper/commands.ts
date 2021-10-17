import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, GuildChannel, MessageAttachment, MessageEmbed, Options } from "discord.js";
import { Command } from "../../core/command";
import { table } from "quick.db";
import { createCaptchaSync } from "captcha-canvas";
import { BotClient } from "../../core/client";
const actionData = ['Quarantine', 'Kick', 'Ban'];
const db = new table('gatekeeper');

const ms = require('@shreyash21/ms');

export interface guildConfig {
    _id: string;
    status: Boolean;
    action: number; //1 - Leave 2 - Kick 3 - Ban
    duration: number;
    verification_channel_id: string;
    quarantine_role_id: string;
    entry_role_id?: string;
    log_channel_id?: string;
}

const setup_gatekeeper = new SlashCommandBuilder()
.setName('gatekeeper')
.setDescription('Command to setup verification system in your server.')
.addSubcommand(subcmd => subcmd.setName('config').setDescription('Configure verification system in your server like status, action, duration etc.')
    .addBooleanOption(option => option.setName('status').setDescription('Enable or disable verification system in your server.'))
    .addIntegerOption(option => option.setName('action').setDescription('Change the action bot takes once the user failed in verification.').addChoices([['Quarantine', 1], ['Kick', 2], ['Ban', 3]]))
    .addStringOption(option => option.setName('duration').setDescription('For how long do you want the verification process to last? e.g. 2h, 1 hour and 30 min'))
    .addRoleOption(option => option.setName('verified_role').setDescription('Bot will add this role when a member complete verification process.'))
    .addChannelOption(option => option.setName('log_channel').setDescription('Channel where bot will log all the verification process.'))
)
.addSubcommand(subcmd => subcmd.setName('show').setDescription('Show current configuration of your server.'))
.addSubcommand(subcmd => subcmd.setName('setup').setDescription('Setup gatekeeper in your server.'));

export class SetupCommand extends Command {
    constructor(client: BotClient) {
        super(setup_gatekeeper, client);
        this.permit_level = 4
        this._bot_permission.push("BAN_MEMBERS", "KICK_MEMBERS", "MANAGE_CHANNELS", "MANAGE_ROLES", "MANAGE_MESSAGES");
    }

    async _have_problem(interaction: CommandInteraction) {
        const subcmd = interaction.options.getSubcommand()
        if(!interaction.guild) {
            interaction.reply({ content: `Command can only be run inside a server.`, ephemeral: true });
            return true
        }
        let guildConfig: guildConfig = db.get(interaction.guild.id);
        if(!guildConfig && subcmd !== 'setup') {
            interaction.reply({ content: `Type \`/gatekeeper setup\` command first to setup it in your server.`});
            return true
        }

        return false;
    }

    async cmd_config(interaction: CommandInteraction) {
        if(!interaction.guild) return;
        let guildConfig: guildConfig = db.get(interaction.guild.id);
        if(!guildConfig) return interaction.reply({ content: `Type \`/gateway setup\` command first to setup it in your server.`});

        const status = interaction.options.getBoolean('status', false);
        if(status !== null) guildConfig.status = status;
        const action = interaction.options.getInteger('action', false);
        if(action !== null) guildConfig.action = action;
        const duration = interaction.options.getString('duration', false);
        if(duration !== null && ms(duration) >= 30*1000) guildConfig.duration = ms(duration);
        const entryRole = interaction.options.getRole('verified_role', false);
        if(entryRole !== null) guildConfig.entry_role_id = entryRole.id;
        const logChannel = interaction.options.getChannel('log_channel', false);
        if(logChannel) guildConfig.log_channel_id = logChannel.id
        db.set(interaction.guild.id, guildConfig);

        const captcha = createCaptchaSync(300, 100);
        const captchaFile = new MessageAttachment(captcha.image, captcha.text + '.png');
        const embed = new MessageEmbed()
        .setColor('BLURPLE')
        .setTitle('Gatekeeper')
        .setDescription('Your server verification settings.')
        .addField('Status', guildConfig.status ? '`Enable`' : '`Disable`', true)
        .addField('Action', actionData[guildConfig.action - 1], true)
        .addField('Duration', `${ms(guildConfig.duration)}`, true)
        .addField('Entry role', guildConfig.entry_role_id?`<@&${guildConfig.entry_role_id}>`: '`None`', true)
        .addField('Log channel', guildConfig.log_channel_id ? `<#${guildConfig.log_channel_id}>`: '*`None`*', true)
        .setImage('attachment://'+captcha.text+'.png');

        interaction.reply({ embeds: [embed], files: [captchaFile] });
        return;
    }

    async cmd_show(interaction: CommandInteraction) {
        if(!interaction.guild) return;
        let guildConfig: guildConfig = db.get(interaction.guild.id);

        const captcha = createCaptchaSync(300, 100);
        const captchaFile = new MessageAttachment(captcha.image, captcha.text + '.png');
        const embed = new MessageEmbed()
        .setTitle('Gatekeeper')
        .setColor('BLURPLE')
        .setDescription('Your server verification settings.')
        .addField('Status', guildConfig.status ? '`Enable`' : '`Disable`', true)
        .addField('Action', actionData[guildConfig.action - 1], true)
        .addField('Duration', `${ms(guildConfig.duration)}`, true)
        .addField('Entry role', guildConfig.entry_role_id?`<@&${guildConfig.entry_role_id}>`: '`None`', true)
        .addField('Log channel', guildConfig.log_channel_id ? `<#${guildConfig.log_channel_id}>`: '*`None`*', true)
        .setImage('attachment://'+captcha.text+'.png');

        interaction.reply({ embeds: [embed], files: [captchaFile] });
        return;
    }

    async cmd_setup(interaction: CommandInteraction) {
        if(!interaction.guild) return;
        
        const quarantineRole = await interaction.guild.roles.create({ name: 'Unverified' });
        for (const [_id, channel] of interaction.guild.channels.cache) {
            if(channel.type === "GUILD_CATEGORY" || channel.type === "GUILD_TEXT" || channel.type === "GUILD_VOICE") {
                channel.permissionOverwrites.create(quarantineRole, {
                    "VIEW_CHANNEL": false
                });
            }
        }

        const unverifiedChannel = await interaction.guild.channels.create('verify-here', {
            permissionOverwrites: [{
                id: interaction.guild.id,
                type: 'role',
                deny: ["VIEW_CHANNEL"]
            },{
                id: quarantineRole.id,
                type: 'role',
                allow: ["VIEW_CHANNEL"]
            }]
        });
        const guildConfig: guildConfig = {
            _id: interaction.guild.id,
            action: 2,
            duration: 30*60*1000,
            status: true,
            quarantine_role_id: quarantineRole.id,
            verification_channel_id: unverifiedChannel.id
        }
        db.set(`${interaction.guild.id}`, guildConfig);
        interaction.reply({ content: `Setup of gatekeeper is completed in your server **${interaction.guild?.name}**.
        Bot successfully created
        - verify here channnel: ${unverifiedChannel.toString()}
        - Unverified role: ${quarantineRole.toString()}`});
    }
}
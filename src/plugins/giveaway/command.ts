import { Giveaway, GiveawayStartOptions } from "discord-giveaways";
import { CommandInteraction } from "discord.js";
import { table } from "quick.db";
import { BotClient } from "../../core/client";
import { Command } from "../../core/command";
import { GiveawayHandler } from "./manager";
import { giveawaySlashCommand } from "./slash";
const ms = require('@shreyash21/ms');

const db = new table('giveaway');

export class GiveawayCommand extends Command {
    public giveawayManager: GiveawayHandler;

    constructor(client: BotClient, manager: GiveawayHandler) {
        super(giveawaySlashCommand, client);
        this.permit_level = 3;
        this.giveawayManager = manager;
    }

    async cmd_start(interaction: CommandInteraction) {
        const duration = interaction.options.getString('duration', true);
        if(ms(duration) === 0) return interaction.reply({ content: `I'm not able to understand. What do you mean by \`duration:\` **${duration}**`});
        if(ms(duration) < ms('30 s')) return interaction.reply({ content: `Giveaway for less than 30 sec is not allowed.`});
        const channel = interaction.options.getChannel('channel', true);
        const extraData: any = {};

        const role_requirement = interaction.options.getRole('role_requirement', false);
        const message_requirement = interaction.options.getInteger('message_requirement', false);
        const server_requirement = interaction.options.getString('server_requirement', false);

        extraData.role_requirement = role_requirement? role_requirement.id: '';
        extraData.message_requirement = message_requirement || 0;
        if(server_requirement) {
            const guildInvite = await this.client.fetchInvite(server_requirement);
            if(!guildInvite || !guildInvite.guild) return interaction.reply({ content: 'No server found please recheck your invite link.' });
            const isClient = this.client.guilds.cache.has(guildInvite.guild.id) || await this.client.guilds.fetch(guildInvite.guild.id);
            if(!isClient) return interaction.reply({ content: `Add bot in server **${guildInvite.guild.name}** then start giveaway.` });
            extraData.server_requirement = {
                id: guildInvite.guild.id,
                name: guildInvite.guild.name,
                invite: server_requirement
            }
        } else extraData.server_requirement = {};

        const startOption: GiveawayStartOptions = {
            prize: interaction.options.getString('prize', true),
            winnerCount: interaction.options.getInteger('winnerCount', true),
            duration: ms(interaction.options.getString('duration', true)),
            extraData: extraData,
            embedColor: "GREEN",
            embedColorEnd: "RED",
            hostedBy: interaction.user
        }

        this.giveawayManager.start(channel, startOption)
        .then((giveaway: Giveaway) => {
            const msg = `${interaction.user.toString()} your giveaway successfully started in ${channel.toString()}

            GiveawayID: ${giveaway.messageId}
            Message: ${giveaway.message?.url}`;
            return interaction.reply({ content: msg });
        })
        .catch((err: any) => interaction.reply({ content: `ERROR: ${err}`}));
    }

    async cmd_end(interaction: CommandInteraction) {
        const giveaway_id = interaction.options.getString('giveaway_id', true);
        this.giveawayManager.end(giveaway_id)
        .then(members => interaction.reply({ content: `Giveaway is ended with ${members.length === 0 ? '`None`' : members.map(mem => mem.toString()).join(' ')} as winners.`}))
        .catch(err => interaction.reply({ content: `No such giveaway exist in this server.`}));

        return;
    }

    async exec(interaction: CommandInteraction) {
        return interaction.reply({ ephemeral: true, content: `Giveaway is still not completed. Sorry for the inconvenience.`})
    }
}

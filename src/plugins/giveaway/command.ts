import { Giveaway, GiveawayEditOptions, GiveawayStartOptions } from "discord-giveaways";
import { CommandInteraction, MessageEmbed } from "discord.js";
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

    async cmd_edit(interaction: CommandInteraction) {
        const id = interaction.options.getString('giveaway_id', true);
        const duration = interaction.options.getString('duration', false);
        const winners = interaction.options.getInteger('winners', false);
        const prize = interaction.options.getString('prize', false);

        const options: GiveawayEditOptions = {};
        if(duration) options.addTime = ms(duration);
        if(winners) options.newWinnerCount = winners;
        if(prize) options.newPrize = prize;

        this.giveawayManager.edit(id, options)
        .then(giveaway => {
            interaction.reply({ content: `[Giveaway](<${giveaway.messageURL}>) is updated in your server.` });
        })
        .catch((err) => interaction.reply({ content: `Some unknown error occurs. Contact developer and show the error there.\n\n${err}`}));
    }

    async cmd_delete(interaction:CommandInteraction) {
        const id = interaction.options.getString('giveaway_id');
        this.giveawayManager.deleteGiveaway(id)
        .then(() => interaction.reply({ content: `Giveaway with id \`${id}\` successfully deleted from your server.`}))
    }

    async _have_problem(interaction: CommandInteraction) {
        const id = interaction.options.getString('giveaway_id', false);
        if(!interaction.guild) {
            interaction.reply({ content: `Command can only be executed inside a server.`, ephemeral: true });
            return true;
        }
        if(!id) return false;
        const giveaway = this.giveawayManager.giveaways.find(opt => opt.messageId === id && opt.guildId === interaction.guildId);
        if(!giveaway) {
            interaction.reply({ content: `Not able to find this giveaway in this server.`, ephemeral: true });
            return true;
        }
        return false;
    }

    async cmd_list(interaction: CommandInteraction) {
        const emojis = (id:string) => isNaN(id) ? id :this.client.emojis.cache.get(id)?.toString() 
                const giveaways = this.giveawayManager.giveaways.filter(opt => opt.guildId === interaction.guildId);
        let description = `**Giveaway(s)** in server **${interaction.guild?.name}**\n`;

        for (const giveaway of giveaways) {
            description += `[${emojis(giveaway.ended ? this.client.util.config.emojis.stop : this.client.util.config.emojis.ongoing)}] [\`${giveaway.messageId}\`](<${giveaway.messageURL}>): **${giveaway.prize}**\n`;
        }

        const embed = new MessageEmbed()
        .setColor('BLURPLE')
        .setDescription(description);

        return interaction.reply({ embeds: [embed] });
    }

    async cmd_reroll(interaction: CommandInteraction) {
        const id = interaction.options.getString('giveaway_id', true);
        this.giveawayManager.reroll(id)
        .then((members) => {
            const description = `New winners are: ${members.map(mem => mem.toString())}`;
            interaction.reply({ephemeral: true, content: description });
        })
        .catch(() => {
            interaction.reply({ephemeral: true, content: `No giveaway available at this message ID.`});
        })
    }

    async cmd_start(interaction: CommandInteraction) {
        if(!interaction.guild) return interaction.reply({ ephemeral: true, content: "Command can only be executed in a server"})
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

        if(extraData.message_requirement) {
            db.set(interaction.guild.id +'.'+'messageCount.guild', extraData.message_requirement);
        }

        const startOption: GiveawayStartOptions = {
            prize: interaction.options.getString('prize', true),
            winnerCount: interaction.options.getInteger('winners', true),
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
        .catch(err => interaction.reply({ content: `No such giveaway exist in this server.`, ephemeral: true }));

        return;
    }

    async exec(interaction: CommandInteraction) {
        return interaction.reply({ ephemeral: true, content: `Giveaway is still not completed. Sorry for the inconvenience.`})
    }
}

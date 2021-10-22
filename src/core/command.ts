import { SlashCommandBuilder, SlashCommandSubcommandGroupBuilder, SlashCommandSubcommandsOnlyBuilder } from "@discordjs/builders";

import { CommandInteraction, MessageActionRow, MessageButton, MessageComponentInteraction, PermissionResolvable } from "discord.js";
import { createHelp } from "../helper/util";
import { BotClient } from "./client";
import { PermissionManager } from "./permission";

const perms = ["REGULAR", "SUPPORTER", "MODERATOR", "ADMINISTRATOR", "OWNER"];

export class Command {
    [index: string]: any;
    public data: SlashCommandSubcommandsOnlyBuilder | SlashCommandSubcommandGroupBuilder | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
    public permit_level: 1 | 2 | 3 | 4 | 5;
    public _description?: string;
    public _channel: 1 | 2 | 3; // 1 - Text Channel only 2 - DM channel only 3 - Both;
    public _bot_permission: PermissionResolvable[];
    public _developer: boolean;
    public client: BotClient;
    public module?: string;
    public _descriptions: {
        [index: string]: string | undefined;
    }
    public _filepath: string;

    constructor(data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">, 
        client: BotClient,
        options: { 
            channel?: 1 | 2 | 3; 
            bot_permissions?: PermissionResolvable[]
            developer?:boolean;
            module?:string;
            level?: 1 | 2 | 3 | 4 | 5;
            description?: string;
            descriptions?: {
                [index:string]:string;
            }
        }) {
        // option.addSubcommand(cmd => cmd.setName('help').setDescription('Get help message for the command.'));
        this.data = data;
        this._channel = options.channel || 1;
        const initialPerms: PermissionResolvable[] = ["VIEW_CHANNEL", "SEND_MESSAGES", "EMBED_LINKS", "USE_APPLICATION_COMMANDS"];
        this._bot_permission = [...initialPerms, ...(options.bot_permissions ? options.bot_permissions : [])];
        this._developer = options.developer || false;
        this.client = client;
        this.module = options.module;
        this.permit_level = options.level || client.util.config.commandPermission[this.data.name] || 1;
        this._descriptions = options.descriptions || {};
        this._filepath = __filename;
        this._description = options.description;
    }

    async next(interaction: CommandInteraction) {
        return true;
    }
    
    async _have_problem(interaction: CommandInteraction) {
        return false;
    }

    async _check_bypass(interaction: CommandInteraction) {
        return false;
    }

    getPermitLevel(guildID?: string) {
        if(this._developer) return Infinity;
        if(!guildID) return this.permit_level
        const permit = new PermissionManager(this.client, guildID);
        return permit.get(this.data.name, "COMMAND", this.permit_level);
    }

    async help(interaction: CommandInteraction) {
        const embeds = this.client.util.createHelpEmbed(this.toJSON(), { 
            permit_level: this.getPermitLevel(interaction.guild?.id),
            description: this._description
        });

        if(embeds.length > 1) this.client.util.createMenu(interaction, embeds);
        else interaction.reply({ embeds: embeds });
    }

    async _help(interaction: CommandInteraction) {
        const permit_level = this.getPermitLevel(interaction.guild ? interaction.guild.id : undefined);

        let description_1: string = `${this.data.description}
        
        Permit Level: \`${permit_level === Infinity ? `Almighty`: perms[permit_level - 1]}\`\n\n`;
        if(this._description) description_1 += this._description + '\n';
        const description = createHelp(this.toJSON());
        
        const helpEmbed = this.client.util.embed('main')
        .setTitle(this.data.name)
        .setThumbnail(this.client.user?.displayAvatarURL() || '');

        if(this._description) {
            helpEmbed.setDescription(description_1)

            const filter = (i: MessageComponentInteraction) => i.user.id === interaction.user.id;
            
            const nextButton = new MessageButton().setCustomId('next').setStyle('PRIMARY').setLabel('Next');
            const prevButton = new MessageButton().setCustomId('prev').setLabel('Previous').setStyle('SECONDARY');
            const closeButton = new MessageButton().setCustomId('close').setLabel("X").setStyle('DANGER');

            const row = new MessageActionRow()
            .addComponents([
                prevButton,
                nextButton,
                closeButton
            ]);

            interaction.reply({ embeds: [helpEmbed], components: [row] });

            const collector = interaction.channel?.createMessageComponentCollector({ filter, time: 60000, componentType: 'BUTTON' });

            collector?.on('collect', async i => {
                if(i.customId === 'next') {
                    i.update({ embeds: [helpEmbed.setDescription(description)] })
                } else if(i.customId === 'prev') {
                    i.update({
                        embeds: [helpEmbed.setDescription(description_1)] });
                } else {
                    i.update({ components: [] });
                    collector.stop('CLOSED_BY_X');
                }
            });

        } else return interaction.reply({ embeds: [helpEmbed.setDescription(description_1 + description)] });
    }

    isAllowed(interaction: CommandInteraction) {
        const member = interaction.guild?.members.cache.get(this.client.user?.id);
        return member?.permissions.has(this._bot_permission);
    }

    async _check(interaction: CommandInteraction) {
        if(this._developer) return (this.client.isOwner(interaction.user.id));
        if(!interaction.guildId) return true;
        const guild_perms = new PermissionManager(interaction.client, interaction.guildId);
        return (await guild_perms.getMemberLevel(interaction.user.id)) >= this.getPermitLevel(interaction.guildId);
    }

    async exec(interaction: CommandInteraction) {
        interaction.reply({ content: "Command is still in progress. Please wait for some more time.", ephemeral: true });
    }

    reload() {
        return this.client.commandHandler.load(this._filepath);
    }
    toJSON() {
        return this.data.toJSON();
    }
}

// export class ExampleCommand extends Command {
//     constructor() {
//         super({
//             name: 'name',
//             description: 'description'
//         });
//     }

//     exec(interaction: CommandInteraction) {
//         interaction.reply({ content: `content` });
//     }
// }
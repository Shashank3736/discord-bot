import { SlashCommandBuilder, SlashCommandSubcommandGroupBuilder, SlashCommandSubcommandsOnlyBuilder } from "@discordjs/builders";

import { CommandInteraction, MessageEmbed, PermissionResolvable } from "discord.js";
import { BotClient } from "./client";
import { PermissionManager } from "./permission";

export class Command {
    [index: string]: any;
    public data: SlashCommandSubcommandsOnlyBuilder | SlashCommandSubcommandGroupBuilder;
    public permit_level: 1 | 2 | 3 | 4 | 5;
    public _description?: string;
    public _channel: 1 | 2 | 3; // 1 - Text Channel only 2 - DM channel only 3 - Both;
    public _bot_permission: PermissionResolvable[];
    public _developer: boolean;
    public client: BotClient;
    public module: string;

    constructor(option: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder, client: BotClient) {
        // option.addSubcommand(cmd => cmd.setName('help').setDescription('Get help message for the command.'));
        this.data = option;
        this.permit_level = 1;
        this._channel = 1;
        this._bot_permission = ["VIEW_CHANNEL", "SEND_MESSAGES", "EMBED_LINKS", "USE_APPLICATION_COMMANDS"];
        this._developer = false;
        this.client = client;
        this.module = 'General'
    }

    async _check_bypass(interaction: CommandInteraction) {
        return false
    }

    getPermitLevel(guildID?: string) {
        if(this._developer) return Infinity;
        if(!guildID) return this.permit_level
        const permit = new PermissionManager(this.client, guildID);
        return permit.get(this.data.name, "COMMAND", this.permit_level);
    }

    async help(interaction: CommandInteraction) {
        if(interaction.guildId) {
            this.permit_level = this.getPermitLevel(interaction.guildId);
        }

        let description: string = `${this.data.description}
        
        Permit Level: \`${interaction.guildId? this.getPermitLevel(interaction.guildId): this.getPermitLevel()}\`\n\n`;
        if(this._description) description += this._description;

        for (const subcmd of this.toJSON().options.filter(opt => opt.type === 1)) {
            description += `- \`${subcmd.name}\`: ${subcmd.description}\n`
        }

        for (const grp of this.toJSON().options.filter(opt => opt.type === 2)) {
            grp.
            description += `**${grp.name}**\n${grp.description}\n`
            for (const subcmd of grp.options.filter(opt => opt.type === 1)) {
                description += `- \`${subcmd.name}\`: ${subcmd.description}\n`
            }
        }
        const helpEmbed = new MessageEmbed()
        .setTitle(this.data.name)
        .setDescription(description)
        .setThumbnail(this.client.user?.displayAvatarURL())
        .setColor('BLURPLE');

        return interaction.reply({ embeds: [helpEmbed] });
    }

    isAllowed(interaction: CommandInteraction) {
        const member = interaction.guild?.members.cache.get(interaction.client.user?.id);
        return member?.permissions.has(this._bot_permission);
    }

    async _check(interaction: CommandInteraction) {
        if(this._developer) return (process.env.OWNER_ID === interaction.user.id);
        if(!interaction.guildId) return true;
        const guild_perms = new PermissionManager(interaction.client, interaction.guildId);
        return (await guild_perms.getMemberLevel(interaction.user.id)) >= this.getPermitLevel(interaction.guildId);
    }

    exec(interaction: CommandInteraction) {
        throw new Error("COMMAND ERROR: No execution function");
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
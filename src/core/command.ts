import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, Interaction } from "discord.js";

interface constructorOption {
    name: string,
    description: string,
    ownerOnly?: Boolean
}

export class Command {
    public data: SlashCommandBuilder;

    constructor(option: constructorOption) {
        if(!option.ownerOnly) option.ownerOnly = false;
        this.data = new SlashCommandBuilder()
        .setName(option.name)
        .setDescription(option.description)
        .setDefaultPermission(!option.ownerOnly);
    }

    exec(interaction: Interaction) {
        throw new Error("COMMAND ERROR: No execution function");
    }

    toJSON(): object {
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
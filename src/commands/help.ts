import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { BotClient } from "../core/client";
import { Command } from "../core/command";
const data = new SlashCommandBuilder()
.setName('help')
.setDescription('Get help of a command.')
.addStringOption(opt => opt.setName('command').setDescription('Command you want help for.'))
.addBooleanOption(opt => opt.setName('hide').setDescription('You want to hide help message or not.'))
module.exports = class HelpCommand extends Command{
    constructor(client: BotClient) {
        super(data, client);
    }

    exec(interaction: CommandInteraction) {
        const command = interaction.options.getString('command', false);
        const hide = interaction.options.getBoolean('hide', false) || false;

        if(command) {
            const cmd = interaction.client.commands.get(command);
            if(!cmd) return interaction.reply({ ephemeral: true, content: `ERROR: COMMAND NOT AVAILABLE.`});
            else cmd.help(interaction);
        } else {
            const embed = new MessageEmbed()
            .setTitle('Help')
            .setThumbnail(interaction.client.user?.displayAvatarURL())
            .setColor("BLURPLE")

            let description = "";
            for (const cmd of interaction.client.commands.map(cmdData => cmdData.toJSON())) {
                description += `\`${cmd.name}\`: ${cmd.description}\n`;
            }
            embed.setDescription(description);
        }
    }
}
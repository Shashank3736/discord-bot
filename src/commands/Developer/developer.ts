import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, Options } from "discord.js";
import { BotClient } from "../../core/client";
import { Command } from "../../core/command";
import { PermissionManager } from "../../core/permission";
import { clean, hastebin } from "../../helper/util";
const db = require('quick.db');

const evalSlashCommand = new SlashCommandBuilder()
.setName('developer')
.setDescription('Commands which can only be used by bot developers.')
.addSubcommand(cmd => cmd.setName('eval')
    .setDescription('Evaluate code using commands.')
    .addStringOption(option => option.setName('code').setDescription('Write your code you want the system to run!').setRequired(true)));
module.exports = class DeveloperCommand extends Command {
    constructor(client: BotClient) {
        super(evalSlashCommand, client);
        this._developer = true;
        this._bot_permission.push("ADMINISTRATOR");
        this.module = 'Developer';
    }

    async cmd_eval(interaction: CommandInteraction) {
        const code = interaction.options.getString('code', true);

        const db = require('quick.db');
        const { REST } = require('@discordjs/rest');
        const rest = new REST({ version: 9 }).setToken(process.env.TOKEN);
        const { Routes } = require('discord-api-types/v9');

        try {
            // eslint-disable-next-line no-eval
            const evaled = eval(code);
            const cleantxt = await clean(evaled);
            const hastelink = await hastebin(cleantxt);
            console.log(hastelink);
            if (cleantxt.length > 800) interaction.reply({ content: hastelink, ephemeral: true });
            else interaction.reply({ content: `Result:\n${cleantxt}`, ephemeral: true });
          } catch (error) {
            console.log(error);
            interaction.reply({ content: 'Some error occurs!', ephemeral: true });
        }
    }
}

import { CommandInteraction } from "discord.js";
import { Command } from "../../core/command";

class PingCommand extends Command {
    constructor() {
        super({
            name: 'ping',
            description: 'Check the bot ping.'
        });
    }

    exec(interaction: CommandInteraction) {
        interaction.reply({ content: `Bot ping ${interaction.client.ws.ping}ms!` });
    }
};

module.exports = PingCommand;

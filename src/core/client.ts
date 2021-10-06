import { Client, Intents, Collection } from "discord.js";
import recursiveReadDir = require("recursive-readdir");
import { addCommands } from "../helper/sync-command";
import { Command } from "./command";

class BotClient extends Client {
    public commands: Collection<string, Command>;

    constructor() {
        super({
            intents: [
                Intents.FLAGS.GUILDS,
                Intents.FLAGS.GUILD_MEMBERS, 
                Intents.FLAGS.DIRECT_MESSAGES, 
                Intents.FLAGS.DIRECT_MESSAGE_REACTIONS
            ]
        });

        this.commands = new Collection();
        const commands: object[] = [];
        recursiveReadDir('src/commands/', ['*.ts', '*.js'], (_error, files) => {
            files.forEach(file => {
                if(!file.endsWith('.js') || !file.endsWith('.ts')) return;
                const BotCommand: Command  = require(file);
                const command = new BotCommand();
                this.commands.set(command.data.name, command);
                commands.push(command.toJSON());
            });
        });
        addCommands(process.env.CLIENT_ID, commands);
    }

    async start() {
        await this.login(process.env.TOKEN);
    }
}

module.exports = BotClient;

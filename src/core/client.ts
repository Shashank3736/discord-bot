import { Client, Intents, Collection } from "discord.js";
import recursiveReadDir = require("recursive-readdir");
import { Command } from "./command";

export class BotClient extends Client {
    public commands: Collection<string, Command>;
    public options: any;

    constructor() {
        super({
            intents: [
                Intents.FLAGS.GUILDS,
                Intents.FLAGS.GUILD_MEMBERS, 
                Intents.FLAGS.DIRECT_MESSAGES, 
                Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
                Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
                Intents.FLAGS.GUILD_MESSAGES
            ]
        });

        this.commands = new Collection();
    }

    async start() {
        await this.login(process.env.TOKEN);
    }
}

import { Client, Intents, Collection } from "discord.js";
import { join } from "path";
import recursiveReadDir = require("recursive-readdir");
import { ClientUtil } from "../helper/ClientUtil";
import { Command } from "./command";
import CommandHandler from "./CommandHandler";

export class BotClient extends Client {
    public commands: Collection<string, Command>;
    public options: any;
    public util: ClientUtil;
    public commandHandler: CommandHandler;

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
        this.util = new ClientUtil(this);
        this.commandHandler = new CommandHandler(this, join(__dirname, '../commands'));
    }

    async start() {
        this.commandHandler.loadAll();
        await this.login(process.env.TOKEN);
    }
}

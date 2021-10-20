import { Client, Intents, Collection } from "discord.js";
import { join } from "path";
import { ClientUtil } from "../helper/ClientUtil";
import { readdirRecursive } from "../helper/util";
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

        const events = readdirRecursive(join(__dirname, '../events'));

        for (const event of events) {
            const eventFile = require(event);

            this.on(eventFile.name, eventFile.exec.bind(null, this));
        }
    }

    async start() {
        this.commandHandler.loadAll();
        await this.login(process.env.TOKEN);
    }
}

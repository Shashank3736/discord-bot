import { Client, Collection } from "discord.js";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { ClientOption } from "../config";
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
        super(ClientOption);

        this.commands = new Collection();
        this.util = new ClientUtil(this);
        this.commandHandler = new CommandHandler(this, join(__dirname, '../commands'));

        const events = readdirRecursive(join(__dirname, '../events'));

        for (const event of events) {
            const eventFile = require(event);

            console.log(`👉 Loading events: ${eventFile.name}`);

            this.on(eventFile.name, eventFile.exec.bind(null, this));
        }
    }

    isOwner(id: string) {
        const ownerID: string[] = this.util.db.get('developers') || [];
        return (this.application?.owner?.id === id) || (ownerID.includes(id));
    }

    async start() {
        this.commandHandler.loadAll();
        await this.login(process.env.TOKEN);
        if(!this.application?.owner) this.application?.fetch();

        if(!process.env.CLIENT_ID) {
            const data = readFileSync('.env', 'utf8') + `\nCLIENT_ID=${this.user?.id}`;

            writeFileSync('.env', data);
        }
    }
}

import { join } from "path";
import { BotClient } from "../../core/client";
import { GiveawayHandler } from "./manager";

module.exports = async (client: BotClient) => {
    const manager = new GiveawayHandler(client);
    client.options.giveawayManager = manager;

    client.commandHandler.load(join(__dirname, 'command'));

    require('./events/giveawayReactionAdded')(manager);
    require('./events/messageCreate')(client);
}
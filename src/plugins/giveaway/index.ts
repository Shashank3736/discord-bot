import { BotClient } from "../../core/client";
import { GiveawayHandler } from "./manager";

module.exports = async (client: BotClient) => {
    const manager = new GiveawayHandler(client);
    client.options.giveawayManager = manager;
}
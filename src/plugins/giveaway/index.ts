import { BotClient } from "../../core/client";
import { GiveawayCommand } from "./command";
import { GiveawayHandler } from "./manager";

module.exports = async (client: BotClient) => {
    const manager = new GiveawayHandler(client);
    client.options.giveawayManager = manager;

    const command = new GiveawayCommand(client, manager);
    client.commands.set(command.data.name, command);
}
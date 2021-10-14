import { GiveawayHandler } from "../manager";

module.exports = async (manager: GiveawayHandler) => {
    manager.on('giveawayReactionAdded', async (giveaway, member) => {
        //check requirements
        const isAllowed = await manager.isMemberAllowed(member, giveaway.options.messageId);
    });
}
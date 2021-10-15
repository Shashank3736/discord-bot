import { GiveawayHandler } from "../manager";

module.exports = async (manager: GiveawayHandler) => {
    manager.on('giveawayReactionAdded', async (giveaway, member, reaction) => {
        console.log("Giveaway reaction added!")
        if(member.id === manager.client.user?.id) return;
        //check requirements
        const isAllowed = await manager.isMemberAllowed(member, giveaway.options.messageId);
        if(!isAllowed) {
            const data = giveaway.options.extraData
            let content = 'You are not allowed to participate in this giveaway.\n';
            if(data.role_requirement) { 
                const role = member.guild.roles.cache.get(data.role_requirement);
                content += `**Must have role:** \`${role?.name}\`.\n`
            }
            if(data.message_requirement) content += `**Must send ${data.message_requirement} messages.\n`
            if(data.server_requirement) content += `Must Join [${data.server_requirement.name}](<${data.server_requirement.invite}>)`;
            await reaction.users.remove(member.user);
            member.send({ content: content }).catch(err => err);
        }
    });
}
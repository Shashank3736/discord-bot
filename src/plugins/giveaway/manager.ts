import { GiveawaysManager } from "discord-giveaways";
import { GuildMember } from "discord.js";
import { UpdateWithAggregationPipeline, UpdateQuery } from "mongoose";
import { table } from "quick.db";
import { giveawayModel } from "./model";

export class GiveawayHandler extends GiveawaysManager {
    async isMemberAllowed(member: GuildMember, giveawayID: string): Promise<boolean> {
        //get giveaway
        const giveaway = this.giveaways.find(giv => giv.options.messageId === giveawayID);
        if(!giveaway) throw new Error("Giveaway is not available in database.");
        //check data available or not
        if(!giveaway.options.extraData) return true;
        const data = giveaway.options.extraData;
        //check role requirement
        if(data.role_requirement && !member.roles.cache.has(data.role_requirement)) return false;
        if(data.server_requirement && data.server_requirement.id) {
            const guild = this.client.guilds.cache.get(data.server_requirement.id) || await this.client.guilds.fetch(data.server_requirement.id);
            if(!guild.members.cache.has(member.id)) return false;
        }
        if(data.message_requirement) {
            const db = new table('giveaway');
            const msgCount = db.get(giveaway.options.guildId + '.messageCount.'+member.id);
            if(!msgCount || msgCount < data.message_requirement) return false;
        }
        return true;
    }
    // This function is called when the manager needs to get all giveaways which are stored in the database.
    async getAllGiveaways() {
        // Get all giveaways from the database. We fetch all documents by passing an empty condition.
        return await giveawayModel.find().lean().exec();
    }

    // This function is called when a giveaway needs to be saved in the database.
    async saveGiveaway(messageId: string, giveawayData: any) {
        // Add the new giveaway to the database
        await giveawayModel.create(giveawayData);
        // Don't forget to return something!
        return true;
    }

    // This function is called when a giveaway needs to be edited in the database.
    async editGiveaway(messageId: any, giveawayData: UpdateWithAggregationPipeline | UpdateQuery<any> | undefined) {
        // Find by messageId and update it
        await giveawayModel.updateOne({ messageId }, giveawayData, { omitUndefined: true }).exec();
        // Don't forget to return something!
        return true;
    }

    // This function is called when a giveaway needs to be deleted from the database.
    async deleteGiveaway(messageId: any) {
        // Find by messageId and delete it
        await giveawayModel.deleteOne({ messageId }).exec();
        // Don't forget to return something!
        return true;
    }
}
import { Client } from "discord.js";
import { table } from "quick.db";

module.exports = (client: Client) => {
    client.on('messageCreate', message => {
        if(!message.guild) return;
        const db = new table('giveaway');
        const msgCount: number = db.get(`${message.guild.id}.messageCount.guild`);
        if(msgCount) db.add(`${message.guild.id}.messageCount.${message.author.id}`, 1);
    });
}
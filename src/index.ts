require('dotenv').config();
import { BotClient } from './core/client';
import { PermissionManager } from './core/permission'
import { connect, connection } from 'mongoose';
import { fillEnv } from './helper/util';
//check if .env exist or not
if(!process.env.TOKEN) fillEnv();

//client
const client = new BotClient();
//mongoose
if(process.env.MONGODB_URI) {
    connect(process.env.MONGODB_URI);
    const mongoDB = connection;
    mongoDB.on('error', console.error.bind(console, 'Connection error:'));
    mongoDB.once('open', () => {
        console.log("Connected to MongoDB");
    });
}

require('../plugins/index')(client);

client.on('guildCreate', guild => {
    const guild_perms = new PermissionManager(client, guild.id);
    guild_perms.set(guild.ownerId, "USER", 5);
});

//login
client.start()

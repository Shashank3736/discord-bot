require('dotenv').config()
import recursive = require('recursive-readdir');
import { Client, Intents } from "discord.js";
import { Collection } from "@discordjs/collection";
//client
const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS, 
        Intents.FLAGS.GUILD_MEMBERS, 
        Intents.FLAGS.DIRECT_MESSAGES, 
        Intents.FLAGS.DIRECT_MESSAGE_REACTIONS]
});
client.commands = new Collection();
//load commands
recursive('commands/', function(_error, files) {
    if(_error) console.error(_error);
    files.forEach(file => {
        const command = 
    })
})
//login
client.login()

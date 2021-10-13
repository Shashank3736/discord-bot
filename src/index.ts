require('dotenv').config();
import { addGlobalCommands, addGuildCommands } from './helper/addSlashCommand';
import { BotClient } from './core/client';
import { PermissionManager } from './core/permission'
import { clean, log } from './helper/util';
import { connect, connection } from 'mongoose';
import { readdir, statSync } from 'fs';
import { join } from 'path';
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

require('./plugins/index')(client);
readdir(join(__dirname, 'commands'), (_err, files) => {
    files = files.filter(file => file.endsWith('.js') || file.endsWith('.ts'));
    for (const file of files) {
        log('./commands/'+file);
        const commandFile = require('./commands/'+file);
        const command = new commandFile(client);
        client.commands.set(command.data.name, command);
    }
});

readdir(join(__dirname, 'events'), (_err, files) => {
    files = files.filter((file) => statSync('./events/'+file).isFile());

    for (const file of files) {
        log('./events/'+file);
        const eventFile = require('./events/'+file);
        log(`Event loaded: ${file.split('.')[0]}`);

        client.on(file.split('.')[0], eventFile.bind(null, client))
    }
});
//load commands
client.once('ready', () => {
    console.log("Client is ready!");
    // const commands = client.commands.filter(cmd => !cmd._developer).map(cmd => cmd.toJSON());
    // const developerCommand = client.commands.filter(cmd => cmd._developer).map(cmd => cmd.toJSON());
    // addGlobalCommands(commands);
    // addGuildCommands(developerCommand);
});

client.on('guildCreate', guild => {
    const guild_perms = new PermissionManager(client, guild.id);
    guild_perms.set(guild.ownerId, "USER", 5);
});

//login
client.start()

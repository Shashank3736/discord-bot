require('dotenv').config();
import { addGlobalCommands, addGuildCommands } from './helper/addSlashCommand';
import { BotClient } from './core/client';
import { PermissionManager } from './core/permission'
import { clean, log } from './helper/util';
import { connect, connection } from 'mongoose';
import { readdir } from 'fs';
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

client.on('interactionCreate', async interaction => {
    //check interaction is command interaction or not.
    if(!interaction.isCommand()) return;
    //
    const command = client.commands.get(interaction.commandName);
    if(!command) return interaction.reply( { content: "No such commands!" });

    if(command._channel === 2 && interaction.channel?.type !== "DM") return interaction.reply({ content: "This command can only be executed in bot DM."});
    if(command._channel === 1 && interaction.channel?.type !== "GUILD_TEXT") return interaction.reply({ content: "This command can only be executed in discord server."});

    if(interaction.guild) interaction.permitManager = new PermissionManager(interaction.client, interaction.guild.id);

    if(!(await command._check(interaction))) return interaction.reply({ ephemeral: true, content: "You are not allowed to run this command."});
    if(!command.isAllowed(interaction)) return interaction.reply({ ephemeral: true, content: "Bot do not have sufficient permission to run this command. Contact server admins for solution."});
    const subcmd = interaction.options.getSubcommand(false)
    const subCmdGrp = interaction.options.getSubcommandGroup(false);
    if(subcmd) {
        if(subcmd === 'help') return command.help(interaction);
        const cmd_fun_name = (subCmdGrp? subCmdGrp : 'cmd') + '_' + subcmd;
        command[cmd_fun_name](interaction).catch(async (err: any) => interaction.reply({ content: `Error: ${await clean(err)}`}));
    } else command.exec(interaction);
    
    return;
})
//login
client.start()

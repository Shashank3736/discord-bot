import { ButtonInteraction, CommandInteraction, Interaction } from "discord.js";
import { BotClient } from "../../core/client";
import { PermissionManager } from "../../core/permission";

async function commandCreate(client: BotClient, interaction: CommandInteraction) {
    const command = client.commands.get(interaction.commandName);

    if(!command) return interaction.reply( { content: "No such commands!" });
    //check dm or guild
    if(command._channel === 2 && interaction.channel?.type !== "DM") return interaction.reply({ content: "This command can only be executed in bot DM."});
    if(command._channel === 1 && interaction.channel?.type !== "GUILD_TEXT") return interaction.reply({ content: "This command can only be executed in discord server."});
    //check if guild then setup permitManager
    if(interaction.guild) interaction.permitManager = new PermissionManager(interaction.client, interaction.guild.id);
    if(interaction.guild && command.getPermitLevel(interaction.guild.id) === -1) return interaction.reply({ ephemeral: true,
    content: `Command is disabled in your server.`});
    //check is bot or user allowed to run the command or not
    if(!(await command._check(interaction)) && !(await command._check_bypass(interaction))) return interaction.reply({ ephemeral: true, content: "You are not allowed to run this command."});
    if(!command.isAllowed(interaction)) return interaction.reply({ ephemeral: true, content: "Bot do not have sufficient permission to run this command. Contact server admins for solution."});
    if((await command._have_problem(interaction))) return;
    //start perparing for command execution
    const subcmd = interaction.options.getSubcommand(false)
    const subCmdGrp = interaction.options.getSubcommandGroup(false);
    if(subcmd) {
        if(subcmd === 'help') return command.help(interaction);
        const cmd_fun_name = (subCmdGrp? subCmdGrp : 'cmd') + '_' + subcmd;
        if(!command[cmd_fun_name]) command.exec(interaction);
        else command[cmd_fun_name](interaction);
    } 
    else command.exec(interaction).catch(err => interaction.reply({ ephemeral: true, content: `Something went wrong?\n\n ${err}` }));

    return await command.next(interaction);
}

async function buttonCreate(interaction: ButtonInteraction) {
    
}

export async function exec(client: BotClient, interaction: Interaction) {
    if(interaction.isCommand()) commandCreate(client, interaction);
    else if(interaction.isButton()) {}
    else if(interaction.isContextMenu()) {}
    else if(interaction.isMessageComponent()) {}
    else if(interaction.isSelectMenu()) {}
}

export const name = 'interactionCreate';
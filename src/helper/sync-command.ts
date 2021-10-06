import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";

const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

export async function addCommands(clientID: string, commands: object[]) {
    try {
        console.log('Starting refreshing (/) commands!');
        await rest.put(Routes.applicationCommands(clientID), { body: commands});
        console.log('Completely reloaded (/) commands!');
    } catch (error) {
        console.error(__filename + ' - ' + error);
    }
}

export async function addGuildCommands(clientID: string, guildID: string, commands: object[]) {
    try {
		console.log('Started refreshing application (/) commands.');

		await rest.put(
			Routes.applicationGuildCommands(clientID, guildID),
			{ body: commands },
		);

		console.log('Successfully reloaded application (/) commands.');
	} catch (error) {
		console.error(__filename +  ' - ' + error);
	}
}
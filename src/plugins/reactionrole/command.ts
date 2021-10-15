import { SlashCommandBuilder } from "@discordjs/builders";

const data = new SlashCommandBuilder()
.setName('reactionrole')
.setDescription('Create embed which will allow user to get role by reacting.')
.addSubcommand()
require('dotenv').config()

const { addGlobalCommands, addGuildCommands } = require('./dist/helper/addSlashCommand');
const { commands, developerCommands } = require('./commands.json');

addGuildCommands(developerCommands);
addGlobalCommands(commands);
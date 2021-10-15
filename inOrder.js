const { writeFileSync } = require('fs');
let { commands, developerCommands } = require('./commands.json');
function sort(a, b) {
    if (a.firstname < b.firstname) {
      return -1;
    }
    if (a.firstname > b.firstname) {
      return 1;
    }
    return 0;
  }

if(commands.length > 1) commands = commands.sort(sort);
if(developerCommands.length > 1) developerCommands = developerCommands.sort(sort);

const data = {
    commands: commands,
    developerCommands: developerCommands
};

writeFileSync('commands.json', JSON.stringify(data));
import { Message } from "discord.js";
import { readFileSync, writeFileSync } from "fs";
import { BotClient } from "../../core/client"
import { exec as runCommand} from "child_process"

export const name = 'messageCreate';

export async function exec(client: BotClient, message: Message) {
  if(message.guild) return;
  if(!client.isOwner(message.author.id)) return;

  if(message.content == '.env') {
    message.reply({ content: 'Type your .env value here in format. Note its recommended to not set TOKEN or MONGODB_URI from here.\n\n{{CONFIG}}={{VALUE}}'});
    const collector = message.channel.createMessageCollector();

    collector.on('collect', m => {
      let data = readFileSync('.env', 'utf8');
      const envVariables = m.content.match(/([A-Z_])+=[^\s\n]+/g);
      if(!envVariables || envVariables.length === 0) {
        m.reply({ content: `Incorrect format. Try again!`});
        collector.stop('INCORRECT_FORMAT');
      }
      else {
        envVariables.forEach(variable => data += '\n' + variable);
        writeFileSync('.env', data);
        m.reply({ content: `Done!` });
        collector.stop('COMPLETE');
      };
    });
  } else if (message.content == '.deploy') {
    runCommand('npm run deploy', (err, stdout, stdin) => {
      if(err) {
        message.reply({ content: `Error: ${err}` });
      } else {
        message.reply({ content: `stdout: ${stdout}
        stdin: ${stdin}`});
      };
    });
  }
}
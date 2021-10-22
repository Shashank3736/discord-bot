import { readdirSync, statSync, writeFileSync } from "fs";
import { join } from "path";
import { createInterface } from "readline";

const fetch = require('node-fetch');

export function fillEnv() {
  let data = '';

  const rl = createInterface({
      input: process.stdin,
      output: process.stdout
  });

  rl.question('TOKEN > ', ans => data+= `TOKEN=${ans}\n`);
  rl.question('Main server ID > ', ans => data += `MAIN_SERVER_ID=${ans}\n`);
  rl.question('MongoDB URI > ', ans => data += `MONGODB_URI=${ans}\n`);

  writeFileSync('.env', data);
}

export async function clean (text: any): Promise<string> {
    if (text && text.constructor.name === 'Promise') text = await text
    if (typeof text !== 'string') text = require('util').inspect(text, { depth: 1 })
  
    text = text.replace(/`/g, '`' + String.fromCharCode(8203))
      .replace(/@/g, '@' + String.fromCharCode(8203))
      .replace(process.env.TOKEN, '<TOKEN>');
  
    return text;
}

export function hastebin (input: any, extension?: string): Promise<string> {
    return new Promise(function (resolve, reject) {
      // eslint-disable-next-line prefer-promise-reject-errors
      if (!input) reject('[Error] Missing Input')
      fetch('https://hastebin.com/documents', {
        method: 'POST',
        body: input
      }).then(res => res.json())
        .then(body => {
          resolve('https://hastebin.com/' + body.key + ((extension) ? '.' + extension : ''))
        }).catch(e => reject(e))
    });
}

export function log(message: any) {
  if(process.env.DEBUG === '1') console.log(message);
};

export function createHelp (cmdJSON: any) {
  const argType = ['', '', '', 'STRING', 'INTEGER', 'BOOLEAN', 'USER', 'CHANNEL', 'ROLE', 'MENTIONABLE', 'NUMBER']
  let description = `**${cmdJSON.name}**: ${cmdJSON.description}\n\n`
  if(cmdJSON.options.filter(opt => opt.type === 1).length > 0) description += '**Sub-command**\n'
  for (const subcmd of cmdJSON.options.filter(opt => opt.type === 1)) {
    description += `\`${subcmd.name}\`: ${subcmd.description}\n`
  }
  if(cmdJSON.options.filter(opt => opt.type === 2).length > 0) description += '\n**Subcommand Group**'
  for (const grp of cmdJSON.options.filter(opt => opt.type === 2)) {
    description += `\n**${grp.name}**\n${grp.description}\n`
    for (const subcmd of grp.options.filter(opt => opt.type === 1)) {
      description += `- \`${subcmd.name}\`: ${subcmd.description}\n`
    }
  }
  const args: [] = cmdJSON.options.filter(opt => opt.type > 2)
  if(args.length > 0) {
    description += "**Arguments**:\n";

    for (const arg of args) {
      description += `Name: ${arg.name}
      Description: ${arg.description}
      Required: ${arg.required ? '`Yes`' : '`No`'}
      Type: \`${argType[arg.type]}\`\n\n`
    }
  }

  return description;
}

export function readdirRecursive(directory: string) {
  const result = [];

  (function read(dir) {
      const files = readdirSync(dir);

      for (const file of files) {
          const filepath = join(dir, file);

          if (statSync(filepath).isDirectory()) {
              read(filepath);
          } else {
              result.push(filepath);
          }
      }
  }(directory));

  return result;
}

import { writeFileSync } from "fs";
import { BotClient } from "../../core/client";

export const name = 'ready';

export async function exec(client: BotClient) {
  console.log("Client is ready!");
  const commands = client.commands.filter(cmd => !cmd._developer).map(cmd => cmd.toJSON());
  const developerCommand = client.commands.filter(cmd => cmd._developer).map(cmd => cmd.toJSON());
  const dataJSON = {
      commands: commands,
      developerCommands: developerCommand
  };
  const data = JSON.stringify(dataJSON, undefined, '\t');
  writeFileSync('commands.json', data);
  //set status
  client.user?.setStatus(client.util.config.presence.status);
  //set activity
  const activity = client.util.config.presence.activity
  if(activity) client.user?.setActivity({
    name: activity.name,
    type: activity.type,
    url: activity.url || client.util.config.link.streamURL
  });
}
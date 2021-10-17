import EventEmitter from "events";
import { readdirRecursive } from "../helper/util";
import { BotClient } from "./client";
import { Command } from "./command";

export default class CommandHandler extends EventEmitter {
  public client: BotClient;
  public directory: string;

  constructor(client: BotClient, directory: string) {
    super();
    this.client = client;
    this.directory = directory
  }

  load(filepath: string) {
    if(filepath.endsWith('.temp.ts') || filepath.endsWith('.temp.js')) return;
    const command = require(filepath);
    const cmd: Command = new command(this.client);

    return this.client.commands.set(cmd.data.name, cmd);
  }

  loadAll(directory: string = this.directory) {
    const filePath = readdirRecursive(directory);

    for (const commandPath of filePath) {
      this.load(commandPath);
    }
  }
}
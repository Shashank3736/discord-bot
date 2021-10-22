import EventEmitter from "events";
import { log, readdirRecursive } from "../helper/util";
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
    const category = filepath.split('\\').reverse()[1]
    const command = require(filepath);
    const cmd: Command = new command(this.client);

    cmd._filepath = filepath;
    if(!cmd.module) cmd.module = category;
    log(`${cmd.module.toUpperCase()}/${cmd.data.name}:${cmd._filepath}`);

    console.log(`👉 Loaded command: ${cmd.data.name}`);
    return this.client.commands.set(cmd.data.name, cmd);
  }

  loadAll(directory: string = this.directory) {
    const filePath = readdirRecursive(directory);

    for (const commandPath of filePath) {
      this.load(commandPath);
    }
  }
}
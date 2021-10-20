import { GuildModel } from "../Models/perms";
import { BotClient } from "./client";

interface permission {
  guildId: string;
  permission: [
    {
      id: string;
      type: 'USER' | 'ROLE' | 'COMMAND';
      level: 0 | 1 | 2 | 3 | 4 | 5;
    }
  ]
}

export default class PermissionMongoManager {
  public client: BotClient;
  public permissions: any | permission;
  public guildId: string;

  constructor(client: BotClient, guildId: string) {
    this.client = client;
    this.guildId = guildId;
    GuildModel.find({ guildId: guildId },  (err, docs) => {
      if (err){
        console.log(err);
      } else {
        this.permissions = docs;
      }
    });
  }

  getAllPermission() {
    this.permissions = GuildModel.find({ guildId: this.guildId });
    return true;
  }
}
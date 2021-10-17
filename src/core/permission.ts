import { Client } from "discord.js";
// import { BotClient } from "./client";

const db = require('quick.db');
export interface PermitLevel {
  id: string;
  type: 'USER' | 'ROLE' | 'COMMAND';
  permitLevel: 1 | 2 | 3 | 4 | 5 | -1;
}

export class PermissionManager {
  public client: Client;
  public guildID: string;
  public permission: PermitLevel[];

  constructor (client: Client, guildID: string) {
    this.client = client
    this.guildID = guildID
    this.permission = db.get(`${this.guildID}.permission`) || [];
  }

  set (id: string, type: 'USER' | 'ROLE' | 'COMMAND', permitLevel: 1 | 2 | 3 | 4 | 5 | -1) {
    const perms: PermitLevel[] = [
      {
        id: id,
        type: type,
        permitLevel: permitLevel
      }
    ];

    this.permission = perms;
    return db.set(`${this.guildID}.permission`, perms);
  }

  push (id: string, type: 'USER' | 'ROLE' | 'COMMAND', permitLevel: 1 | 2 | 3 | 4 | 5 | -1) {
    const newPerms: PermitLevel = { id, type, permitLevel }
    this.permission = this.permission.filter(perm => perm.id !== id && perm.type !== type)
    this.permission.push(newPerms)

    return db.set(`${this.guildID}.permission`, this.permission)
  }

  get (id: string, type: 'USER' | 'ROLE' | 'COMMAND', fallback: 1 | 2 | 3 | 4 | 5 = 1) {
    const target = this.permission.find(permit => permit.id === id && permit.type === type);
    
    return target ? target.permitLevel : fallback;
  }

  remove (id: string, type: 'USER' | 'ROLE' | 'COMMAND') {
    this.permission = this.permission.filter(permit => permit.id !== id && permit.type !== type);
    return db.set(`${this.guildID}.permission`, this.permission);
  }

  async getMemberLevel (id: string) {
    const guild = this.client.guilds.cache.get(this.guildID);
    if(!guild) throw new Error("NO GUILD IN CACHE FETCH IT OR CHEKCK ID: " + id);
    
    const member = guild.members.cache.get(id) || await guild.members.fetch(id);

    if(guild.ownerId === member.id) return 5;
    const roles = member.roles.cache.map(role => this.get(role.id, "ROLE", 1));
    roles.push(1);
    const roleLvl = Math.max(...roles);

    const memberLvl = this.get(member.id, "USER", 1);

    return roleLvl > memberLvl ? roleLvl : memberLvl;
  }

  reset() {
    this.permission = [];
    return db.set(`${this.guildID}.permission`, []);
  }
}

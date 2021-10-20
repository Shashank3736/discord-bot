import { model, Schema } from "mongoose";

const guildSchema = new Schema({
  guildId: String,
  permission: [{
    id: String,
    type: String,
    level: Number
  }]
}, { id: false });

export const GuildModel = model('permit_system', guildSchema);
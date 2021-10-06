import { Schema } from "mongoose";
export const guildSchema = new Schema({
    id: String,
    permission: [{ id: String, type: "ROLE" || "USER" || "COMMAND", status: Boolean }]
});

export const memberSchema = new Schema({
    id: String,
    guildID: String,
    verified: Boolean
});

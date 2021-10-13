import { Collection } from "discord.js";
import { Command } from "../src/core/command"

declare module "discord.js" {
    export interface Client {
        commands: Collection<string, Command>
    }
}
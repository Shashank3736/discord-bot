import { readdir, statSync } from "fs"
import { join } from "path";
import { BotClient } from "../src/core/client"

module.exports = (client: BotClient) => {
    readdir(join(__dirname), ( _err, files) => {
        try {
            files = files.filter(file => statSync(join(__dirname, file)).isDirectory());
            for (const file of files) {
                require(`./${file}/index`)(client);
                console.log(`👉 Loaded plugin `+file);
            } 
        } catch (error) {
            console.error(error);
        }
    });
}
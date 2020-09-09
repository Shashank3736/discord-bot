const { Listener } = require("discord-akairo");

class ReadyEvent extends Listener{
    constructor() {
        super("discord_client_ready", {
            event: "ready",
            emitter: "client"
        });
    }
    exec() {
        
    }
}
module.exports = ReadyEvent;
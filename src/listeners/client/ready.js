const { Listener } = require("discord-akairo");

class ReadyEvent extends Listener{
    constructor() {
        super("discord_client_ready", {
            event: "ready",
            emitter: "client"
        });
    }
    exec() {
        this.client.Logger.info({
            label: "LOGGED IN", 
            message: `${this.client.user.tag} is now online.`
        });
    }
}
module.exports = ReadyEvent;
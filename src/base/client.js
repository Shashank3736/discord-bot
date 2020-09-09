const { AkairoClient, CommandHandler, ListenerHandler, InhibitorHandler } = require("discord-akairo");
const message = require("../config/message");
const path = require("path");
const { lang, prefix, owners } = require("../config/default");
const { start } = require("repl");

module.exports = class MyClient extends AkairoClient{
    constructor() {
        super({
            ownerID: owners
        });

        this.commandHandler = new CommandHandler(this, {
            handleEdits: true,
            commandUtil: true,
            argumentDefaults: {
                prompt: {
                    retries: 5,
                    time: 2*60*1000,
                    cancel: msg => message[msg.guild.get("lang", lang)].cancel_prompt,
                    modifyStart: (msg, text) => text + message[msg.guild.get("lang", lang)].modify_start,
                    timeout: msg => message[msg.guild.get("lang", lang)].timeout,
                    modifyRetry: (msg, text) => message[msg.guild.get("lang", lang)].modify_start
                }
            },
            directory: path.join(__dirname, '..', 'commands/'),
            prefix: msg => msg.guild.get("prefix", prefix),
            automateCategories: true
        });

        this.listenerHandler = new ListenerHandler(this, {
            directory: path.join(__dirname, '..', 'listeners/'),
        });

        this.inhibitorHandler = new InhibitorHandler(this, {
            directory: path.join(__dirname, "..", "inhibitors/")
        });

        this.listenerHandler.setEmitters({
            commandHandler: this.commandHandler,
            inhibitorHandler: this.inhibitorHandler,
            listenerHandler: this.listenerHandler,
            process: process
        });

        this.Logger = require('./logger');
    }

    start() {
        //using listener handler in command handler
        this.Logger.debug({label: "Client", message: "Using listener handlers for command handler"});
        this.commandHandler.useListenerHandler(this.listenerHandler);

        //using inhibitor handlers in command handler
        this.Logger.debug({label: "Client", message: "Using inhibitor handlers for command handler"});
        this.commandHandler.useInhibitorHandler(this.inhibitorHandler);

        //Loading listener handlers.
        this.Logger.info({label: "Loading", message: "Listener Handlers"});
        this.listenerHandler.loadAll();

        //Loading inhibitors
        this.Logger.info({label: "Loading", message: "Inhibitor Handlers"});
        this.inhibitorHandler.loadAll();

        //Loading commands
        this.Logger.info({label: "Loading", message: "Command Handlers"});
        this.commandHandler.loadAll();

        //Loggin in to discord
        this.Logger.info({label: "Connecting", message: "Trying to stablish connection with discord."});
        this.login()
    }
}
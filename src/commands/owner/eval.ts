import { CommandInteraction } from "discord.js";
import { Command } from "../../core/command";
import { clean, hastebin } from "../../helper/util";

class EvalCommand extends Command {
    constructor() {
        super({
            name: 'eval',
            description: 'Evaluate code from discord',
            ownerOnly: true
        });
        //argumnet "code": string.
        this.data.addStringOption(option => option.setName('code').setDescription('Code you want to run!').setRequired(true));
    }

    async exec(interaction: CommandInteraction) {
        const code = interaction.options.getString('code');
        //try-catch
        try {
            //eval code
            const evaled = eval(code);
            const cleantxt = await clean(evaled);
            const bin = await hastebin(cleantxt);
            if(cleantxt.length > 800) interaction.reply({ content: bin, ephemeral: true });
            else interaction.reply( { content: cleantxt, ephemeral: true });
        } catch (error) {
            const cleantxt = await clean(error);
            interaction.reply({ content: cleantxt, ephemeral: true });
        }
    }
}

module.exports = EvalCommand;

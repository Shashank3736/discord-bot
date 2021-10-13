# Plugins

## How to create plugins for the bot?

Plugins are pretty simple to be created. Just follow the steps below to get started:
- Create a folder and name it whatever you wise for let's say 'giveaway'.
- Create a file inside the folder and name it `index.ts`.

index.ts
```ts
module.exports = async (client: BotClient) => {
    //things i want to do
}
```

### Want to add command?
Extedn `core/command.ts` -> Command class and do whatever you wish for.

#### Rules for command:
- Every command must extend `Command` class from 'core/command'.
- If command do not have any sub-commands then create `exec` function in the class.

e.g.
```ts
const data = new SlashCommandBuilder()
.setName('help')
.setDescription('Get help of a command.')
.addStringOption(opt => opt.setName('command').setDescription('Command you want help for.'))
.addBooleanOption(opt => opt.setName('hide').setDescription('You want to hide help message or not.'))

class HelpCommand extends Command{
    constructor(client: BotClient) {
        super(data, client);
    }

    exec(interaction: CommandInteraction) {
        const command = interaction.options.getString('command', false);
        const hide = interaction.options.getBoolean('hide', false) || false;

        if(command) {
            const cmd = this.client.commands.get(command);
            if(!cmd) interaction.reply({ ephemeral: true, content: `ERROR: COMMAND NOT AVAILABLE.`});
            else cmd.help(interaction);
        } else {
            const embed = new MessageEmbed()
            .setTitle('Help')
            .setThumbnail(this.client.user?.displayAvatarURL())
            .setColor("BLURPLE")

            let description = "";
            for (const cmd of this.client.commands.map(cmdData => cmdData.toJSON())) {
                description += `\`${cmd.name}\`: ${cmd.description}\n`;
            }
            embed.setDescription(description);

            interaction.reply({ ephemeral: hide, embeds: [embed]});
        }
    }
}
```

- If command have sub-commands then to run those sub-commands create function `cmd_${subCmdName}` for e.g `/gatekeeper show` will run cmd_show(interaction) in your class.

- If command have sub-command group then create function as `grp_subcmd`. For e.g `/permit add role` will run `add_role` function.
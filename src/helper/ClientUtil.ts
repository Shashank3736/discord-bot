import { APIApplicationCommandOption, ApplicationCommandOptionType } from "discord-api-types";
import { CommandInteraction, Interaction, MessageActionRow, MessageButton, MessageComponentInteraction, MessageEmbed } from "discord.js";
import { openStdin } from "process";
import { BotClient } from "../core/client";
import { log } from "./util";

interface cmdJSON {
  name: string;
  description: string;
  options: APIApplicationCommandOption[];
  default_permission: boolean | undefined;
}

interface cmdJSON2 {
  type: ApplicationCommandOptionType;
  name: string;
  description: string;
  options: APIApplicationCommandOption[];
}

interface cmdOptions {
  permit_level: number;
  description?: string;
  prefix?: string;
}

export class ClientUtil {
  public client: BotClient;

  constructor(client: BotClient) {
    this.client = client;
  }

  commandFormat(cmd: cmdJSON2 | cmdJSON, prefix: string = '/'): string[] {
    const argType = ['', 'SUB_COMMAND', 'SUB_COMMAND_GROUP', 'STRING', 'INTEGER', 'BOOLEAN', 'USER', 'CHANNEL', 'ROLE', 'MENTIONABLE', 'NUMBER'];
    const finalReturn: string[] = [];
    const subCmdGrps = cmd.options.filter(opt => opt.type === 2);
    const subCmds = cmd.options.filter(opt => opt.type === 1);
    const args = cmd.options.filter(opt => opt.type > 2);
    log(`SubCmds: ${subCmds.length}
    SubCmdGrps: ${subCmdGrps.length}
    args: ${args.length}`);
    if(subCmdGrps.length > 0) {
      for (const grp of subCmdGrps) {
        for (const subCmd of grp.options) {
          let format = `${prefix}${cmd.name} ${grp.name} ${subCmd.name} `
          for (const arg of subCmd.options) {
            format += `[${arg.name}${arg.required ? ':' : '?:'}${argType[arg.type]}] `
          }
          finalReturn.push(format);
        }
      }
    }

    if(subCmds.length > 0) {
      for(const subCmd of subCmds) {
        let format = `${prefix}${cmd.name} ${subCmd.name} `;
        if(!subCmd.options) subCmd.options = [];
          for (const arg of subCmd.options) {
            format += `[${arg.name}${arg.required ? ':' : '?:'}${argType[arg.type]}] `;
          };
        finalReturn.push(format);
      };
    };

    if(args.length > 0) {
      let format = `${prefix}${cmd.name} `;

      for(const arg of args) {
        format += `[${arg.name}${arg.required ? ':' : '?:'}${argType[arg.type]}] `;
      };

      finalReturn.push(format)
    };
    return finalReturn;
  };

  async createMenu(interaction: CommandInteraction, embeds: MessageEmbed[]) {
    const filter = (i: MessageComponentInteraction) => i.user.id === interaction.user.id;

    const nextButton = new MessageButton().setCustomId('next').setEmoji('898838010529976330').setStyle('PRIMARY');
    const prevButton = new MessageButton().setCustomId('prev').setEmoji('898837930666258442').setStyle('PRIMARY');
    const firstButton = new MessageButton().setCustomId('first').setEmoji('898838071901061190').setStyle('PRIMARY');
    const lastButton = new MessageButton().setCustomId('last').setEmoji('898837229739331595').setStyle('PRIMARY');
    const endButton = new MessageButton().setCustomId('end').setEmoji('898838342165209089').setStyle('DANGER');

    const row = new MessageActionRow()
    .addComponents([firstButton.setDisabled(false), prevButton.setDisabled(false), nextButton.setDisabled(false), lastButton.setDisabled(false), endButton]);

    const rowAtFirst = new MessageActionRow()
    .addComponents([firstButton.setDisabled(true), prevButton.setDisabled(true), nextButton.setDisabled(false), lastButton.setDisabled(false), endButton])

    const rowAtLast = new MessageActionRow()
    .addComponents([firstButton.setDisabled(false), prevButton.setDisabled(false), nextButton.setDisabled(true), lastButton.setDisabled(true), endButton])

    if(!interaction.channel) return interaction.reply({ content: `Try this command in a text channel.` });
    interaction.reply({ embeds: [embeds[0]], components: [rowAtFirst] });

    const collector = interaction.channel.createMessageComponentCollector({ filter, componentType: 'BUTTON', time: 60000});
    let page = 0;
    collector.on('collect', i => {
      log(i.customId);
      if(i.customId === 'first') i.update({ embeds: [embeds[0]], components: [rowAtFirst] });
      else if(i.customId === 'last') i.update({ embeds: [embeds[embeds.length - 1]], components: [rowAtLast]});
      else if(i.customId === 'end') i.update({ components: [] });
      else if(i.customId === 'next') {
        page++;
        if(page === embeds.length - 1) i.update({ embeds: [embeds[page]], components: [rowAtLast]});
        else i.update({ embeds: [embeds[page]], components: [row] });
      } else if(i.customId === 'prev') {
        page--;
        if(page === 0) i.update({ embeds: [embeds[page]], components: [rowAtFirst] });
        else i.update({ embeds: [embeds[page]], components: [row] });
      }
    });

    collector.on('end', (collectd, reason) => {
      interaction.editReply({ components: [] });
    });
  }

  createHelpEmbed(cmd: cmdJSON | cmdJSON2, options: cmdOptions) {
    if(!options.prefix) options.prefix = '/';
    const argType = ['', 'SUB_COMMAND', 'SUB_COMMAND_GROUP', 'STRING', 'INTEGER', 'BOOLEAN', 'USER', 'CHANNEL', 'ROLE', 'MENTIONABLE', 'NUMBER']
    const permit_type = ['', 'REGULAR', 'SUPPORTER', 'MODERATOR', 'ADMINISTRTATOR', 'OWNER']

    const getPermitType = (lvl: number) => lvl === Infinity ? 'ALMIGHTY' : permit_type[lvl];

    const embeds: MessageEmbed[] = [];
    const formats = this.commandFormat(cmd, options.prefix).map(e => `\`${e}\``);
    log(formats);
    if(formats.length === 0) formats.push("`"+options.prefix + cmd.name+'`');
    const embed = new MessageEmbed()
    .setColor('BLURPLE')
    .setTitle(`${options.prefix}${cmd.name}`)
    .setDescription(cmd.description)
    .addField('Format', formats.length === 1 ? formats[0] : formats.join('\n'))
    .setFooter('Permission Level: ' + getPermitType(options.permit_level), this.client.user?.displayAvatarURL());

    const subCommands = cmd.options.filter(args => args.type === 1);
    const subCommandsGroup = cmd.options.filter(args => args.type === 2);
    const argsInCmd = cmd.options.filter(arg => arg.type > 2);

    if(options.description) {
      const embed_2 = new MessageEmbed()
      .setColor('BLURPLE')
      .setTitle(cmd.name)
      .setDescription(`${cmd.description}

      ${options.description}`)
      .setFooter('Permission Level: ' + getPermitType(options.permit_level), this.client.user?.displayAvatarURL());
      embeds.push(embed_2)
    }

    if(argsInCmd.length > 0) {
      for (let i = 0; i < argsInCmd.length; i++) {
        const element = argsInCmd[i];
        embed.addField(`Argument ${i + 1}`, `Name: ${element.name}
        Description: ${element.description}
        Type: ${argType[element.type]}
        Required: ${element.required ? 'Yes': 'No'}`)
      }
    }
    if(subCommands.length > 0) {
      let desc = "";

      for (const subCmd of subCommands) {
        desc += `\`└─ ${subCmd.name}\`: ${subCmd.description}\n`
      }
      embed.addField('Sub Command(s)', desc);
    }

    if(subCommandsGroup.length > 0) {
      let desc = '';

      for (const grp of subCommandsGroup) {
        for (const subCmd of grp.options) {
          desc += `\`└─ ${grp.name + ' ' + subCmd.name}\`: ${subCmd.description}\n`
        }
      }
      embed.addField('Sub Command Groups', desc);
    }
    embeds.push(embed);
    
    return embeds;
  }
}
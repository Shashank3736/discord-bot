import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, Util } from "discord.js";
import { config } from "../../config";
import { BotClient } from "../../core/client";
import { Command } from "../../core/command";
import { log } from "../../helper/util";

const data = new SlashCommandBuilder()
.setName('config')
.setDescription('Config bot configuration values like color, avatar etc.')
//create set subcommand group
.addSubcommandGroup(grp => grp.setName('set')
  .setDescription('Set config value for your bot.')
  //create subcommand set.avatar
  .addSubcommand(subcmd => subcmd.setName('avatar').setDescription('Set avatar for the bot.')
    .addStringOption(opt => opt.setName('avatar_url').setRequired(true).setDescription('Write the image url here.')))
  //create set.status
  .addSubcommand(sub => sub.setName('status').setDescription('Set your bot status as idle, offline, online or dnd.')
    .addStringOption(opt => opt.setName('status').setDescription('Choose the status option from here.').setRequired(true)
      .addChoices([['IDLE', 'idle'], ['OFFLINE', 'invisible'], ['DND', 'dnd'], ['ONLINE', 'online']])))
  //create set.activity
  .addSubcommand(sub => sub.setName('activity').setDescription('Set activity for your bot.')
    .addStringOption(opt => opt.setRequired(true).setName('type').setDescription('Choose the type of activity.')
      .addChoices([['Playing', 'PLAYING'], ['Watching', "WATCHING"], ['Listening', 'LISTENING'], ['Streaming', 'STREAMING'], ['Competing', 'COMPETING']]))
    .addStringOption(opt => opt.setName('content').setDescription('Write the message status will have like "to your worries"').setRequired(true))
    .addStringOption(opt => opt.setName('url').setDescription('Type the url if you want streaming activity.')))
  //create set.name
  .addSubcommand(sub => sub.setName('name').setDescription('Set the name of bot.')
    .addStringOption(opt => opt.setName('name').setDescription('Write new name for your bot.').setRequired(true)))
  //create set.color
  .addSubcommand(sub => sub.setName('color').setDescription('Set custom embed color for your bot.')
    .addStringOption(opt => opt.setName('type').setDescription('Choose the type of embed color you want to change').setRequired(true)
      .addChoices([['Main', 'color.main'], ['Wrong', 'color.wrong'], ['Error', 'color.error'], ['Success', 'color.success']]))
    .addStringOption(opt => opt.setName('colour').setRequired(true).setDescription('Write your colour code.')))
  .addSubcommand(sub => sub.setName('emoji').setDescription('Set reaction emojis for your bot.')
    .addStringOption(opt => opt.setName('type').setRequired(true).setDescription('Choose the type of reaction you want to change')
      .addChoices([
        ['First Page Button', 'emojis.firstButton'], 
        ['Previous Page Button', 'emojis.prevButton'], 
        ['Next Page Button', 'emojis.nextButton'], 
        ['Last Page Button', 'lastButton'], 
        ['End Button', 'emojis.endButton']
      ]))
    .addStringOption(opt => opt.setName('emoji').setDescription('Write your emoji or emojiId below.').setRequired(true))))
.addSubcommand(cmd => cmd.setName('reset').setDescription('Reset a particular type of config or complete setup to default.')
  .addStringOption(opt => opt.setName('data_type').setDescription('Choose the type of data from above list.').setRequired(true)
    .addChoices([
      ['Emojis', 'emojis'],
      ['Bot Data', 'bot'],
      ['Embed Color', 'color']
    ])));

module.exports = class ConfigCommand extends Command {
  constructor(client: BotClient) {
    super(data, client);
    this._developer = true;
    this._description = `Config command will help you to config your bot custom values, status, activity etc.
    
    Config command is quite powerful and do not have any limitation as new things will clearly appear here time to time.`
  }

  async set_emoji(interaction: CommandInteraction) {
    const type = interaction.options.getString('type', true);
    const content = interaction.options.getString('emoji', true);

    let emoji = "";
    const uniCodeEmojis = content.match(/(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g)
    if(uniCodeEmojis) {
      emoji = uniCodeEmojis[0];
    } else {
      emoji = content.split(':')[2].replace('>', '');
    }

    this.client.util.db.set(type, emoji);
    const embed = this.client.util.embed('success')
    .setDescription(`Emoji configuration completed. New emojis will be shown after bot restart.`);

    return interaction.reply({ embeds: [embed] });
  }

  async cmd_reset(interaction: CommandInteraction) {
    const type = interaction.options.getString('data_type', true);

    this.client.util.db.delete(type);

    const embed = this.client.util.embed('success')
    .setDescription(`Deleted data type: ${type} from the bot.`);

    interaction.reply({ embeds: [embed] });
  }

  async set_avatar(interaction: CommandInteraction) {
    const avatar_url = interaction.options.getString('avatar_url', true);
    if(!this.client.user) return this.client.util.replyError(`ClientUser is not fetched yet.`, interaction)
    this.client.user.setAvatar(avatar_url);

    const embed = this.client.util.embed('success').setDescription('New avatar has been set for your bot.').setThumbnail(avatar_url);

    return interaction.reply({ embeds: [embed] });
  }

  async set_status(interaction: CommandInteraction) {
    const status = interaction.options.getString('status', true);
    if(!this.client.user) return this.client.util.replyError(`ClientUser is not fetched yet.`, interaction)
    this.client.user.setStatus(status);

    this.client.util.db.set('bot.status', status);
    const embed = this.client.util.embed('success').setDescription(`Status of bot has been changed to: `+status);

    interaction.reply({ embeds: [embed] });
    return;
  }

  async set_activity(interaction: CommandInteraction) {
    const type = interaction.options.getString('type', true);
    const content = interaction.options.getString('content', true);
    let url = interaction.options.getString('url', false);

    if(url) this.client.util.db.set('bot.activity.url', url);
    if(!url) url = this.client.util.config.link.streamURL;

    this.client.user?.setActivity({
      name: content,
      type: type,
      url: url
    });

    this.client.util.db.set('bot.activity.name', content);
    this.client.util.db.set('bot.activity.type', type);
    
    const embed = this.client.util.embed('success')
    .setDescription('Activity successfully set for your bot.')

    interaction.reply({ embeds: [embed] });
  }

  async set_color(interaction: CommandInteraction) {
    const type = interaction.options.getString('type', true);
    const color = interaction.options.getString('colour', true);

    try {
      const code = Util.resolveColor(color);
      this.client.util.db.set(type, code);

      const embed = this.client.util.embed('success')
      .setDescription("New color code is set for `"+type.split('.')[1].toUpperCase()+"` is `"+color+"`.");

      interaction.reply({ embeds: [embed] });
    } catch (error) {
      this.client.util.replyError(`Color code you provided is incorrect. \n\nError: ${error}`, interaction);
    }
  }

  async set_name(interaction: CommandInteraction) {
    const name = interaction.options.getString('name', true);
    
    this.client.user?.setUsername(name);

    const embed = this.client.util.embed('success').setDescription("Name of your bot has been changed to **"+name+"**.");

    return interaction.reply({ embeds: [embed] });
  }

  async next() {
    log("Config next function is executed. ", config)
    this.client.util.config = config;
    return true;
  }
}

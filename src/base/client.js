const { Client, Collection, MessageEmbed } = require("discord.js");
const versionCheck = require('./versioncheck')
class CaptchaClient extends Client{
    constructor(options) {
        super(options);
        this.config = require('../config/config');
        this.customEmojis = require('../config/emojis.json');
        this.commands = new Collection();
        this.aliases = new Collection();
        this.search = require('../functions/search');
    }
    async createEmbed(color) {
        const version = await versionCheck()
        const embed = new MessageEmbed()
        .setAuthor(this.user.username, this.user.defaultAvatarURL())
        .setThumbnail(this.user.defaultAvatarURL())
        if(!version.sameVer) embed.setFooter('New version released: '+version.newVer)
        return embed;
    }
}

module.exports = CaptchaClient;
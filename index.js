const { Util } = require("discord.js");
const { table } = require('quick.db')

const db = new table('bot_config');
console.log(db.all())
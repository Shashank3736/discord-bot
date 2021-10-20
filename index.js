const { SlashCommandBuilder } = require("@discordjs/builders");
const { basename } = require("path");

module.exports = class FirstClass {
  constructor() {
    this.filename = __filename;
  }

  getFileName() {
    console.log(`1) ${__filename}
    2) ${this.filename}
    3) ${basename(__filename)}
    4) ${module.filename}`)
  }
}

const data = new SlashCommandBuilder
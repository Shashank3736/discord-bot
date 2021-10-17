const { Util } = require("discord.js");

const validateEmbedColor = (embedColor) => {
  try {
      embedColor = Util.resolveColor(embedColor);
      if (!isNaN(embedColor) && typeof embedColor === 'number') return true;
      else return false;
  } catch {
      console.log('An error.')
      return false;
  }
};

console.log(validateEmbedColor("#e91c1c"));
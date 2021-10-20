import { table } from "quick.db";

const db = new table('bot_config');

export const config = {
  emojis: {
    nextButton: db.get('emojis.nextButton') || "898838010529976330",
    prevButton: db.get('emojis.prevButton') || "898837930666258442",
    lastButton: db.get('emojis.lastButton') || "898837229739331595",
    firstButton: db.get('emojis.firstButton') || "898838071901061190",
    endButton: db.get('emojis.endButton') || "898838342165209089",
    ongoing: db.get('emojis.ongoing') || "744428838838075434",
    stop: db.get('emojis.stop') || "744428679672627270",
    idle: db.get('emojis.idle') || "744428575360286800"
  },
  message: {
    BLOCKED_USER: db.get('message.BLOCKED_USER') || "You are blocked from using the command in this server or globally.",
    BOT_DESCRIPTION: db.get('message.BOT_DESCRIPTION') || `Guardian is a bot which made for the purpose to provide anything at its best quality.`,
    WRONG_INPUT: ""
  },
  commandPermission: {
    "permit": db.get('commandPermission.permit') || 5,
    "help": db.get('commandPermission.help') || 1,
    "developer": db.get('commandPermission.developer') || 0,
    "ban": 3
  },
  images: {
    "githubUserAvatar": "https://avatars2.githubusercontent.com/u/58896906?v=4?s=100"
  },
  link: {
    supportServer: "https://discord.gg/Wsxmh8aGrT",
    githubProfile: "https://github.com/Shashank3736",
    streamURL: db.get('bot.activity.url') || "https://www.youtube.com/watch?v=LN7e69hGRS8"
  },
  color: {
    main: db.get('color.main') || "BLURPLE",
    error: db.get('color.error') || "RED",
    wrong: db.get('color.wrong') || "GOLD",
    success: db.get('colot.success') || "GREEN"
  },
  presence: {
    activity: db.get('bot.activity'),
    status: db.get('bot.status') || 'online'
  }
}
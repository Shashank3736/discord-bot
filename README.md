> Warning: The template is made with purpose of heavy bots. If you want to make small bot using it may not be a good idea.

# Welcome
A discord.js library template to create discord bots a bit faster. This framework provide most of the common things to developer as a boost.

## Features
- Pre made commands like (eval, permit, about, help, config etc.)
- Support for slash commands.
- Auto generated help messages.
- Support for sub-commands and group.
- File management.
- Support for plugins to create new commands/feature on the way.
- ClientUtil to provide support for creation of embed, helpEmbed, menu etc.

## Pre-requirements
- Node: ^v17

## How to use?
- First you have to click on `Use this template` to create your repo.
- Now you can add commands in `src/command` folder.
- It's recommended to see [plugins](plugins/README.md) if you want to create bots with extra features.

> Note: All of your commands must be an extension of `Command` class for them to support the framework.
> In your NewCommand class you can create `exec()` function if you do not have any subcommand/group. If you have subcommand (for e.g 'set') create `cmd_set` function. If you have group name 'config' and subcmd inside it is 'set' then create `config_set` function in your class.

You can edit all of bot config inside `src/config.ts` or by using command `/config`.

There are actually many other features in the framework which you may learn while using it. I created this repo for my own personal use so most of the features or wikis are not mentioned here if you want to request some features open an issue or join discussion.

# License
This open source bot is licensed under [Apache License 2.0](https://github.com/Shashank3736/discord.js-template/blob/master/LICENSE). Uses of the code is grant explicitly here but you should give us the credit for the open source.

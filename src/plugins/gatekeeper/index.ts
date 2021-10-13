import { createCaptchaSync } from "captcha-canvas";
import { Message, MessageAttachment, MessageEmbed, Role } from "discord.js";
import { table } from "quick.db";
import { BotClient } from "../../core/client";
import { guildConfig, SetupCommand } from "./commands";
const db = new table('gatekeeper');

module.exports = (client: BotClient) => {
    const command = new SetupCommand(client);
    client.commands.set(command.data.name, command);

    client.on('guildCreate', guild => {
        const config = {
            _id: guild.id,
            status: false,
            action: 1,
            duration: 30*60*1000
        };

        db.set(guild.id, config);
    });

    client.on('guildMemberAdd', async member => {
        const guildConfig: guildConfig = db.get(member.guild.id);
        //check if bot can be used or not
        if(!guildConfig.status) return;
        if(!guildConfig.quarantine_role_id) return;
        if(!guildConfig.verification_channel_id) return;
        /*Get quarantine role*/
        await member.roles.add(guildConfig.quarantine_role_id, 'User is unverified!');
        const actionData = ['Quarantine', 'Kick', 'Ban'];
        const captcha = createCaptchaSync(300, 100);
        const file = new MessageAttachment(captcha.image, 'captcha.png');
        let message: Message;

        try {
            message = await member.send({ content: `${member.toString()} Verify yourself by typing the captcha below.`, files: [file] });
        } catch (error) {
            const channel = member.guild.channels.cache.get(guildConfig.verification_channel_id);
            if(!channel) return;
            if(!channel.isText()) return;
            message = await channel.send({ content: `${member.toString()} Verify yourself by typing the captcha below.`, files: [file] });
        }
        const filter = (m: Message) => m.author.id === member.id;
        const collector = message.channel.createMessageCollector({ filter, time: guildConfig.duration });

        collector.on("collect", m => {
            if(m.content === captcha.text) {
                m.channel.send('You are verified!');
                member.roles.remove(guildConfig.quarantine_role_id);
                collector.stop('MEMBER IS NOT A BOT');
            } else {
                m.channel.send('Wrong Captcha. Try again!').then(msg => setTimeout(() => msg.delete(), 10*1000));
            }
        });

        collector.on('end', (_collected, reason) => {
            const embed = new MessageEmbed().setTimestamp().setThumbnail(member.displayAvatarURL());
            if(reason === 'MEMBER IS NOT A BOT') {
                embed.setColor('DARK_GREEN')
                .setDescription(`Member: ${member.toString()}
                Joined at: \`${member.joinedAt}\`
                Veification: \`Passed\`
                Action: \`Entry role provide.\``);
            }
            else {
                member.send('You failed to solve captcha that\'s why we decide to '+actionData[guildConfig.action - 1]+' you.')
                .catch(err=> err);
                embed.setDescription(`Member: ${member.toString()}
                Joined at: \`${member.joinedAt}\`
                Veification: \`Failed\`
                Action: \`${actionData[guildConfig.action - 1]}\``)
                .setColor("RED")
            }
            const channel = member.guild.channels.cache.get(guildConfig.log_channel_id || '');
            if(!channel || !channel.isText()) return;
            channel.send({ embeds: [embed] });
        });
    });

    client.on('guildDelete', guild => {
        db.delete(guild.id);
    });
}
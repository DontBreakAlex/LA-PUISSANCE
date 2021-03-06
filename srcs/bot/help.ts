import { ClientUser, Message, MessageEmbed } from 'discord.js';
import Command from './command';

const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

export default
async function execute(message: Message, array: string[], Commands: Command[]): Promise<void> {
	const help = Commands.map((command, index) => {
		return `${emojis[index]} \`${command.helpSummary.prefix}\` ${command.helpSummary.text}`;
	});
	const sentMsg = await message.channel.send(new MessageEmbed({
		title: 'Aide',
		fields: [
			{
				name: 'Préfixe',
				value: '`lp`',
				inline: true
			},
			{
				name: 'Exemple',
				value: '`lp play youtube <url>`',
				inline: true
			},
			{
				name: 'Commandes',
				value: help.join('\n')
			}
		],
		footer: {
			text: 'Clique sur un emoji pour plus de détails'
		}
	}));
	for (let i = 0, len = help.length; i < len; ++i)
		await sentMsg.react(emojis[i]);
	try {
		while (true) {
			const collected = await sentMsg.awaitReactions(
				(reaction, user) => { return emojis.includes(reaction.emoji.name) && !(user.id === sentMsg.author.id); },
				{ max: 1, time: 120_000, dispose: false, errors: ['time'] }
			);
			const index = emojis.indexOf(<string>collected.firstKey());
			message.channel.send(new MessageEmbed(Commands[index].help));
			const reaction = collected.first();
			if (!reaction) 
				continue;
			const id = reaction.users.cache.findKey(value => !(value instanceof ClientUser));
			reaction.users.remove(id);
		}
	} catch {}
}

import Command from './command';
import { Message, MessageEmbed } from 'discord.js';

const emojis = ['⏯', '⏩', '⏹']

export default class Queue extends Command {
	test(command: string): boolean {
		return command == 'pause';
	}

	async execute(message: Message, array: string[]) {
		if (!message.guild) return;

		if (message.guild.status.queue.length == 0) {
			message.channel.send('La queue est vide !');
			return;
		}

		let players = message.guild.status.queue.map((player, index) => `\`${index}\` ${player.title}`)
		let sentMsg = await message.channel.send(new MessageEmbed({
			title: "Queue",
			description: players.join('\n')
		}));
		for (let emoji of emojis)
			await sentMsg.react(emoji);
		try {
			while (true) {
				let collected = await sentMsg.awaitReactions(
					(reaction, user) => { return emojis.includes(reaction.emoji.name) && !(user.id === sentMsg.author.id) },
					{ max: 1, time: 120_000, dispose: false, errors: ["time"] }
				);
				switch (<string>collected.firstKey()) {
					case '⏹':
				}
			}
		} catch {}
	}

	helpSummary = {
		text: "Met la queue en pause",
		prefix: "pause"
	};

	help = {
		title: "Pause",
		fields: [
			{
				name: "Syntaxe",
				value: "`lp pause`",
			},
			{
				name: "Astuce",
				value: "Peux aussi enlever la pause"
			}
		]
	}
}

import Command from './command';
import { ClientUser, Message, MessageEmbed } from 'discord.js';
import Paus from './pause';
import Skip from './skip';
import Stop from './stop';

const emojis = ['⏯', '⏩', '⏹']

export default new class Queue extends Command {
	test(command: string): boolean {
		return command == 'queue';
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
					case '⏹': Stop.execute(message, array); break;
					case '⏩': Skip.execute(message, array); break;
					case '⏯': Paus.execute(message, array); break;
				}
				let reaction = collected.first();
				if (!reaction) continue;
				let id = reaction.users.cache.findKey(value => !(value instanceof ClientUser))
				reaction.users.remove(id);
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

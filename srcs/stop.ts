import Command from './command'
import { Message } from 'discord.js';

export default new class Stop extends Command {
	test(command: string) {
		return command == 'stop'
	}

	async execute(message: Message, array: string[]) {
		if (message.guild && message.guild.status.dispatcher) {
			message.guild.status.queue.flush();
			message.guild.status.dispatcher.end();
			if (message.guild.status.dispatcher.paused)
			// @ts-ignore
				message.guild.status.dispatcher._writeCallback();
		}
	}

	helpSummary = {
		text: "Stoppe la lecture de la queue et la vide",
		prefix: "stop"
	}

	help = {
		title: "Stop",
		fields: [
			{
				name: "Syntaxe",
				value: "`lp stop`",
				inline: true
			},
			{
				name: "Description",
				value: "Stoppe la lecture de la queue et la vide"
			}
		]
	}
}

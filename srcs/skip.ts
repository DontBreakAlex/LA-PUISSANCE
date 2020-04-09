import Command from './command'
import { Message } from 'discord.js';

export default new class Skip extends Command {
	test(command: string) {
		return command == 'skip'
	}

	async execute(message: Message, array: string[]) {
		if (message.guild)
				message.guild.status.dispatcher?.end();
	}

	helpSummary = {
		text: "Passe au prochain morceau de la queue",
		prefix: "skip"
	}

	help = {
		title: "Skip",
		fields: [
			{
				name: "Syntaxe",
				value: "`lp skip`",
				inline: true
			},
			{
				name: "Description",
				value: "Passe au prochain morceau de la queue"
			}
		]
	}
}

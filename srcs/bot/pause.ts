import Command from './command';
import { Message } from 'discord.js';

export default new class Pause extends Command {
	test(command: string): boolean {
		return command == 'pause';
	}

	execute(message: Message, array: string[]): void {
		if (!message.guild || !message.guild.status.dispatcher)
			return;
		if (message.guild.status.dispatcher.paused)
			message.guild.status.dispatcher.resume();
		else
			message.guild.status.dispatcher.pause();
	}

	helpSummary = {
		text: 'Met la queue en pause',
		prefix: 'pause'
	};

	help = {
		title: 'Pause',
		fields: [
			{
				name: 'Syntaxe',
				value: '`lp pause`'
			},
			{
				name: 'Astuce',
				value: 'Peux aussi enlever la pause'
			}
		]
	}
};

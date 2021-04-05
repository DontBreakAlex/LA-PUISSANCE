import { Message, MessageEmbedOptions } from 'discord.js';

export default abstract class Command {
	abstract test(command: string): boolean;
	abstract execute(message: Message, array: string[]): void;
	abstract helpSummary: {
		text: string,
		prefix: string
	}
	abstract help: MessageEmbedOptions;
}

import { Message, MessageEmbedOptions } from 'discord.js';

export default abstract class Command {
	abstract test(arg0: string): boolean;
	abstract execute(arg0: Message, arg1: string[]): void;
	abstract helpSummary: {
		text: string,
		prefix: string
	}
	abstract help: MessageEmbedOptions;
}

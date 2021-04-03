import Command from './command';
import { Message } from 'discord.js';

export default new class Calc extends Command {
	test(command: string): boolean {
		return command == 'calc';
	}

	execute(message: Message, array: string[]): void {
		const a = Number(array[1]), b = Number(array[3]);

		if ((array[2] == '/' || array[2] == '%') && (b == 0))
			message.channel.send('Oh, mec, c\'est pas possible !');
		else if (a !== a || b !== b)
			message.channel.send('Il me faut des chiffres !');
		else {
			switch (array[2]) {
				case '+': message.channel.send(`${a} + ${b} = ${a + b}`); break;
				case '-': message.channel.send(`${a} - ${b} = ${a - b}`); break;
				case '/': message.channel.send(`${a} / ${b} = ${a / b}`); break;
				case '*': message.channel.send(`${a} * ${b} = ${a * b}`); break;
				case '%': message.channel.send(`${a} % ${b} = ${a % b}`); break;
				case '^': message.channel.send(`${a} ^ ${b} = ${a ** b}`); break;
				default: message.channel.send('C\'est quoi cette opération de mort ? Je connais pas !');
			}
		}
	}

	helpSummary = {
		text: 'Calcule des trucs: `1 + 1 = 2`',
		prefix: 'calc'
	};

	help = {
		title: 'Calc',
		fields: [
			{
				name: 'Syntaxe',
				value: '`lp calc <opération>`',
				inline: true
			},
			{
				name: 'Exemple',
				value: '`lp calc 1 + 1`\n`1 + 1 = 2`',
				inline: true
			},
			{
				name: 'Description',
				value: 'Fait des calculs. Opérations suportées: `+`, `-`, `/`, `*`, `%`, `^`'
			}
		]
	}
};

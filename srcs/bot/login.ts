import { Message, MessageEmbed } from 'discord.js';
import Command from './command';
import Server from './server_link';
import qrCode from 'qrcode';

export default class Login extends Command {
	async execute(message: Message, array: string[]): Promise<void> {
		if (!message.guild) {
			return; // TODO: Think about here
		}
		const url = await Server.CreateLoginUrl({
			uid: message.author.id,
			guid: message.guild.id
		});
		const qr = await qrCode.toBuffer(url);
		const embed = new MessageEmbed({
			files: [{ attachment: qr, name: 'qr.png' }],
			image: { url: 'attachment://qr.png' },
			title: 'Scan le code !',
			description: url
		});
		message.author.send(embed);
	}

	test(command: string): boolean {
		return command == 'login';
	}

	helpSummary = {
		text: 'Permet de se connecter a la soundbox',
		prefix: 'login'
	}

	help = {
		title: 'Login',
		fields: [
			{
				name: 'Syntaxe',
				value: '`lp login`'
			},
			{
				name: 'Psiit...',
				value: 'Tu recevra le lien de connection par DM'
			}
		]
	}
}

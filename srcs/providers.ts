import { Player, Play } from './player';
import { VoiceConnection, Message, TextChannel } from 'discord.js';

class mp3 implements Player {
	stream: string | Buffer | import("stream").Stream = '';
	title: string = '';

	test(command: String) {
		return command == 'mp3';
	}

	async clone(message: Message, array: String[]) {
		let clone = new mp3();
		let attachement = message.attachments.first()
		console.log(typeof attachement)
		if (!attachement) throw 'no attachement';
		clone.stream = attachement.attachment;
		clone.title = attachement.name || '';
		return clone;
	}

	play(connection: VoiceConnection) {
		return connection.play(<any>this.stream);
	}

	announce(channel: TextChannel) {
		channel.send(`Lecture de ${this.title} en cours !`)
	}

}

/* class youtube implements Player {

} */

export default [ new mp3 ]

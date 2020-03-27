import Command from './command'
import { Message, StreamDispatcher, VoiceConnection, TextChannel, GuildMember, DMChannel } from 'discord.js';
import Providers from './providers';
import { GuildStatus, Playing } from './guild_map';

class Play extends Command {
	test(command: string) {
		return command == 'play' || command.includes('www.youtube')
	}

	async execute(message: Message, array: string[]) {
		if (!message.guild || !message.member || message.channel instanceof DMChannel) return;
		if (!array[1]) return message.guild.status.queue.play(message.channel, message.member);
		let player: Player;
		for (player of Providers)
			if (player.test(array[1])) {
				try {
					message.guild.status.queue.push(await player.clone(message, array, message.channel));
					message.guild.status.queue.play(message.channel, message.member);
				} catch (e) {
					let send = typeof e === 'string' ? e : e.message;
					message.channel.send(send)
				}
				break;
			}
	}

	helpSummary = {
		text: "Lance la lecture de la queue ou y ajoute un morceau",
		prefix: "play"
	}

	help = {
		title: "Play",
		fields: [
			{
				name: "Syntaxe",
				value: "`lp play <source> <url>`",
				inline: true
			},
			{
				name: "Exemple",
				value: "`lp play youtube youtu.be/dQw4w9WgXcQ`",
				inline: true
			},
			{
				name: "Description",
				value: "Ajoute un morceau à la queue. Lancer la commande sans source lance la lecture de la queue.\n Sources supportées: `youtube`, `mp3`"
			},
			{
				name: "mp3",
				value: "Attacher un fichier audio au message. Formats: `mp3`, `webm`, `wav`, `flac`",
				inline: true
			},
			{
				name: "youtube",
				value: "Possible de ne pas specifier la source:\n`lp play https://youtu.be/dQw4w9WgXcQ`"
			}
		]
	}
}

abstract class Player {
	abstract play(arg0: VoiceConnection): StreamDispatcher;
	abstract clone(arg0: Message, arg1: string[], channel: TextChannel): Promise<Player>;
	abstract test(arg0: string): boolean;
	abstract announce(arg0: TextChannel): void;
}

class PlayerQueue extends Array<Player> {
	constructor(parent: GuildStatus) {
		super();
		this.parent = parent;
	}

	parent: GuildStatus;

	async play(channel: TextChannel, member: GuildMember) {
		if (this.parent.playing == Playing.None && this.length != 0) {
			if (!this.parent.voice) {
				if (!member.voice.channel) {
					channel.send(`J'ai pas commencé à lire, t'es pas dans un salon vocal !`)
					return ;
				}
				this.parent.voice = await member.voice.channel.join();
			}
			while (this.length != 0) {
				let Player = <Player>this.shift();
				this.parent.dispatcher = Player.play(this.parent.voice);
				Player.announce(channel);
				await DispatcherEnd(this.parent.dispatcher);
			}
			this.parent.voice.disconnect();
			delete this.parent.voice;
			channel.send(`Il n'y a plus rien à lire, je vous emmerde et je rentre à ma maison !`)
		}
	}

	flush() {
		this.length = 0;
		this.parent.dispatcher?.end();
	}
}

async function DispatcherEnd(dispatcher: StreamDispatcher) {
	dispatcher.on('error', err => console.error(err));
	dispatcher.on('warn', err => console.warn(err));
	return new Promise((resolve, reject) => {
		dispatcher.on('finish', () => {
			resolve();
		})
	})
}

class Skip extends Command {
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

class Stop extends Command {
	test(command: string) {
		return command == 'stop'
	}

	async execute(message: Message, array: string[]) {
		if (message.guild) {
			message.guild.status.dispatcher?.end();
			message.guild.status.queue.flush();
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

export { Play, Player, PlayerQueue, Skip, Stop }
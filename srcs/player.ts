import Command from './command'
import { Message, StreamDispatcher, MessageEmbed, VoiceChannel, VoiceConnection, TextChannel, GuildMember, DMChannel } from 'discord.js';
import Providers from './providers';
import { GuildStatus, Playing } from './guild_map';

class Play extends Command {
	test(command: String) {
		return command == 'play' || command == 'stop' || command.includes('www.youtube')
	}

	async execute(message: Message, array: String[]) {
		if (!message.guild || !message.member || message.channel instanceof DMChannel) return;
		let player: Player;
		for (player of Providers)
			if (player.test(array[1])) {
				try {
					message.guild.status.queue.push(await player.clone(message, array));
					message.guild.status.queue.play(message.channel, message.member);
				} catch (e) {
					message.channel.send(e)
				}
				break;
			}
	}
}

abstract class Player {
	abstract play(arg0: VoiceConnection): StreamDispatcher;
	abstract clone(arg0: Message, arg1: String[]): Promise<Player>;
	abstract test(arg0: String): boolean;
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
			channel.send(`Il n'y a plus rien à lire, je vous emmerde et je rentre à ma maison !`)
		}
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

export { Play, Player, PlayerQueue }

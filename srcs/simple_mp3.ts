import Command from './command'
import { Message, StreamDispatcher, MessageEmbed, VoiceChannel } from 'discord.js';
import { Playing } from './guild_map';

/** WARNING:
 * 		This files suffers from code duplication
 */

function bindEvent(dispatcher: StreamDispatcher, cb: () => void) {
	dispatcher.on('error', err => console.error(err));
	dispatcher.on('warn', err => console.warn(err));
	dispatcher.on('finish', cb);
}

class Urss extends Command {
	test(command: String) {
		return command == 'urss'
	}

	async execute(message: Message, array: String[]) {
		if (!message.guild || !message.member) return;
		let status = message.guild.status;
		if (status.playing == Playing.None) {
			let vChannel = message.member.voice.channel
			if (!vChannel)
				message.channel.send("Mec, t'es pas dans un salon vocal !");
			else {
				let connection = await vChannel.join();
				let dispatcher = connection.play('./ressources/urss.webm');
				bindEvent(dispatcher, () => {
					(<VoiceChannel>vChannel).leave();
					status.playing = Playing.None;
				})
				status.playing = Playing.Urss
				status.dispatcher = dispatcher;
			}
		} else if (status.playing == Playing.Urss) {
			(<StreamDispatcher>status.dispatcher).end(); // If playing is at Urss, dispatcher can't be null
			message.channel.send(new MessageEmbed({
				author: { name: 'Staline', icon_url: 'http://ekouter.net/img/img/Staline.jpg' },
				description: "Quoi ?! Vous n'écoutez pas l'hymne soviétique jusqu'au bout ? J'envoie les KV-1 de l'armée rouge !"
			}));
		}
		else
			message.channel.send("Je suis déjà en train de lire quelque chose !");
	}
}

class Rick extends Command {
	test(command: String) {
		return command == 'rick'
	}

	async execute(message: Message, array: String[]) {
		if (!message.guild || !message.member) return;
		let status = message.guild.status;
		if (status.playing == Playing.None) {
			let debug = message.content.split(' ')[2].replace(/\D/g,'');
			let member = message.guild.member(debug);
			if (member) {
				let vChannel = member.voice.channel;
				if (!vChannel)
					message.channel.send(`${array[1].slice(1)} n'est pas dans un salon !`);
				else {
					let connection = await vChannel.join();
					let dispatcher = connection.play('./ressources/rickroll.webm')
					bindEvent(dispatcher, () => {
						(<VoiceChannel>vChannel).leave();
						status.playing = Playing.None;
					})
					status.playing = Playing.Rick
					status.dispatcher = dispatcher;
				}
			}
		} else if (status.playing == Playing.Rick)
			(<StreamDispatcher>status.dispatcher).end();
		else
			message.channel.send("Je suis déjà en train de lire quelque chose !");
	}
}

export { Urss, Rick }

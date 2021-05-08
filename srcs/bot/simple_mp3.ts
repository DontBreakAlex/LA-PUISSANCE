import Command from './command';
import { Message, MessageEmbed, StreamDispatcher, VoiceChannel } from 'discord.js';
import { Playing } from './guild_map';
import { bindToDispatcher } from './utils';

class Urss extends Command {
	test(command: string): boolean {
		return command == 'urss';
	}

	async execute(message: Message): Promise<void> {
		if (!message.guild || !message.member) 
			return;
		const status = message.guild.status;
		if (status.playing == Playing.None) {
			const vChannel = message.member.voice.channel;
			if (!vChannel)
				message.channel.send('Mec, t\'es pas dans un salon vocal !');
			else {
				const connection = await vChannel.join();
				const dispatcher = connection.play('./ressources/urss.webm');
				bindToDispatcher(dispatcher, () => {
					(<VoiceChannel>vChannel).leave();
					status.playing = Playing.None;
				});
				status.playing = Playing.Urss;
				status.dispatcher = dispatcher;
			}
		} else if (status.playing == Playing.Urss) {
			status.dispatcher!.end(); // If playing is at Urss, dispatcher can't be null
			message.channel.send(new MessageEmbed({
				author: { name: 'Staline', icon_url: 'http://ekouter.net/img/img/Staline.jpg' },
				description: 'Quoi ?! Vous n\'écoutez pas l\'hymne soviétique jusqu\'au bout ? J\'envoie les KV-1 de l\'armée rouge !'
			}));
		}
		else
			message.channel.send('Je suis déjà en train de lire quelque chose !');
	}

	helpSummary = {
		text: 'Joue l\'hymne sovitétique',
		prefix: 'urss'
	}

	help = {
		title: 'Urss',
		fields: [
			{
				name: 'Syntaxe',
				value: '`lp urss`',
				inline: true
			},
			{
				name: 'Description',
				value: 'Joue l\'hymne sovitétique.\nRépéter la commande stoppe la lecture (à vos risques et prérils)'
			}
		]
	}
}

class Rick extends Command {
	test(command: string): boolean {
		return command == 'rick';
	}

	async execute(message: Message, array: string[]): Promise<void> {
		if (!message.guild || !message.member) 
			return;
		const status = message.guild.status;
		if (status.playing == Playing.None) {
			const member = message.guild.member(message.content.split(' ')[2].replace(/\D/g,''));
			if (member) {
				const vChannel = member.voice.channel;
				if (!vChannel)
					message.channel.send(`${array[1].slice(1)} n'est pas dans un salon !`);
				else {
					const connection = await vChannel.join();
					const dispatcher = connection.play('./ressources/rickroll.webm');
					bindToDispatcher(dispatcher, () => {
						vChannel!.leave();
						status.playing = Playing.None;
					});
					status.playing = Playing.Rick;
					status.dispatcher = dispatcher;
				}
			}
		} else if (status.playing == Playing.Rick)
			status.dispatcher!.end();
		else
			message.channel.send('Je suis déjà en train de lire quelque chose !');
	}

	helpSummary = {
		text: 'Trolle un utilisateur',
		prefix: 'rick'
	}

	help = {
		title: 'Rick',
		fields: [
			{
				name: 'Syntaxe',
				value: '`lp rick <cible>`',
				inline: true
			},
			{
				name: 'Exemple',
				value: '`lp rick @Michel`',
				inline: true
			},
			{
				name: 'Description',
				value: 'Trolle la persone cible.\nRépeter la commande stoppe le trollage en cours\n`-. . ...- . .-.     --. --- -. -. .-     --. .. ...- .     -.-- --- ..-     ..- .--.`'
			}
		]
	}
}

class Goodenough extends Command {
	test(command: string): boolean {
		return command == 'goodenough';
	}

	async execute(message: Message): Promise<void> {
		if (!message.guild || !message.member) 
			return;
		const status = message.guild.status;
		if (status.playing == Playing.None) {
			const vChannel = message.member.voice.channel;
			if (!vChannel)
				message.channel.send('Mec, t\'es pas dans un salon vocal !');
			else {
				const connection = await vChannel.join();
				const dispatcher = connection.play('./ressources/goodenough.webm');
				bindToDispatcher(dispatcher, () => {
					(<VoiceChannel>vChannel).leave();
					status.playing = Playing.None;
				});
				status.playing = Playing.Generic;
				status.dispatcher = dispatcher;
			}
		} else if (status.playing == Playing.Generic)
			(<StreamDispatcher>status.dispatcher).end();
		else
			message.channel.send('Je suis déjà en train de lire quelque chose !');
	}

	helpSummary = {
		text: 'Oof, c\'est pas si mal !',
		prefix: 'goodenough'
	}

	help = {
		title: 'David Goodenough',
		image: { url: 'https://pbs.twimg.com/profile_images/1216150922537177088/WuyhBj19_400x400.jpg' },
		fields: [
			{
				name: 'Syntaxe',
				value: '`lp goodenough`',
				inline: true
			}
		]
	}
}

export { Urss, Rick, Goodenough };

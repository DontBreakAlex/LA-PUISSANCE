import { Player } from './player';
import { VoiceConnection, Message, TextChannel } from 'discord.js';
import ytdl from 'ytdl-core';
import { Readable } from 'stream';
import { youtubeKey } from '../config.json';
import Youtube, { YoutubeVideo } from 'youtube.ts'
import { MessageEmbed } from 'discord.js';
import ytParser from 'youtube-duration-format';

class mp3 implements Player {
	stream: string | Buffer | import("stream").Stream = '';
	title: string = '';

	test(command: string) {
		return command == 'mp3';
	}

	async clone(message: Message, array: string[], channel: TextChannel) {
		let clone = new mp3();
		let attachement = message.attachments.first()
		if (!attachement) throw `Mec, t'as rien compris, il faut attacher un fichier audio au message !`;
		clone.stream = attachement.attachment;
		clone.title = attachement.name || '';
		channel.send(`J'ai ajouté ${attachement.name} à la queue !`)
		return clone;
	}

	play(connection: VoiceConnection) {
		return connection.play(<any>this.stream);
	}

	announce(channel: TextChannel) {
		channel.send(`Lecture de ${this.title} en cours !`)
	}

}

class youtube implements Player {
	readable?: Readable;
	youtube = new Youtube(youtubeKey);
	title = '';

	test(command: string) {
		return command.includes('youtu')
	}

	async clone(message: Message, array: string[], channel: TextChannel) {
		let clone = new youtube();
		let url = array[2] || array[1]
		if (url.indexOf('https://') == -1) url = `https://${url}`;
		clone.readable = ytdl(url, { highWaterMark: 1 << 22 });
		let video = await this.youtube.videos.get(url);
		clone.title = video.snippet.title;
		message.channel.send(new MessageEmbed({
			title: video.snippet.title,
			url: url,
			description: `Je l'ai ajouté ça à la queue`,
			thumbnail: video.snippet.thumbnails.default,
			fields: [
				{
					name: `Chaine`,
					value: video.snippet.channelTitle,
					inline: true
				},
				{
					name: `Durée`,
					value: ytParser(video.contentDetails.duration),
					inline: true
				},
				{
					name: `Vues`,
					value: video.statistics.viewCount,
					inline: true
				}
			]
		}));
		return clone;
	}

	play(connection: VoiceConnection) {
		return connection.play(<Readable>this.readable)
	}

	announce(channel: TextChannel) {
		channel.send(`Lecture de ${this.title} en cours !`)
	}
}

export default [ new mp3, new youtube ]

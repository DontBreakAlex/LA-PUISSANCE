import { Player } from './player';
import { Message, MessageEmbed, TextChannel, VoiceConnection } from 'discord.js';
import ytdl from 'ytdl-core';
import { Readable } from 'stream';
import { arl, youtubeKey } from '../../config.json';
import Youtube from 'youtube.ts';
import ytParser from 'youtube-duration-format';
import fs from 'fs';
import https from 'https';
import { spawn } from 'child_process';
import fetch from 'node-fetch';

const error = 'J\'ai pas réussi à ajouter ça à la queue !';
class mp3 implements Player {
	stream: string | Buffer | import('stream').Stream = '';
	title = '';

	test(command: string) {
		return command == 'mp3';
	}

	async clone(message: Message, array: string[], channel: TextChannel) {
		const clone = new mp3();
		const attachement = message.attachments.first();
		if (!attachement) 
			throw 'Mec, t\'as rien compris, il faut attacher un fichier audio au message !';
		clone.stream = attachement.attachment;
		clone.title = attachement.name || '';
		channel.send(`J'ai ajouté ${attachement.name} à la queue !`);
		return clone;
	}

	play(connection: VoiceConnection) {
		return connection.play(<any>this.stream);
	}

	announce(channel: TextChannel) {
		channel.send(`Lecture de ${this.title} en cours !`);
	}

}

class youtube implements Player {
	readable?: Readable;
	youtube = new Youtube(youtubeKey);
	title = '';

	test(command: string) {
		return command.includes('youtu');
	}

	async clone(message: Message, array: string[], channel: TextChannel) {
		const clone = new youtube();
		let url = array[2] || array[1];
		if (url.indexOf('https://') == -1) 
			url = `https://${url}`;
		clone.readable = ytdl(url, { highWaterMark: 1 << 22 });
		const video = await this.youtube.videos.get(url);
		clone.title = video.snippet.title;
		channel.send(new MessageEmbed({
			title: video.snippet.title,
			url: url,
			description: 'Je l\'ai ajouté ça à la queue',
			thumbnail: video.snippet.thumbnails.default,
			fields: [
				{
					name: 'Chaine',
					value: video.snippet.channelTitle,
					inline: true
				},
				{
					name: 'Durée',
					value: ytParser(video.contentDetails.duration),
					inline: true
				},
				{
					name: 'Vues',
					value: video.statistics.viewCount,
					inline: true
				}
			]
		}));
		return clone;
	}

	play(connection: VoiceConnection) {
		return connection.play(<Readable>this.readable);
	}

	announce(channel: TextChannel) {
		channel.send(`Lecture de ${this.title} en cours !`);
	}
}

class deezer implements Player {
	file = '';
	title = '';

	constructor() {
		fs.stat('SMLoadr-linux-x64', err => {
			if (!err) 
				return;
			if (err.code != 'ENOENT') 
				throw err;
			console.log('Downloading SMLoadr...');
			const zip = fs.createWriteStream('tmp.zip');
			https.get('https://git.fuwafuwa.moe/attachments/9a051535-b6d7-44ae-bee2-bb9aef22e189', resp => { resp.pipe(zip).on('finish', () => {
				spawn('unzip', ['tmp.zip']).on('exit', () => {
					fs.writeFile('SMLoadrConfig.json', `{\n"saveLayout": "",\n"arl": "${arl}"\n}`, () => {});
					fs.chmod('SMLoadr-linux-x64', '0777', () => {});
					fs.unlink('tmp.zip', () => {});
					console.log('Done !');
				});});});
		});
	}

	test(command: string) {
		return command.includes('deezer');
	}

	async clone(message: Message, array: string[], channel: TextChannel) {
		const clone = new deezer();
		const url = array[2] || array[1];
		const id = <string>url.split('/').pop();
		if (!url.includes('track')) 
			throw error + '(Err 0)';
		clone.file = `./downloads/${id}.mp3`;
		const [track] = await Promise.all([
			this.makeApiCall(id),
			clone.download(url, id)
		]);
		if (!track) 
			throw error + '(Err 2)';
		clone.title = track.title;
		const h = track.duration / 3600 | 0, m = track.duration % 3600 / 60 | 0, s = track.duration % 60;
		channel.send(new MessageEmbed({
			title: track.title,
			url: track.link,
			description: 'Je l\'ai ajouté ça à la queue',
			thumbnail: { url: track.album.cover },
			fields: [
				{
					name: 'Artiste',
					value: `[${track.artist.name}](${track.artist.link})`,
					inline: true
				},
				{
					name: 'Durée',
					value: `${h ? h + ':' : ''}${m ? m + ':' : ''}${s}`,
					inline: true
				},
				{
					name: 'Album',
					value: `[${track.album.title}](${track.album.link})`,
					inline: true
				}
			]
		}));
		return clone;
	}

	async download(url: string, id: string): Promise<void> {
		if (await this.exists(this.file)) 
			return;
		return new Promise((resolve, reject) => {
			const SMLoadr = spawn('./SMLoadr-linux-x64', ['--url', url, '-p', `./tmp/${id}/`]);
			SMLoadr.on('exit', code => {
				if (code != 1) 
					reject(`${error} (Err 3:${code})`);
				const find = spawn('find', [`./tmp/${id}/`, '-name', '*.mp3', '-print', '-exec', 'mv', '{}', `./downloads/${id}.mp3`, ';']);
				find.on('exit', code => {
					if (code == 1) 
						reject(error + '(Err 1)');
					spawn('rm', ['-r', `./tmp/${id}`]);
					resolve();
				});
			});
		});
	}

	async makeApiCall(id: string): Promise<Track|undefined> {
		const resp = await fetch(`https://api.deezer.com/track/${id}`);
		if (resp.ok) 
			return await resp.json();
	}

	play(connection: VoiceConnection) {
		return connection.play(this.file);
	}

	announce(channel: TextChannel) {
		channel.send(`Lecture de ${this.title} en cours !`);
	}

	async exists(file: string): Promise<boolean> {
		return new Promise(resolve => {
			fs.stat(file, err => {
				resolve(!err);
			});
		});
	}
}

export default [ new mp3, new youtube, new deezer ];

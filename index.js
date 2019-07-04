const Discord = require('discord.js');
const bot = new Discord.Client();
const config = require('config');
const ytdl = require('ytdl-core-discord');
const token = config.get('token');
const YouTube = require('simple-youtube-api');
const ytbapi = new YouTube(config.get('youtube'));
const request = require(`request`);
const fs = require(`fs`);

trolling = new Map();
queue = new Map();
dispatchmap = new Map();

bot.on('ready', () => {
	console.log('Bot is UP !')
	bot.user.setPresence('online');
	bot.user.setActivity('être plus puissant', {type: 'PLAYING'});
})

bot.on('message', message => {
	if (message.content.startsWith('lp'))
	{
		msg = message.cleanContent.split(' ');
		switch (msg[1]) {
			case 'test'		: message.channel.send(`Bravo ${message.author}, le test a REUSSI !`); break;
			case 'norris'	: message.channel.send(`Chuck Norris est contre les radars automatiques, ça l'éblouie quand il fait du vélo.`); break;
			case 'calcule'	: calc(msg, message); break;
			case 'rickroll'	: rickroll(message); break;
			case 'stoprick'	: stoprick(message); break;
			case 'play'		: play(message, msg); break;
			case 'stop'		: stop(message); break;
			case 'next'		: next(message); break;
			case 'queue'	: displayqueue(message); break;
			case 'l'		: console.log(message.attachments); break;
		}
		// console.log(message);
	}
})

function play(message, msg) {
	switch (msg[2]) {
		case undefined	: break;
		case 'youtube'	: addytb(message, msg[3]); break;
		case 'mp3'		: addmp3(message, msg); break;
		default			: message.channel.send(`Mec, je connais pas ${msg[2]} !`); return;
	}
	if (message.guild.members.get(bot.user.id).voiceChannel == undefined && message.member.voiceChannel != undefined)
		playqueue(message);
}

function next(message) {
	dispatchmap.get(message.guild.id).end();
}

function stop(message) {
	queue.get(message.guild.id).length = 0;
	dispatchmap.get(message.guild.id).end();
}

async function playqueue(message) {
	if (queue.get(message.guild.id).length != 0)
	{
		let voiceChannel = message.member.voiceChannel;
		let connection = await voiceChannel.join();
		while (queue.get(message.guild.id).length != 0) {
			var current = queue.get(message.guild.id).shift();
			switch (current.type) {
				case 'youtube'	: await youtube(connection, current.url, current.title, message); break;
				case 'mp3'		: await mp3(connection, current.file, message); break;
			}
		}
		message.channel.send('Il n\'y a plus rien à lire, je vous emmerde et je rentre à ma maison !')
		message.guild.members.get(bot.user.id).voiceChannel.leave();
		dispatchmap.delete(message.guild.id);
	}
}

function addytb(message, url) {
	if (!queue.has(message.guild.id))
		queue.set(message.guild.id, []);
	ytbapi.getVideo(url)
	.then(video => {
		message.channel.send(`J'ai ajouté ${video.title} à la queue !`);
		queue.get(message.guild.id).push({"url": url, "type": 'youtube', "title": video.title});
	})
	.catch(() => {
		message.channel.send(`J'ai pas réussi à ajouter ça à la queue !`);
	});
}
async function youtube(connection, url, title, message) {
	return new Promise(async (resolve, reject) => {
		let disp = connection.playOpusStream(await ytdl(url)
		.catch(() => {
			message.channel.send(`Impossible de lire ${title}`);
			resolve();
		}));
		dispatchmap.set(message.guild.id, disp);
		message.channel.send(`Lecture de ${title} en cours !`);
		disp.on('end', () => {
			resolve();
		})
	})
}

async function mp3(connection, filename, message) {
	return new Promise((resolve, reject) => {
		let disp = connection.playFile('./downloads/' + filename);
		dispatchmap.set(message.guild.id, disp);
		message.channel.send(`Lecture de ${filename} en cours !`);
		disp.on('end', end => {
			resolve();
		})
	})
}

function calc(msg, message) {
	let a = Number(msg[2]), b = Number(msg[4]);
	if ((msg[3] == '/' || msg[3] == '%') && (b == 0))
		message.channel.send(`Oh, mec, c'est pas possible !`);
	else if (a !== a || b !== b)
		message.channel.send(`Il me faut des chiffres !`);
	else {
		switch (msg[3]) {
			case '+': message.channel.send(`${a} + ${b} = ${a+b}`); break;
			case '-': message.channel.send(`${a} - ${b} = ${a-b}`); break;
			case '/': message.channel.send(`${a} / ${b} = ${a/b}`); break;
			case '*': message.channel.send(`${a} * ${b} = ${a*b}`); break;
			case '%': message.channel.send(`${a} % ${b} = ${a%b}`); break;
			case '^': message.channel.send(`${a} ^ ${b} = ${a**b}`); break;
			default : message.channel.send(`C'est quoi cette opération de mort ? Je connais pas !`)
		}
	}
}

function stoprick(message) {
	let msg = message.content.split(' ');
	let user = msg[2].replace(/\D/g,'');
	if (trolling.has(user)) {
		trolling.get(user).end();
		message.channel.send("C'est fini !")
	}
	else message.channel.send(`${message.guild.members.get(user)} n'est pas en train de se faire troller !`)
}

function rickroll(message) {
	let msg = message.content.split(' ');
	let user = msg[2].replace(/\D/g,'');
	let voiceChannel = message.guild.members.get(user).voiceChannel;
	if (voiceChannel == undefined) {
		message.channel.send(`${message.guild.members.get(user)} n'est pas dans un salon vocal !`)
		return ;
	}
	voiceChannel.join().then(connection => {
		let disp = connection.playFile('./ressources/rickroll.webm');
		trolling.set(user, disp);
		message.channel.send("C'est parti !")
		disp.on('end', (end) => {
			message.guild.members.get(bot.user.id).voiceChannel.leave();
		})
	});
}

function addmp3(message) {
	if (!queue.has(message.guild.id))
		queue.set(message.guild.id, []);
	let attachment = message.attachments.first();
	if (attachment.filename.slice(-3) == 'mp3') {
		download(attachment.url, attachment.filename)
		.then(() => {
			queue.get(message.guild.id).push({"file": attachment.filename, "type": 'mp3'});
			message.channel.send(`J'ai ajouté ${attachment.filename} à la queue !`)
		})
		.catch(err => {
			message.channel.send("Une erreur s'est produite lors du téléchargment !");
	});
	}
	else {
		message.channel.send(`Mec, t'as rien compris, il faut joindre un fichier mp3 au message !`)
	}
}

function download(url, filename) {
	return new Promise((resolve, reject) => {
		request.get(url)
			.on('error', err => reject(err))
			.pipe(fs.createWriteStream('./downloads/' + filename))
			.on('finish', () => resolve());
	})
}

function displayqueue(message) {
	let string = '';
	if (queue.has(message.guild.id) && queue.get(message.guild.id).length != 0)
	{
		queue.get(message.guild.id).forEach((elem, index) => {
			switch (elem.type) {
				case 'youtube'	: string += `${index+1} | ${(elem.title)}\n`; break;
				case 'mp3'	: string += `${index+1} | ${(elem.file)}\n`; break;
			}
		});
		message.channel.send(string);
	}
	else {
		message.channel.send("La queue est vide !")
	}
}

bot.login(token);
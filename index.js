const Discord = require('discord.js');
const bot = new Discord.Client();
const config = require('config');
const ytdl = require('ytdl-core-discord');
const token = config.get('token');

trolling = new Map();
bot.on('ready', () => {
	console.log('Bot is UP !')
	var channel = bot.channels.filter(chan => {
		if (chan.type == 'voice')
			return 1;
		else
			return 0;
	})/* .first() */;
	// channel.get('208962998033711104').join();
	// setTimeout(() => {channel.get('246938049810923521').join();}, 5000);
	// channel.send('LA PUISSANCE est en ligne !');
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
		}
		// console.log(message);
	}
})

function play(message, msg) {
	switch (msg[2]) {
		case 'youtube'	: youtube(message, msg[3]); break;
	}
}

function youtube(message, url) {
	let voiceChannel = message.member.voiceChannel;
	if (voiceChannel == undefined) {
		message.channel.send(`${message.author} n'est pas dans un salon vocal !`);
		return;
	}
	voiceChannel.join().then(async connection => {
		console.log(bot);
		let disp = connection.playOpusStream(await ytdl(url));
		message.channel.send(`Lecture de ${url} en cours !`);
		disp.on('end', () => {
			message.channel.send(`Lecture finie !`);
			message.guild.members.get(bot.user.id).voiceChannel.leave();
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
		message.channel.send("C'est finit !")
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

bot.login(token);
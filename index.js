const Discord = require('discord.js');
const bot = new Discord.Client();
const config = require('config');
const token = config.get('token');


bot.on('ready', () => {
	console.log('Bot is UP !')
	var channel = bot.channels.filter(chan => {
		if (chan.type == 'text')
			return 1;
		else
			return 0;
	}).first();
	// channel.send('LA PUISSANCE est en ligne !');
	bot.user.setPresence('online');
	bot.user.setActivity('être plus puissant', {type: 'PLAYING'});
	// console.log(bot.users);
})

bot.on('message', message => {
	if (message.content.startsWith('lp'))
	{
		msg = message.cleanContent.split(' ');
		switch (msg[1]) {
			case 'test': message.channel.send(`Bravo ${message.author}, le test a REUSSI !`); break;
			case 'norris': message.channel.send(`Chuck Norris est contre les radars automatiques, ça l'éblouie quand il fait du vélo.`); break;
			case 'calcule': calc(msg, message);
			case 'a': rickroll(message);
		}
		// console.log(message);
	}
})

function calc(msg, message) {
	let a = Number(msg[2]), b = Number(msg[4]);
	if ((msg[3] == '/' || msg[3] == '%') && (b == 0))
		message.channel.send(`Oh, mec, c'est pas possible !`);
	else if (a !== a || b !== b)
		message.channel.send(`Il me faut des chiffres !`);
	else {
		switch (msg[3]) {
			case '+': message.channel.send(`${a}+${b} = ${a+b}`); break;
			case '-': message.channel.send(`${a}-${b} = ${a-b}`); break;
			case '/': message.channel.send(`${a}/${b} = ${a/b}`); break;
			case '*': message.channel.send(`${a}*${b} = ${a*b}`); break;
			case '%': message.channel.send(`${a}%${b} = ${a%b}`); break;
			case '^': message.channel.send(`${a}^${b} = ${a**b}`); break;
			default : message.channel.send(`C'est quoi cette opération de mort ? Je connais pas !`)
		}
	}
}

function rickroll(message) {
	let msg = message.content.split(' ');
	let user = msg[2].slice(2,20);
	let trolluser = message.guild.members.get(user);
	console.log(trolluser);
	trolluser.voiceChannel.join().then(() => {
		setTimeout(() => {trolluser.voiceChannel.leave();} , 2000);
	});
}

bot.login(token);
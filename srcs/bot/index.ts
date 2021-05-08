import { Client, Message, MessageEmbed, TextChannel } from 'discord.js';
import { discordToken, botPrefix } from '../../config.json';
import Commands from './commands';
import { GuildMap } from './guild_map';
import Help from './help';

export const bot = new Client();

export var guilds = new GuildMap();


console.log(process.version);

bot.on('ready', () => {
	console.log('Bot is UP !');
	bot.user?.setPresence({ activity: { name: 'être plus puissant' }, status: 'online' });
});

bot.on('message', (message: Message) => {
	if (message.content.startsWith(botPrefix)) {
		const array = message.cleanContent.split(' ');
		if (array.length == 1) 
			return;
		array.shift();
		if (message.guild)
			message.guild.status = guilds.findOrCreate(message.guild.id);
		if (array[0] == 'help')
			Help(message, array, Commands);
		if (array[0] == 'test')
			message.channel.send('Le bot est en ligne !');
		for (const command of Commands) {
			if (command.test(array[0])) {
				command.execute(message, array);
				break;
			}
		}
	}
});

bot.login(discordToken);

process.on('unhandledRejection', (error: any) => {
	if (error.code == 50013) {
		const start = error.path.indexOf('/', 1) + 1;
		const stop = error.path.indexOf('/', start);
		const id = error.path.substring(start, stop);
		const channel = bot.channels.resolve(id);
		if (channel && channel.type == 'text') {
			const text = channel as TextChannel;
			text.send(new MessageEmbed({
				title: 'Erreur',
				description: 'Il me manque des [permissions](https://discordapp.com/developers/docs/topics/permissions) sur ce serveur !\nAdmin, clique [ici](https://discordapp.com/api/oauth2/authorize?client_id=690868423407697920&permissions=8192&scope=bot) !'
			}));
			return;
		}
	}
	console.error(error);
});

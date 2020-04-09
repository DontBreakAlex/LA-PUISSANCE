import { Client, Message, MessageEmbed, TextChannel } from 'discord.js'
import { discordToken } from '../config.json'
import Commands from './commands'
import { GuildMap } from './guild_map'
import Help from './help';
const bot = new Client();

var guilds = new GuildMap();


console.log(process.version)

bot.on('ready', () => {
	console.log('Bot is UP !')
	bot.user?.setPresence({ activity: { name: 'être plus puissant' }, status: 'online' })
})

bot.on('message', (message: Message) => {
	if (message.content.startsWith('lp'))
	{
		let array = message.cleanContent.split(' ');
		if (array.length == 1) return;
		array.shift();
		if (message.guild)
		message.guild.status = guilds.findOrCreate(message.guild.id);
		if (array[0] == 'help')
		Help(message, array, Commands);
		for (let command of Commands) {
			if (command.test(array[0])) {
				command.execute(message, array);
				break;
			}
		}
	}
})

bot.login(discordToken)

process.on('unhandledRejection', (error: any) => {
	if (error.code == 50013) {
		let start = error.path.indexOf('/', 1) + 1
		let stop = error.path.indexOf('/', start)
		let id = error.path.substring(start, stop);
		let channel = bot.channels.resolve(id)
		if (channel && channel.type == 'text') {
			let text = channel as TextChannel
			text.send(new MessageEmbed({
				title: 'Erreur',
				description: `Il me manque des [permissions](https://discordapp.com/developers/docs/topics/permissions) sur ce serveur !\nAdmin, clique [ici](https://discordapp.com/api/oauth2/authorize?client_id=690868423407697920&permissions=8192&scope=bot) !`
			}))
			return;
		}
	}
	console.error(error);
});

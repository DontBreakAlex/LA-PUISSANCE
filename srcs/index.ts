import { Client, Message, Guild } from 'discord.js'
import { discordToken } from '../config.json'
import Commands from './commands'
import { GuildMap, GuildStatus } from './guild_map'
const bot = new Client();

var guilds = new GuildMap();

console.log(process.version)

bot.on('ready', () => {
	console.log('Bot is UP !')
	bot.user?.setPresence({ activity: { name: 'is under heavy dev' }, status: 'online' })
})

bot.on('message', (message: Message) => {
	if (message.content.startsWith('ld'))
	{
		let array = message.cleanContent.split(' ');
		array.shift();
		if (message.guild)
			message.guild.status = guilds.findOrCreate(message.guild.id);
		for (let command of Commands) {
			if (command.test(array[0])) {
				command.execute(message, array);
				break;
			}
		}
	}
})

bot.login(discordToken)

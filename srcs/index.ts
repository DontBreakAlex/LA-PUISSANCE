import { Client, Message } from 'discord.js'
import * as config from '../config.json'
import Commands from './commands'
const bot = new Client();

bot.on('ready', () => {
	console.log('Bot is UP !')
	bot.user?.setPresence({ activity: { name: 'is under heavy dev' }, status: 'online' })
})

bot.on('message', (message: Message) => {
	if (message.content.startsWith('lp'))
	{
		let array = message.cleanContent.split(' ');
		array.shift();
		for (let command of Commands) {
			if (command.test(array[0])) {
				command.execute(message, array);
				break;
			}
		}
	}
})

bot.login(config.discordToken)

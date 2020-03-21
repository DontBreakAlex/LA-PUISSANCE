import { Client } from 'discord.js'
import * as config from '../config.json'
const bot = new Client();

bot.on('ready', () => {
	console.log('Bot is UP !')
	bot.user?.setPresence({ activity: { name: 'is under heavy dev' }, status: 'online' })
})

bot.login(config.discordToken)

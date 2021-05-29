import { fork } from 'child_process';
import { join } from 'path';
import { BotReceived, Commands, Messages, PlaySound, ProducedUrl } from '../server/messages';
import { bot, guilds } from '.';
import { Playing } from './guild_map';
import { bindToDispatcher } from './utils';

export default new class Server {
	private child
	private counter = 0
	private map = new Map<number, (a: any) => void>()

	constructor() {
		const path = join(__dirname, '../server');
		this.child = fork(path, [], {
			stdio: ['ignore', 'inherit', 'inherit', 'ipc']
		});
		this.child.on('exit', (code => console.error(`Server exited with code ${code}`)));
		this.child.on('error', err => console.error(`Server error ${err}`));
		this.child.on('close', code => console.error(`Server close ${code}`));
		this.child.on('disconnect', () => console.error('Server disconnected'));
		this.child.on('message', this.onMessage.bind(this));
	}

	private onMessage(message: BotReceived) {
		switch (message.message.cmd) {
			case Commands.ProducedUrl:
				this.map.get(message.cnt!)?.(message.message);
				this.map.delete(message.cnt!);
				break;
			case Commands.PlaySound:
				this.PlaySound(message.message);
				break;
		}
	}

	private async PlaySound(message: PlaySound) {
		const guild = await bot.guilds.fetch(message.user.guid);
		if (!guild) 
			return;
		const status = guilds.findOrCreate(message.user.guid);
		const member = guild.member(message.user.uid);
		if (!member || !member.voice.channel)
			return;
		if (status.playing != Playing.None) 
			return;
		status.playing = Playing.Generic;
		const vChannel = member.voice.channel;
		const connection = await vChannel.join();
		const dispatcher = connection.play(message.url);
		bindToDispatcher(dispatcher, () => {
			vChannel.leave();
			status.playing = Playing.None;
		});
		status.dispatcher = dispatcher;
		status.voice = connection;
	}

	private sendMessage(message: Messages, cnt?: number) {
		this.child.send({ message, cnt });
	}

	public CreateLoginUrl(user: { uid: string; guid: string }): Promise<string> {
		const cnt = this.counter++;
		return new Promise(resolve => {
			this.map.set(cnt, (a: ProducedUrl) => {
				resolve(a.url);
			});
			this.sendMessage({ cmd: Commands.ProduceUrl, user }, cnt);
		});
	}
};

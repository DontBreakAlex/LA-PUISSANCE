import { fork } from 'child_process';
import { join } from 'path';
import { BotReceived, Commands, Messages, ProducedUrl } from '../server/messages';

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
		this.map.get(message.cnt)?.(message.message);
		this.map.delete(message.cnt);
	}

	private sendMessage(message: Messages, cnt?: number) {
		this.child.send({ message, cnt });
	}

	public CreateLoginUrl(userId: string): Promise<string> {
		const cnt = this.counter++;
		return new Promise(resolve => {
			this.map.set(cnt, (a: ProducedUrl) => {
				resolve(a.url);
			});
			this.sendMessage({ cmd: Commands.ProduceUrl, uid: userId }, cnt);
		});
	}
};

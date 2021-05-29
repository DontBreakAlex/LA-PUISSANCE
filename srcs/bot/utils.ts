import type { StreamDispatcher } from 'discord.js';

export function bindToDispatcher(dispatcher: StreamDispatcher, cb: () => void): void {
	dispatcher.on('error', err => console.error(err));
	dispatcher.on('warn', err => console.warn(err));
	dispatcher.on('finish', cb);
}

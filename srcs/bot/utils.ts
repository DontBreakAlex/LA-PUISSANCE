import { StreamDispatcher } from 'discord.js';

/** WARNING:
 * 		This file suffers from code duplication
 */

export function bindToDispatcher(dispatcher: StreamDispatcher, cb: () => void) {
	dispatcher.on('error', err => console.error(err));
	dispatcher.on('warn', err => console.warn(err));
	dispatcher.on('finish', cb);
}

import { PlayerQueue } from './player';
import { StreamDispatcher, VoiceConnection } from 'discord.js';

declare module 'discord.js' {
	interface Guild {
		status: GuildStatus;
	}
}

enum Playing {
	None,
	Urss,
	Rick,
	Queue,
	Generic
}

class GuildStatus {
	count = 0;
	playing: Playing = Playing.None;
	dispatcher?: StreamDispatcher;
	queue: PlayerQueue = new PlayerQueue(this);
	voice?: VoiceConnection;
}

class GuildMap extends Map<string, GuildStatus> {
	findOrCreate(id: string): GuildStatus {
		if (!this.has(id))
			this.set(id, new GuildStatus());
		return <GuildStatus>this.get(id);
	}
}

export { GuildStatus, GuildMap, Playing };

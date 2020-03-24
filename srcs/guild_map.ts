import { Guild, StreamDispatcher } from 'discord.js'

declare module 'discord.js' {
	interface Guild {
		status: GuildStatus;
	}
}

enum Playing {
	None,
	Urss,
	Rick,
	Queue
}

class GuildStatus {
	count: number = 0;
	playing: Playing = Playing.None;
	dispatcher?: StreamDispatcher;
}

class GuildMap extends Map<String, GuildStatus> {
	findOrCreate(id: String): GuildStatus {
		if (!this.has(id))
			this.set(id, new GuildStatus());
		return <GuildStatus>this.get(id);
	}
}

export { GuildStatus, GuildMap, Playing }

import type { User } from './serverTypes';

export type Messages = ProduceUrl

export type ProduceUrl = {
	cmd: Commands.ProduceUrl,
	user: User
}

export type ProducedUrl = {
	cmd: Commands.ProducedUrl,
	url: string
}

export type PlaySound = {
	cmd: Commands.PlaySound,
	user: User,
	url: string
}

export enum Commands {
	ProduceUrl,
	ProducedUrl,
	PlaySound
}

export type ServerReceived =
	{
		message: ProduceUrl,
		cnt: number
	}

export type BotReceived = {
	message: ProducedUrl | PlaySound
	cnt?: number
}

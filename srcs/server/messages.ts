export type Messages = ProduceUrl

export type ProduceUrl = {
	cmd: Commands.ProduceUrl,
	user: {
		uid: string
		guid: string
	}
}

export type ProducedUrl = {
	cmd: Commands.ProducedUrl,
	url: string
}

export enum Commands {
	ProduceUrl,
	ProducedUrl
}

export type ServerReceived =
	{
		message: ProduceUrl,
		cnt: number
	}

export type BotReceived = {
	message: ProducedUrl,
	cnt: number
}

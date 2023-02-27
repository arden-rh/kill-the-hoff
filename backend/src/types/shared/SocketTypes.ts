import { Highscore } from "@prisma/client"
export {}

export interface ServerToClientEvents {
	hello: () => void
}

export interface ClientToServerEvents {
	getHighscore: (callback: (highscore: Highscore[]) => void) => void
}

export interface InterServerEvents {
}

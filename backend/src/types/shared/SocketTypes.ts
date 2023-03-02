import { Game } from "@prisma/client"
export {}

export interface ServerToClientEvents {
	hello: () => void
}

export interface ClientToServerEvents {
	userJoinLobby: (username: string) => void
	userPlayGame: (name: string, callback: (game: Game) => void) => void
}

export interface InterServerEvents {
}

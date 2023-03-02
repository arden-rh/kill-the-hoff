import { User, Score, Game } from "@prisma/client"
export {}

export interface ServerToClientEvents {
	hello: () => void
}

export interface ClientToServerEvents {
	userJoinLobby: (username: string) => void
	getUsers: (callback: (users: User[]) => void) => void
	getScores: (callback: (scores: Score[]) => void) => void
	userPlayGame: (name: string, callback: (game: Game) => void) => void
}

export interface InterServerEvents {
}

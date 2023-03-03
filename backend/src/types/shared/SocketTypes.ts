import { Game, Score, User } from "@prisma/client"
export { User }

export interface ServerToClientEvents {
	hello: () => void
	updateUsers: (users: User[]) => void
}

export interface ClientToServerEvents {
	userJoinLobby: (username: string, callback: (users: User[]) => void) => void
	userPlayGame: (name: string, callback: (game: Game) => void) => void
}

export interface InterServerEvents {
}

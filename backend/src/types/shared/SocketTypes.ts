import { Game, Score, User } from "@prisma/client"
export { User }

export interface ServerToClientEvents {
	hello: () => void
	updateUsers: (users: User[]) => void
}

export interface ClientToServerEvents {
	userJoinLobby: (username: string, callback: (data: LobbyInfoData) => void) => void
	userPlayGame: (name: string, callback: (game: Game) => void) => void
}

export interface InterServerEvents {
}

export interface LobbyInfoData {
	users: User[]
	games: Game[]
}

export interface UserJoinLobbyResult {
	data: LobbyInfoData | null
}

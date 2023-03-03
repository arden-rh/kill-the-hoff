import { User, Score } from "@prisma/client"
export { User }

export interface ServerToClientEvents {
	hello: () => void
	updateUsers: (users: User[]) => void
}

export interface ClientToServerEvents {
	userJoinLobby: (username: string, callback: (users: User[]) => void) => void
	getUsers: (callback: (users: User[]) => void) => void
	getScores: (callback: (scores: Score[]) => void) => void
}

export interface InterServerEvents {
}

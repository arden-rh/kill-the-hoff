import { Game, Score, User } from "@prisma/client"
export { Game, Score, User }

export interface ServerToClientEvents {
	hello: () => void
	updateLobby: (data: LobbyInfoData) => void
	updateLobbyUsers: (users: User[]) => void
	updateLobbyGames: (gamesOngoing: Game[], gamesFinished: Game[]) => void
	gameLogicCoordinates: (rowStart : number, columnStart: number, timer: number) => void
}

export interface ClientToServerEvents {
	userJoinLobby: (username: string, callback: (data: LobbyInfoData) => void) => void
	userPlayGame: (name: string, callback: (game: Game) => void) => void
	startGameRound: (callback: () => void) => void
	roundResult: (game: Game, playerId: string, player: string, round: number, result: number) => void
}

export interface InterServerEvents {
}

export interface LobbyInfoData {
	users: User[]
	gamesOngoing: Game[]
	gamesFinished: Game[]
	scores: Score[]
}

export interface UserJoinLobbyResult {
	data: LobbyInfoData | null
}

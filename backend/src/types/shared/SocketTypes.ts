import { Game, Score, User } from "@prisma/client"
export { Game, Score, User }

export interface ServerToClientEvents {
	hello: () => void
	updateLobby: (data: LobbyInfoData) => void
	updateLobbyUsers: (users: User[]) => void
	updateLobbyGames: (gamesOngoing: Game[], gamesFinished: Game[]) => void
	updateLobbyGamesOngoing: (gamesOngoing: Game[]) => void
	updateGameInfo: (playerTwoName: string) => void
	newGameRound: (game: Game, round: number, rowStart : number, columnStart: number, timer: number) => void
	roundResult: (game: Game, responseTime: number) => void
	updateResponseTime: (gameOwner: boolean, responseTime: number) => void
	updatePoints: (isPlayerOne: boolean, points: number) => void
	endGame: (game: Game) => void
	getScores: (score:Score[]) => void

}

export interface ClientToServerEvents {
	userJoinLobby: (username: string, callback: (data: LobbyInfoData) => void) => void
	userPlayGame: (name: string, callback: (game: Game) => void) => void
	startGame: (game: Game) => void
	roundResult: (game: Game, responseTime: number) => void
	callHighscore:() => void


}

export interface InterServerEvents {
}


export interface LobbyInfoData {
	users: User[]
	gamesOngoing: Game[]
	gamesFinished: Game[]
	scores:Score[]
}

export interface UserJoinLobbyResult {
	data: LobbyInfoData | null
}

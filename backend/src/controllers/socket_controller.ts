import Debug from 'debug'
import { Socket, Server } from 'socket.io'
import { Game } from '@prisma/client'
import { ClientToServerEvents, LobbyInfoData, ServerToClientEvents } from '../types/shared/SocketTypes'
import { createUser, deleteUser, getUsers } from '../services/user_service'
import { createScore, getScores} from '../services/score_service'
import { createGame, deleteGame, endGame, getAvailableGame, getGamesFinished, getGamesOngoing, getResponseTimes, increasePoints, joinGame, updateGame, } from '../services/game_service'

const debug = Debug('hoff:socket_controller')

/**
 * Get a random number
 * @param max
 * @returns
 */
const getRandomNumber = (max: number) => {
	return Math.ceil( Math.random() * max );
}

/**
 * Get a random delay
 * @param max
 * @returns
 */
const getRandomDelay = (max: number) => {
	return Math.ceil( Math.random() * max * 1000 + 1000);
}

/**
 * Handle connection between client and server
 * @param socket
 * @param io
 */
export const handleConnection = (socket: Socket<ClientToServerEvents, ServerToClientEvents>, io: Server<ClientToServerEvents, ServerToClientEvents>) => {
	debug("✅ User connected:", socket.id)

	// Listen for user to connect and update Highscore
	socket.on('callHighscore', async () =>{
		const score = await getScores()
			io.emit('getScores',score )

	})

	socket.on('userJoinLobby', async (username, callback) => {
		const user = await createUser(socket.id, username)
		debug("🙋 User added to database:", user)

		const data: LobbyInfoData = {
			users: await getUsers(),
			gamesOngoing: await getGamesOngoing(),
			gamesFinished: await getGamesFinished(),
			scores: await getScores()
		}

		socket.broadcast.emit('updateLobby', data)
		callback(data)
	})

	/**
	 * Listen to when a user wants to play a game (Start game or join existing game)
	 * Update lobby and game with user, games ongoing and games finished
	 */
	socket.on('userPlayGame', async (username, callback) => {
		debug("🙋 User wants to play:", username)

		const availableGame = await getAvailableGame()
		let game: Game
		if (availableGame) {
			game = await joinGame(availableGame.id, socket.id, username)
			debug(`👾 ${username} joined game:`, game)
		} else {
			game = await createGame(socket.id, username)
			debug(`👾 ${username} created game:`, game)
		}

		debug("User joins game:", username, socket.id)

		socket.join(game.id)
		socket.broadcast.emit('updateLobbyGames', await getGamesOngoing(), await getGamesFinished())
		socket.broadcast.to(game.id).emit('updateGameInfo', username)
		callback(game)
	})

	/**
	 * Emit the randomized y- and x-positions and the randomized delay, to the game
	 * @param game
	 * @param round
	 */
	const newGameRound = (game: Game, round: number) => {
		const rowStart = getRandomNumber(10)
		const columnStart = getRandomNumber(10)
		const delayTimer = getRandomDelay(8)

		io.to(game.id).emit('newGameRound', game, round, rowStart, columnStart, delayTimer)
	}

	/**
	 * Listen to when a client requests a new game
	 */
	socket.on('startGame', async (game) => {
		newGameRound(game, 0)
	})

	/**
	 * Log results from round
	 */
	socket.on('roundResult', async (game, responseTime) => {

		const gameOwner = (game.playerOneId === socket.id) ? true : false
		socket.broadcast.to(game.id).emit('updateResponseTime', gameOwner, responseTime)

		const updatedGame = await updateGame(game.id, gameOwner, responseTime)

		const round = updatedGame.playerOneResponseTimes.length

		debug("Storing response time for round:", round)

		if (updatedGame.playerOneResponseTimes.length === updatedGame.playerTwoResponseTimes.length) {
			debug("Second result came in, let's store in database. Round:", round)
			const playerOneResponseTime: number = updatedGame.playerOneResponseTimes[updatedGame.playerOneResponseTimes.length-1]
			const playerTwoResponseTime: number = updatedGame.playerTwoResponseTimes[updatedGame.playerTwoResponseTimes.length-1]

			if (playerOneResponseTime < playerTwoResponseTime) {
				io.to(game.id).emit('updatePoints', true, updatedGame.playerOnePoints+1)
				await increasePoints(updatedGame.id, true, updatedGame.playerOnePoints+1)
				debug("Increasing points for round:", round)
			} else if (playerOneResponseTime > playerTwoResponseTime) {
				io.to(game.id).emit('updatePoints', false, updatedGame.playerTwoPoints+1)
				await increasePoints(updatedGame.id, false, updatedGame.playerTwoPoints+1)
				debug("Increasing points for round:", round)
			}

			socket.broadcast.emit('updateLobbyGamesOngoing', await getGamesOngoing())

			if (round >= 10) {
				debug("Reached 10 rounds", round)
				const finalGame = await endGame(game.id)
				io.to(game.id).emit('endGame', finalGame)
				io.emit('updateLobbyGames', await getGamesOngoing(), await getGamesFinished())

				// Store both players scores in Score

				// Get all players response time
				const playersResponseTimes = await getResponseTimes(game.id)

				// Get average time from  player 1
				const sum1 = playersResponseTimes?.playerOneResponseTimes.reduce((partialSum, a) => partialSum + a, 0);
				const average1 = sum1!/10

				// Get average time from player 2
				const sum2 = playersResponseTimes?.playerTwoResponseTimes.reduce((partialSum, a) => partialSum + a, 0);
				const average2 = sum2!/10

				// Get the fastest click from both player
				const fastest1 = Math.min(...playersResponseTimes!.playerOneResponseTimes)
				const fastest2 = Math.min(...playersResponseTimes!.playerTwoResponseTimes)

				// Create document of players to database on table "Score"
				await createScore(game.playerOneName,average1,fastest1)
				await createScore(game.playerTwoName, average2,fastest2)

				// Get all score tabels and send to front end
				const score = await getScores()
				io.emit('getScores',score )

			} else {
				newGameRound(game, round)
			}
		} else {
			debug("First result came in, waiting for second. Round:", round)
		}
	})

	/**
	 * Handle if a user disconnects
	 */

	socket.on('disconnect', async () => {
		debug("❌ User disconnected:", socket.id)

		const availableGame = await getAvailableGame()

		// Delete the game if the owner of the game disconnects
		if (availableGame && availableGame.playerOneId === socket.id) {
			await deleteGame(availableGame.id)
			socket.broadcast.emit('updateLobbyGames', await getGamesOngoing(), await getGamesFinished())
		}

		await deleteUser(socket.id)
		socket.broadcast.emit('updateLobbyUsers', await getUsers())
	})
}

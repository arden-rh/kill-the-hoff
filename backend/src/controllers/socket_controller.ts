import Debug from 'debug'
import { Socket, Server } from 'socket.io'
import { Game } from '@prisma/client'
import { ClientToServerEvents, LobbyInfoData, ServerToClientEvents } from '../types/shared/SocketTypes'
import { createUser, deleteUser, getUsers } from '../services/user_service'
import { averageTime, getScores } from '../services/score_service'
import { createGame, deleteGame, endGame, getAvailableGame, getGamesFinished, getGamesOngoing, increasePoints, joinGame, updateGame } from '../services/game_service'

const debug = Debug('hoff:socket_controller')

const getRandomNumber = (max : number) => {
	return Math.ceil( Math.random() * max );
}

const getRandomDelay = (max : number) => {
	return Math.ceil( Math.random() * max * 1000 + 1000);
}

export const handleConnection = (socket: Socket<ClientToServerEvents, ServerToClientEvents>, io: Server<ClientToServerEvents, ServerToClientEvents>) => {
	debug("✅ User connected:", socket.id)

	socket.on('userJoinLobby', async (username, callback) => {
		// debug("🙋 User wants to join lobby:", socket.id, username)
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

	socket.on('userPlayGame', async (username, callback) => {
		// debug("🙋 User wants to play:", username)
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

	const newGameRound = (game: Game, round: number) => {
		const rowStart = getRandomNumber(10)
		const columnStart = getRandomNumber(10)
		const delayTimer = getRandomDelay(8)

		io.to(game.id).emit('newGameRound', game, round, rowStart, columnStart, delayTimer)
	}

	socket.on('startGame', async (game) => {
		newGameRound(game, 0)
	})

	socket.on('roundResult', async (game, responseTime) => {
		const gameOwner = (game.playerOneId === socket.id) ? true : false
		socket.broadcast.to(game.id).emit('updateResponseTime', gameOwner, responseTime)

		const updatedGame = await updateGame(game.id, gameOwner, responseTime)
		const round = updatedGame.playerOneResponseTimes.length
		debug("Storing response time for round:", round)
		// debug("🎯 Updated game:", updatedGame)

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
				socket.broadcast.emit('updateLobbyGames', await getGamesOngoing(), await getGamesFinished())
				// store both players scores in Score
				if(gameOwner){
				const storeScore = await averageTime(game.playerOneName, responseTime)
				debug('player one score is sent to server', storeScore)
				}
				else{
					const storeScore = await averageTime (game.playerTwoName, responseTime)
					debug('player two score is sent to server', storeScore)
				}

			} else {
				newGameRound(game, round)
			}
		} else {
			debug("First result came in, waiting for second. Round:", round)
		}
	})

	socket.on('disconnect', async () => {
		debug("❌ User disconnected:", socket.id)
		const availableGame = await getAvailableGame()
		if (availableGame && availableGame.playerOneId === socket.id) {
			await deleteGame(availableGame.id)
			socket.broadcast.emit('updateLobbyGames', await getGamesOngoing(), await getGamesFinished())
		}
		await deleteUser(socket.id)
		socket.broadcast.emit('updateLobbyUsers', await getUsers())
	})
}

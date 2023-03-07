import Debug from 'debug'
import { Socket, Server } from 'socket.io'
import { Game } from '@prisma/client'
import { ClientToServerEvents, LobbyInfoData, ServerToClientEvents } from '../types/shared/SocketTypes'
import { createUser, deleteUser, getUsers } from '../services/user_service'
import { getScores } from '../services/score_service'
import { createGame, deleteGame, getAvailableGame, getGames, getGamesFinished, getGamesOngoing, joinGame, updateGame } from '../services/game_service'

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
		debug("🙋 User wants to join lobby:", socket.id, username)
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

	socket.on('requestGameRound', async (game) => {
		debug("User requests a game round", game)

		const rowStart = getRandomNumber(10)
		const columnStart = getRandomNumber(10)
		const delayTimer = getRandomDelay(8)

		io.to(game.id).emit('gameLogicCoordinates', rowStart, columnStart, delayTimer, game)
	})

	socket.on('roundResult', async (game, responseTime) => {
		const gameOwner = (game.playerOneId === socket.id) ? true : false
		const updatedGame = await updateGame(game.id, gameOwner, responseTime)
		debug("Updated game:", updatedGame)
		if (updatedGame.playerOneResponseTimes.length === updatedGame.playerTwoResponseTimes.length) {

			console.log(`playerOneResponseTimes${updatedGame.playerOneResponseTimes}, playerTwoResponseTimes${updatedGame.playerTwoResponseTimes}`)

			const playerOneTime : number = [...updatedGame.playerOneResponseTimes].pop()!
			const playerTwoTime : number = [...updatedGame.playerTwoResponseTimes].pop()!

			console.log(playerOneTime, playerTwoTime)

			if (playerOneTime! < playerTwoTime!) {

				updatedGame.playerOneScore + 1

				socket.emit('roundResult', game, responseTime)


				return console.log(`${playerOneTime} is lower than ${playerTwoTime}, 1 point to player one`)

			} else if (playerOneTime! > playerTwoTime!) {

				updatedGame.playerTwoScore + 1

				socket.emit('roundResult', game, responseTime)

				return console.log(`${playerTwoTime} is lower than ${playerOneTime}, 1 point to player two`)

			}
			if (updatedGame.playerOneResponseTimes.length === 10) {
				// finishGame()
			} else {
				console.log("Kör ny runda")
			}
		} else {
			console.log("Vänta, kör inte ny runda")
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

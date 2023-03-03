import Debug from 'debug'
import { Socket } from 'socket.io'
import { Game } from '@prisma/client'
import { ClientToServerEvents, LobbyInfoData, ServerToClientEvents } from '../types/shared/SocketTypes'
import { createUser, deleteUser, getUsers } from '../services/user_service'
import { getScores } from '../services/score_service'
import { createGame, getAvailableGame, getGames, getGamesFinished, getGamesOngoing, joinGame } from '../services/game_service'

const debug = Debug('hoff:socket_controller')

export const handleConnection = (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
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
		socket.join(game.id)
		socket.broadcast.emit('updateLobbyGames', await getGamesOngoing(), await getGamesFinished())
		callback(game)
	})

	socket.on('disconnect', async () => {
		debug("❌ User disconnected:", socket.id)
		await deleteUser(socket.id)
		socket.broadcast.emit('updateLobbyUsers', await getUsers())
	})
}

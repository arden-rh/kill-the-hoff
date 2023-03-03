import Debug from 'debug'
import { Socket } from 'socket.io'
import { Game } from '@prisma/client'
import { ClientToServerEvents, LobbyInfoData, ServerToClientEvents } from '../types/shared/SocketTypes'
import { createUser, deleteUser, getUsers } from '../services/user_service'
import { getScores } from '../services/score_service'
import { createGame, getAvailableGame, getGames, joinGame } from '../services/game_service'

const debug = Debug('hoff:socket_controller')

export const handleConnection = (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
	debug("✅ User connected:", socket.id)

	socket.on('userJoinLobby', async (username, callback) => {
		debug("🙋 User wants to join lobby:", socket.id, username)
		const user = await createUser(socket.id, username)
		debug("🙋 User added to database:", user)

		const users = await getUsers()
		const games = await getGames()

		socket.broadcast.emit('updateUsers', users)

		const data : LobbyInfoData = {
			users,
			games
		}
		callback(data)
	})

	// socket.on('getUsers', async callback => {
	// 	const users = await getUsers()
	// 	debug("🙋🙋 Users requested:", users)
	// 	callback(users)
	// })

	// socket.on('getScores', async callback => {
	// 	const scores = await getScores()
	// 	debug("🎖️ Scores requested:", scores)
	// 	callback(scores)
	// })

	socket.on('userPlayGame', async (username, callback) => {
		debug("🙋 User wants to play:", username)
		const availableGame = await getAvailableGame()
		let game: Game
		if (availableGame) {
			game = await joinGame(availableGame.id, username)
			debug(`👾 ${username} joined game:`, game)
		} else {
			game = await createGame(username)
			debug(`👾 ${username} created game:`, game)
		}
		socket.join(game.id)
		callback(game)
	})

	socket.on('disconnect', async () => {
		debug("❌ User disconnected:", socket.id)
		await deleteUser(socket.id)
	})
}

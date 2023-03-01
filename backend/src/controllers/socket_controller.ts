import Debug from 'debug'
import { Socket } from 'socket.io'
import { ClientToServerEvents, ServerToClientEvents } from '../types/shared/SocketTypes'
import { createUser, deleteUser, getUsers } from '../services/user_services'
import { getScores } from '../services/score_services'

const debug = Debug('hoff:socket_controller')

export const handleConnection = (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
	debug("✅ User connected:", socket.id)

	socket.on('userJoinLobby', async username => {
		debug("🙋 User wants to join lobby:", socket.id, username)
		const user = await createUser(socket.id, username)
		debug("🙋 User added to database:", user)
	})

	socket.on('getUsers', async callback => {
		const users = await getUsers()
		debug("🙋🙋 Users requested:", users)
		callback(users)
	})

	socket.on('getScores', async callback => {
		const scores = await getScores()
		debug("🎖️ Scores requested:", scores)
		callback(scores)
	})

	socket.on('disconnect', async () => {
		debug("❌ User disconnected:", socket.id)
		await deleteUser(socket.id)
	})
}

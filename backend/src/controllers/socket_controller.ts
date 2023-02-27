import Debug from 'debug'
import { Socket } from 'socket.io'
import { ClientToServerEvents, ServerToClientEvents } from '../types/shared/SocketTypes'
import prisma from '../prisma'

const debug = Debug('chat:socket_controller')

export const handleConnection = (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
	debug('✅ User connected:', socket.id)

	socket.on('getHighscore', async callback => {
		const highscore = await prisma.highscore.findMany()
		debug('🎖️ Highscore request:', highscore)
		callback(highscore)
	})

	socket.on('disconnect', () => {
		debug('❌ User disconnected:', socket.id)
	})
}

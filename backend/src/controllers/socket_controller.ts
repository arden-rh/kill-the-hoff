import Debug from 'debug'
import { Socket } from 'socket.io'
import { ClientToServerEvents, ServerToClientEvents } from '../types/shared/SocketTypes'
import prisma from '../prisma'

const debug = Debug('chat:socket_controller')

export const handleConnection = (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
	debug('✅ A user connected', socket.id)

	debug('👋 Said hello to the user')
	socket.emit('hello')

	socket.on('disconnect', () => {
		debug('❌ A user disconnected', socket.id)
	})
}
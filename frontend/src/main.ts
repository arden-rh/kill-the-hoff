import './assets/scss/style.scss'
import { io, Socket } from 'socket.io-client'
import { ClientToServerEvents, ServerToClientEvents } from '@backend/types/shared/SocketTypes'

const SOCKET_HOST = import.meta.env.VITE_APP_SOCKET_HOST

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(SOCKET_HOST)

socket.on('connect', () => {
	console.log('💥 Connected to the server', socket.id)

	socket.emit('getHighscore', highscore => {
		console.log(highscore)
	})

})

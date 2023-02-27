import './assets/scss/style.scss'
import { io, Socket } from 'socket.io-client'
import { ClientToServerEvents, ServerToClientEvents } from '@backend/types/shared/SocketTypes'

const SOCKET_HOST = import.meta.env.VITE_APP_SOCKET_HOST

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(SOCKET_HOST)

socket.on('connect', () => {
	console.log('💥 Connected to the server, socket id:', socket.id)

	socket.emit('getHighscore', highscores => {
		highscores.sort((a, b) => a.avgTime - b.avgTime)
		const appEl = document.querySelector('#app') as HTMLDivElement
		appEl.innerHTML = highscores.map(highscore => `<p>${highscore.name} ${highscore.avgTime}</p>`).join('')
	})
})

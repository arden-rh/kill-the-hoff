import './assets/scss/style.scss'
import { io, Socket } from 'socket.io-client'
import { ClientToServerEvents, ServerToClientEvents } from '@backend/types/shared/SocketTypes'

const SOCKET_HOST = import.meta.env.VITE_APP_SOCKET_HOST

const boardEl = document.querySelector('#board') as HTMLDivElement
const testingEl = document.querySelector('#testing') as HTMLDivElement

const var1 = 3
const var2 = 5

boardEl.addEventListener('click', () => {
	testingEl.classList.add('black')
	// testingEl.style.gridArea = "4 / 5 / 5 / 6"
	testingEl.style.gridArea = `${var1} / ${var2} / ${var1 + 1 } / ${var2 + 1}`

})

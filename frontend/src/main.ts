import './assets/scss/style.scss'
import { io, Socket } from 'socket.io-client'
import { ClientToServerEvents, ServerToClientEvents } from '@backend/types/shared/SocketTypes'

const SOCKET_HOST = import.meta.env.VITE_APP_SOCKET_HOST

// Forms
const usernameFormEl = document.querySelector('#username-form') as HTMLFormElement

// Views
const lobbyEl = document.querySelector('#lobby') as HTMLDivElement
const boardEl = document.querySelector('#game') as HTMLDivElement

// User Detail
let username: string | null = null

// Show board view
const showBoardView = () => {
	lobbyEl.classList.add('hide')
	boardEl.classList.remove('hide')
}

// Show lobby view
const showLobbyView = () => {
	lobbyEl.classList.remove('hide')
	boardEl.classList.add('hide')
}

usernameFormEl.addEventListener('submit', e => {
	e.preventDefault()

	username = (usernameFormEl.querySelector('#username') as HTMLInputElement).value.trim()

	// If no username, NO CHAT FOR YOU
	if (!username) {
		return
	}

	console.log(username)

	// Show board
	showBoardView()
})

showLobbyView()

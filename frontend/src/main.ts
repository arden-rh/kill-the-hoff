import './assets/scss/style.scss'
import { io, Socket } from 'socket.io-client'
import { ClientToServerEvents, ServerToClientEvents, User } from '@backend/types/shared/SocketTypes'

const SOCKET_HOST = import.meta.env.VITE_APP_SOCKET_HOST

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(SOCKET_HOST)

/**
 * Queries
 */

// Forms
const usernameFormEl = document.querySelector('#username-form') as HTMLFormElement

// Views
const welcomeViewEl = document.querySelector('#welcome-view-wrapper') as HTMLDivElement
const lobbyEl = document.querySelector('#lobby-view') as HTMLDivElement
const gameEl = document.querySelector('#game-view') as HTMLDivElement

// Buttons
const playBtnEl = document.querySelector('#play-btn') as HTMLButtonElement

// Views in lobby
const usersOnlineEl = document.querySelector('#users-online') as HTMLUListElement

// User Detail
let username: string

/**
 * Connection to server and get socket id
 */
socket.on('connect', () => {
	console.log('💥 Connected to the server, socket id:', socket.id)

	// socket.emit('getScores', scores => {
	// 	scores.sort((a, b) => a.avgTime - b.avgTime)
	// 	const appEl = document.querySelector('#app') as HTMLDivElement
	// 	appEl.innerHTML = scores.map(highscore => `<p>${highscore.name} ${highscore.avgTime}</p>`).join('')
	// })
})

/**
 * Get username from form, add to online users list and get that list
 */
usernameFormEl.addEventListener('submit', e => {
	e.preventDefault()

	username = (usernameFormEl.querySelector('#username') as HTMLInputElement).value.trim()

	if (!username) {
		return
	}

	socket.emit('userJoinLobby', username, (users) => {
		updateOnlineUsers(users)
	})

	showLobbyView()
})

/**
 * Update online user list
 */
const updateOnlineUsers = (users: User[]) => {
	usersOnlineEl.innerHTML = users
		.map(user => `<li>${user.name}</li>`)
		.join('')
}

/**
 * Listen to updated online users list
 */
socket.on('updateUsers', (users) => {
	updateOnlineUsers(users)
})

/**
 * Show lobby view
 */
const showLobbyView = () => {
	welcomeViewEl.classList.add('hide')
}

/**
 * Show game view
 */
const showGameView = () => {
	lobbyEl.classList.add('hide')
	gameEl.classList.remove('hide')
}

/**
 * Listen to play-button
 */
playBtnEl.addEventListener('click', e => {
	e.preventDefault()
	socket.emit('userPlayGame', username, (game) => {
		if (game.timeStarted === 0) {
			console.log("Game created, waiting for another player:", game)
		} else {
			console.log("Second player joined game:", game)
			showGameView()
		}
	})
})

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

// Views in game-view
const waitingNoticeEl = document.querySelector('#waiting-notice') as HTMLDivElement
const countdownNoticeEl = document.querySelector('#countdown-notice') as HTMLDivElement

// User Detail
let username: string

// Show elements
const showElement = (element: HTMLElement) => {
	element.classList.remove('hide')
}

// Hide elements
const hideElement = (element: HTMLElement) => {
	element.classList.add('hide')
}

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
	hideElement(welcomeViewEl)
}

/**
 * Show game view
 */
const showGameView = () => {
	hideElement(lobbyEl)
	showElement(gameEl)
}

const countdown = () => {

	let counter = 5;

	const countdown = setInterval(() => {
		countdownNoticeEl.innerHTML = `<span>You are playing against ${username} in ${counter}</span>`
		console.log(`${counter}`)
		counter--
		if (counter === -1) {
			clearInterval(countdown)
		}
	}, 1000);

}

/**
 * Listen to play-button
 */
playBtnEl.addEventListener('click', e => {
	e.preventDefault()
	socket.emit('userPlayGame', username, (game) => {
		if (game.timeStarted === 0) {
			console.log("Game created, waiting for another player:", game)
			hideElement(countdownNoticeEl)
			waitingNoticeEl.innerHTML = `<p>Waiting for another player..</p>`
		} else {
			console.log("Second player joined game:", game)

			countdown()
		}

		showGameView()
	})
})

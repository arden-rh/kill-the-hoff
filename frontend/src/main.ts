import './assets/scss/style.scss'
import './assets/game'
import { io, Socket } from 'socket.io-client'
import { ClientToServerEvents, Game, ServerToClientEvents, User } from '@backend/types/shared/SocketTypes'
import { countdownNoticeEl, startGame, waitingNoticeEl } from './assets/game'

export const SOCKET_HOST = import.meta.env.VITE_APP_SOCKET_HOST

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(SOCKET_HOST)

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
const gamesFinishedEl = document.querySelector('#games-finished') as HTMLUListElement
const gamesOngoingEl = document.querySelector('#games-ongoing') as HTMLUListElement

// User Detail
export let username: string
let gameOwner: boolean

// Show elements
export const showElement = (element: HTMLElement) => {
	element.classList.remove('hide')
}

// Hide elements
export const hideElement = (element: HTMLElement) => {
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
 * Listen for reconnection and emit userJoinLobby again
 */
socket.io.on('reconnect', () => {
	console.log('✅ Reconnected to the server')
	if (username) {
		socket.emit('userJoinLobby', username, (callbackData) => {
			updateOnlineUsers(callbackData.users)
		})
	}
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

	socket.emit('userJoinLobby', username, (callbackData) => {
		updateOnlineUsers(callbackData.users)
		updateGamesList(gamesOngoingEl, callbackData.gamesOngoing)
		updateGamesList(gamesFinishedEl, callbackData.gamesFinished)
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
 * Update list of games, specify element 'ongoing' or 'finished' as first parameter
 */
const updateGamesList = (element: HTMLElement, games: Game[]) => {
	element.innerHTML = games
		.map(game => `<li>${game.playerOneName}-${game.playerTwoName} ${game.playerOneScore}-${game.playerTwoScore}</li>`)
		.join('')
}

/**
 * Listen to updated Lobby information
 */
socket.on('updateLobby', (data) => {
	updateOnlineUsers(data.users)
	updateGamesList(gamesOngoingEl, data.gamesOngoing)
	updateGamesList(gamesFinishedEl, data.gamesFinished)
})

/**
 * Listen to updated list of users in lobby
 */
socket.on('updateLobbyUsers', (users) => {
	updateOnlineUsers(users)
})

/**
 * Listen to updated list of games
 */
socket.on('updateLobbyGames', (gamesOngoing, gamesFinished) => {
	updateGamesList(gamesOngoingEl, gamesOngoing)
	updateGamesList(gamesFinishedEl, gamesFinished)
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
const showGameView = (game: Game, gameOwner: boolean) => {
	hideElement(lobbyEl)
	showElement(gameEl)

	startGame(game, gameOwner)
}

const player1NameEl = document.querySelector('#player-1-name') as HTMLSpanElement
const player2NameEl = document.querySelector('#player-2-name') as HTMLSpanElement

/**
 * Listen to play-button
 */
playBtnEl.addEventListener('click', e => {
	e.preventDefault()
	socket.emit('userPlayGame', username, (game) => {
		if (game.timeStarted === 0) {
			console.log("Game created, waiting for another player:", game)

			gameOwner = true

			hideElement(countdownNoticeEl)
			waitingNoticeEl.innerHTML = `<span class="">Waiting for another player..</span>`

		} else {
			console.log("Second player joined game:", game)

			gameOwner = false

		}

		player1NameEl.innerText = game.playerOneName
		player2NameEl.innerText = game.playerTwoName

		showGameView(game, gameOwner)
	})
})

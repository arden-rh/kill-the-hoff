import './assets/scss/style.scss'
import './assets/game'
import { io, Socket } from 'socket.io-client'
import { ClientToServerEvents, Game, ServerToClientEvents, User } from '@backend/types/shared/SocketTypes'
import { noticeEl, startRound } from './assets/game'

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
const availableNameEl = document.querySelector('.available-name') as HTMLSpanElement

// Views in lobby
const usersOnlineEl = document.querySelector('#users-online') as HTMLUListElement
const userEl = document.querySelector('#user') as HTMLSpanElement
const gamesFinishedEl = document.querySelector('#games-finished') as HTMLUListElement
const gamesOngoingEl = document.querySelector('#games-ongoing') as HTMLUListElement

// User Detail
export let username: string

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
// socket.io.on('reconnect', () => {
// 	console.log('✅ Reconnected to the server')
// 	if (username) {
// 		socket.emit('userJoinLobby', username, (callbackData) => {
// 			updateOnlineUsers(callbackData.users)
// 		})
// 	}
// })

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

	console.log(socket.id)
	showLobbyView()
})

/**
 * Update online user list
 */
const updateOnlineUsers = (users: User[]) => {

	const user = users.find(name => name.id === socket.id)

	if (user) {
		userEl.innerText = `${user.name}`
	}

	usersOnlineEl.innerHTML = users
		.map(user => {
			if (socket.id === user.id) {
				return `<li class='hide'>${user.name}</li>`
			} else {
				return `<li>${user.name}</li>`
			}
		})
		.join('')
}

/**
 * Update list of games, specify element 'ongoing' or 'finished' as first parameter
 */
const updateGamesList = (element: HTMLElement, games: Game[]) => {
	if (element === gamesOngoingEl) {
		const availableGame = games.find(game => game.timeStarted === 0)
		if (availableGame) {
			availableNameEl.innerText = ` vs. ${availableGame.playerOneName}`
		} else {
			availableNameEl.innerText = ''
		}
	}
	element.innerHTML = games
		.map(game => `<li><span>${game.playerOneName}-${(game.playerTwoId) ? game.playerTwoName : '<em>[waiting for opponent]</em>'}</span> <span class="game-score">${game.playerOneScore}-${game.playerTwoScore}</span></li>`)
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
const showGameView = () => {
	hideElement(lobbyEl)
	showElement(gameEl)
	showElement(noticeEl)
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

			noticeEl.innerHTML = `<span class="">Waiting for another player..</span>`

		} else {
			console.log("Second player joined game:", game)

			// if player 2, start the game
			socket.emit('requestGameRound', game)

		}

		player1NameEl.innerText = game.playerOneName
		player2NameEl.innerText = game.playerTwoName

		showGameView()
	})
})

socket.on('updateGameInfo', playerTwoName => {
	player2NameEl.innerText = playerTwoName
})

socket.on('gameLogicCoordinates', (rowStart, columnStart, timer, game) => {
	// console.log('Received gameLogicCoordinates', rowStart, columnStart, timer)
	const round = game.playerOneResponseTimes.length
	if (round === 0) {
		let counter = 5;
		const countdown = setInterval(() => {
			noticeEl.innerHTML = `<span>You are playing against ${(socket.id === game.playerTwoId) ? game.playerOneName : game.playerTwoName} in ${counter}</span>`
			console.log(`${counter}`)
			counter--
			if (counter === -1) {
				clearInterval(countdown)
				startRound(game)
			}
		}, 1000);
	} else if (round < 10) {
		startRound(game)
	} else {
		// end game
	}
})

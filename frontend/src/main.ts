import './assets/scss/style.scss'
import './assets/game'
import { io, Socket } from 'socket.io-client'
import { ClientToServerEvents, Game, ServerToClientEvents, User } from '@backend/types/shared/SocketTypes'
import { formatedTime, noticeEl, playerOnePointsEl, playerOneTimerEl, playerOneTimerId, playerTwoPointsEl, playerTwoTimerEl, playerTwoTimerId, startRound } from './assets/game'

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

// Views in game
const player1NameEl = document.querySelector('#player-1-name') as HTMLSpanElement
const player2NameEl = document.querySelector('#player-2-name') as HTMLSpanElement
const waitiPlaceholderEl = document.querySelector('#wait-placeholder') as HTMLSpanElement

// User Detail
export let username: string

/**
 * Show element
 * @params element
 */
export const showElement = (element: HTMLElement) => {
	element.classList.remove('hide')
}

/**
 * Hide element
 * @params element
 */
export const hideElement = (element: HTMLElement) => {
	element.classList.add('hide')
}

/**
 * Connection to server and get socket id
 */
socket.on('connect', () => {
	console.log('💥 Connected to the server, socket id:', socket.id)
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

	const user = users.find(name => name.id === socket.id)

	if (user) {
		userEl.innerText = user.name
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
		.map(game => `<li>
			<span class="player-names">
				<span>${game.playerOneName}</span> -
				<span>${(game.playerTwoId) ? game.playerTwoName : '<span class="fa-solid fa-terminal"></span>'}</span>
			</span>
			<span class="game-score">${game.playerOnePoints} - ${game.playerTwoPoints}</span>
			</li>`)
		.join('')

}

/**
 * Listen to updated lobby information
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
 * Listen to updated list of all games
 */
socket.on('updateLobbyGames', (gamesOngoing, gamesFinished) => {

	updateGamesList(gamesOngoingEl, gamesOngoing)
	updateGamesList(gamesFinishedEl, gamesFinished)

})

/**
 * Listen to ongoing games
 */
socket.on('updateLobbyGamesOngoing', (gamesOngoing) => {

	updateGamesList(gamesOngoingEl, gamesOngoing)

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

/**
 * Listen to play-button
 */
playBtnEl.addEventListener('click', () => {

	socket.emit('userPlayGame', username, (game) => {
		if (game.timeStarted === 0) {

			noticeEl.innerText = 'Waiting for another player...'
			showElement(waitiPlaceholderEl)


		} else {

			hideElement(waitiPlaceholderEl)
			player2NameEl.innerText = game.playerTwoName

			// If player 2, start the game
			socket.emit('startGame', game)

		}

		player1NameEl.innerText = game.playerOneName
		// player2NameEl.innerText = game.playerTwoName

		showGameView()

	})
})

/**
 * Update opponent's name when joining the game
 */
socket.on('updateGameInfo', playerTwoName => {

	player2NameEl.innerText = playerTwoName

})

/**
 * A new game round
 */
socket.on('newGameRound', (game, round, rowStart, columnStart, timer) => {

	if (round === 0) {

		let counter = 5;

		const countdown = setInterval(() => {

			noticeEl.innerHTML = `<span>You are playing against ${(socket.id === game.playerTwoId) ? game.playerOneName : game.playerTwoName} in ${counter}</span>`

			if (counter === 0) {

				clearInterval(countdown)
				startRound(game, rowStart, columnStart, timer)

			}

			counter--

		}, 1000);

	} else if (round < 10) {

		startRound(game, rowStart, columnStart, timer)

	} else {

		console.log("THIS SHOULD NEVER HAPPEN, since newGameRound won't be called from server if we've reached 10 rounds")

	}
})

/**
 * Update responsetime in the game
 */
socket.on('updateResponseTime', (gameOwner, responseTime) => {

	const time = formatedTime.format(responseTime)

	if (gameOwner) {

		clearInterval(playerOneTimerId)

		playerOneTimerEl.innerText = time

	} else {

		clearInterval(playerTwoTimerId)

		playerTwoTimerEl.innerText = time

	}
})

/**
 * Update points in the game
 */
socket.on('updatePoints', (isPlayerOne, points) => {

	if (isPlayerOne) {

		playerOnePointsEl.innerText = points.toString()

	} else {

		playerTwoPointsEl.innerText = points.toString()

	}

})

/**
 * Show notice when game is finished
 */
socket.on('endGame', game => {

	showElement(noticeEl)

	noticeEl.innerHTML = `
		<span>Game ended:</span> ${game.playerOneName}-${game.playerTwoName} ${game.playerOnePoints}-${game.playerTwoPoints}
	`

})

import './assets/scss/style.scss'
import { io, Socket } from 'socket.io-client'
import { ClientToServerEvents, ServerToClientEvents } from '@backend/types/shared/SocketTypes'

const SOCKET_HOST = import.meta.env.VITE_APP_SOCKET_HOST

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(SOCKET_HOST)

socket.on('connect', () => {
	console.log('💥 Connected to the server, socket id:', socket.id)

	// socket.emit('getScores', scores => {
	// 	scores.sort((a, b) => a.avgTime - b.avgTime)
	// 	const appEl = document.querySelector('#app') as HTMLDivElement
	// 	appEl.innerHTML = scores.map(highscore => `<p>${highscore.name} ${highscore.avgTime}</p>`).join('')
	// })
})


const boardEl = document.querySelector('#board') as HTMLDivElement
const testingEl = document.querySelector('#testing') as HTMLDivElement

const var1 = 3
const var2 = 5

boardEl.addEventListener('click', () => {
	testingEl.classList.add('black')
	// testingEl.style.gridArea = "4 / 5 / 5 / 6"
	testingEl.style.gridArea = `${var1} / ${var2} / ${var1 + 1 } / ${var2 + 1}`

})


// Forms
const usernameFormEl = document.querySelector('#username-form') as HTMLFormElement

// Views
const welcomeViewEl = document.querySelector('#welcome-view-wrapper') as HTMLDivElement
const lobbyEl = document.querySelector('#lobby-view') as HTMLDivElement
const gameEl = document.querySelector('#game-view') as HTMLDivElement

// Buttons
const playBtnEl = document.querySelector('#play-btn') as HTMLButtonElement

// Test user in list
const yourUsernameEl = document.querySelector('#your-username') as HTMLLIElement

// User Detail
let username: string

// Show lobby view
const showLobbyView = () => {
	welcomeViewEl.classList.add('hide')

	yourUsernameEl.innerText = username
}

// Show game view
const showGameView = () => {
	lobbyEl.classList.add('hide')
	gameEl.classList.remove('hide')
}

playBtnEl.addEventListener('click', () => {

})

usernameFormEl.addEventListener('submit', e => {
	e.preventDefault()

	username = (usernameFormEl.querySelector('#username') as HTMLInputElement).value.trim()

	// If no username, NO CHAT FOR YOU
	if (!username) {
		return
	}

	console.log(username)

	socket.emit('userJoinLobby', (username))

	// Show lobby view
	showLobbyView()
})

/**
 * Game
*/
import { Game } from "@backend/types/shared/SocketTypes"
import { hideElement, showElement, socket } from "../main"
export { }

let inGame: Game

/**
 * Queries
 */
// Testing timers
export const playerOneTimerEl = document.querySelector('#player-1-timer') as HTMLSpanElement
export const playerTwoTimerEl = document.querySelector('#player-2-timer') as HTMLSpanElement
// const testTimerBtnEl = document.querySelector('#test-timer-btn') as HTMLButtonElement
// const startGameBtnEl = document.querySelector('#test-start-game-btn') as HTMLButtonElement

// Views
// const boardEl = document.querySelector('#board') as HTMLDivElement
const targetImgEl = document.querySelector('#target-img') as HTMLDivElement
export const noticeEl = document.querySelector('#notice') as HTMLDivElement

// Scores
export const playerOnePointsEl = document.querySelector('#player-1-points') as HTMLSpanElement
export const playerTwoPointsEl = document.querySelector('#player-2-points') as HTMLSpanElement

/**
 * Timer
 */
export let playerOneTimerId: number
export let playerTwoTimerId: number
let start: number

// const startGameRound = () => {

// 	socket.emit('startGameRound', () => {

// 	})

// 	socket.on('gameLogicCoordinates', (rowStart, columnStart, timer) => {

// 		console.log(rowStart, columnStart)
// 		console.log(timer)

// 		const gameTimer = setTimeout(() => {
// 			showElement(targetImgEl)
// 			targetImgEl.style.gridArea = `${rowStart} / ${columnStart} / ${rowStart + 1} / ${columnStart + 1}`
// 		}, timer)

// 		hideElement(targetImgEl)

// 	})

// }

// targetImgEl.addEventListener('click', () => {
// 	// testingEl.style.gridArea = "4 / 5 / 5 / 6"
// 	// testingEl.style.gridArea = `${rowStart} / ${columnStart} / ${rowStart + 1} / ${columnStart + 1}`

// 	clearInterval(timerId)
// 	// startGameRound()
// })

// Time format
export const formatedTime = new Intl.DateTimeFormat("en", {
	second: "2-digit",
	fractionalSecondDigits: 2
})

const playerOneTick = () => {
	const now = Date.now() - start
	const currentTime = formatedTime.format(now)
	playerOneTimerEl.innerText = currentTime
}

const playerTwoTick = () => {
	const now = Date.now() - start
	const currentTime = formatedTime.format(now)
	playerTwoTimerEl.innerText = currentTime
}

export const startRound = (game: Game, rowStart: number, columnStart: number, timer: number) => {
	inGame = game
	hideElement(noticeEl)

	setTimeout(() => {
		targetImgEl.style.gridArea = `${rowStart} / ${columnStart} / ${rowStart + 1} / ${columnStart + 1}`
		showElement(targetImgEl)

		start = Date.now()
		playerOneTimerId = setInterval(playerOneTick, 100)
		playerTwoTimerId = setInterval(playerTwoTick, 100)
	}, timer)

	targetImgEl.addEventListener('click', targetImgEventListener)
}

const targetImgEventListener = () => {
	let end = Date.now()
	let responseTime: number
	responseTime = end - start

	socket.emit('roundResult', inGame, responseTime)

	const time = formatedTime.format(responseTime)
	if (socket.id === inGame.playerOneId) {
		clearInterval(playerOneTimerId)
		playerOneTimerEl.innerText = time
	} else {
		clearInterval(playerTwoTimerId)
		playerTwoTimerEl.innerText = time
	}
	hideElement(targetImgEl)
	// targetImgEl.removeEventListener('click', targetImgEventListener)
}

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

// The player's timers
export const playerOneTimerEl = document.querySelector('#player-1-timer') as HTMLSpanElement
export const playerTwoTimerEl = document.querySelector('#player-2-timer') as HTMLSpanElement
export let playerOneTimerId: number
export let playerTwoTimerId: number

// Views
const targetImgEl = document.querySelector('#target-img') as HTMLDivElement
export const noticeEl = document.querySelector('#notice') as HTMLDivElement

// Scores
export const playerOnePointsEl = document.querySelector('#player-1-points') as HTMLSpanElement
export const playerTwoPointsEl = document.querySelector('#player-2-points') as HTMLSpanElement

// Game's rounds
export const roundCounterEl = document.querySelector('#round') as HTMLSpanElement

// Timer start
let start: number

/**
 * Time format
 */
export const formatedTime = new Intl.DateTimeFormat("en", {
	second: "2-digit",
	fractionalSecondDigits: 2
})

/**
 * Player one's tick
 */
const playerOneTick = () => {

	const now = Date.now() - start
	const currentTime = formatedTime.format(now)
	playerOneTimerEl.innerText = currentTime

}

/**
 * Player two's tick
 */
const playerTwoTick = () => {

	const now = Date.now() - start

	const currentTime = formatedTime.format(now)
	playerTwoTimerEl.innerText = currentTime

}

/**
 * Start of a new round
 * @param game
 * @param rowStart
 * @param columnStart
 * @param timer
 */
export const startRound = (game: Game, round: number, rowStart: number, columnStart: number, timer: number) => {

	inGame = game

	round++

	setTimeout(() => {
		roundCounterEl.innerText = round.toString()
	}, 1000)

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

/**
 * Listen to the click on the target
 */
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
}

/**
 * Game
*/
import { Game } from "@backend/types/shared/SocketTypes"
import { hideElement, showElement, socket, username } from "../main"
export { }

/**
 * Queries
 */
// Testing timers
const playerOneTimerEl = document.querySelector('#timer-1') as HTMLSpanElement
const playerTwoTimerEl = document.querySelector('#timer-2') as HTMLSpanElement
const testTimerBtnEl = document.querySelector('#test-timer-btn') as HTMLButtonElement
const startGameBtnEl = document.querySelector('#test-start-game-btn') as HTMLButtonElement

// Views
const boardEl = document.querySelector('#board') as HTMLDivElement
const targetImgEl = document.querySelector('#target-img') as HTMLDivElement
export const countdownNoticeEl = document.querySelector('#countdown-notice') as HTMLDivElement
export const waitingNoticeEl = document.querySelector('#waiting-notice') as HTMLDivElement


/**
 * Timer
 */
let timerId: number
let start: number

// // Time format
// const formatedTime = new Intl.DateTimeFormat("en", {
// 	second: "2-digit",
// 	fractionalSecondDigits: 2
// })

// const tick = () => {
// 	const now = Date.now() - start
// 	const currentTime = formatedTime.format(now)
// 	playerOneTimerEl.innerText = currentTime
// 	playerTwoTimerEl.innerText = currentTime

// }

// // const startGameRound = () => {

// // 	socket.emit('startGameRound', () => {

// // 	})

// // 	socket.on('gameLogicCoordinates', (rowStart, columnStart, timer) => {

// // 		console.log(rowStart, columnStart)
// // 		console.log(timer)

// // 		const gameTimer = setTimeout(() => {
// // 			showElement(targetImgEl)
// // 			targetImgEl.style.gridArea = `${rowStart} / ${columnStart} / ${rowStart + 1} / ${columnStart + 1}`
// // 		}, timer)

// // 		hideElement(targetImgEl)

// // 	})

// // }

// startGameBtnEl.addEventListener('click', () => {

// 	// console.log("game start")
// 	// hideElement(waitingNoticeEl)
// 	// hideElement(countdownNoticeEl)
// 	// hideElement(targetImgEl)

// 	// startGameRound()
// })

// testTimerBtnEl.addEventListener('click', () => {

// 	start = Date.now()

// 	clearInterval(timerId)
// 	timerId = setInterval(tick, 100)

// })

// targetImgEl.addEventListener('click', () => {
// 	// testingEl.style.gridArea = "4 / 5 / 5 / 6"
// 	// testingEl.style.gridArea = `${rowStart} / ${columnStart} / ${rowStart + 1} / ${columnStart + 1}`

// 	clearInterval(timerId)
// 	// startGameRound()
// })

/**
 * Countdown (before game starts)
 */
export const startGame = (game: Game, player: string) => {

	let counter = 5;

	const countdown = setInterval(() => {
		countdownNoticeEl.innerHTML = `<span>You are playing against ${( player === 'playerTwoId') ? game.playerOneName : game.playerTwoName} in ${counter}</span>`
		console.log(`${counter}`)
		counter--
		if (counter === -1) {
			clearInterval(countdown)

			startRound(game, player, 1)
		}
	}, 1000);

}

const startRound = (game: Game, player: string, round: number) => {

console.log("GAME IS STARTING")

// Show box
hideElement(waitingNoticeEl)
hideElement(countdownNoticeEl)
showElement(targetImgEl)

console.log('Timern ska gå igång')
start = Date.now()
console.log('Start:', start)

// Klick event på box
targetImgEl.addEventListener('click', () => {

	let end = Date.now()

	let result = end - start

	console.log('Slut:', end)

	console.log('Resultat:', result)

	socket.emit('roundResult', game, socket.id, player, round, result)

	clearInterval(timerId)
	// startGameRound()
})

}

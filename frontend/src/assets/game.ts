/**
 * Game
*/

import { countdownNoticeEl, hideElement, waitingNoticeEl } from "../main"

export { }

/**
 * Queries
 */

// Testing timers
const playerOneTimerEl = document.querySelector('#timer-1') as HTMLSpanElement
const testTimerBtnEl = document.querySelector('#test-timer-btn') as HTMLButtonElement
const startGameBtnEl = document.querySelector('#test-start-game-btn') as HTMLButtonElement

// Views
const boardEl = document.querySelector('#board') as HTMLDivElement
const testingEl = document.querySelector('#testing') as HTMLDivElement
const countdownNoticeEl = document.querySelector('#countdown-notice') as HTMLDivElement

/**
 * Timer
 */
const rowStart = 3
const columnStart = 5
let timerId: number
let start: number

// Time format
const formatedTime = new Intl.DateTimeFormat("en", {
	minute: "2-digit",
	second: "2-digit",
	fractionalSecondDigits: 2
})

const tick = () => {
	const now = Date.now() - start
	const currentTime = formatedTime.format(now)
	playerOneTimerEl.innerText = currentTime
}

const gameStart = () => {

}

startGameBtnEl.addEventListener('click', () => {
	console.log("hej")
	hideElement(waitingNoticeEl)
	hideElement(countdownNoticeEl)
})

testTimerBtnEl.addEventListener('click', () => {

	start = Date.now()

	clearInterval(timerId)
	timerId = setInterval(tick, 100)

})

testingEl.addEventListener('click', () => {
	testingEl.classList.add('black')
	// testingEl.style.gridArea = "4 / 5 / 5 / 6"
	testingEl.style.gridArea = `${rowStart} / ${columnStart} / ${rowStart + 1} / ${columnStart + 1}`

	clearInterval(timerId)
})

/**
 * Countdown (before game starts)
 */

export const countdown = (username: string) => {

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






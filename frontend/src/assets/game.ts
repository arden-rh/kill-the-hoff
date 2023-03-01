/**
 * Game
*/

export { }

// testing timers

const playerOneTimerEl = document.querySelector('#timer-1') as HTMLSpanElement
const testTimerBtnEl = document.querySelector('#test-timer-btn') as HTMLButtonElement

const boardEl = document.querySelector('#board') as HTMLDivElement
const testingEl = document.querySelector('#testing') as HTMLDivElement

const var1 = 3
const var2 = 5
let timerId: number
let start : number



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

testTimerBtnEl.addEventListener('click', () => {

	start = Date.now()

	clearInterval(timerId)
	timerId = setInterval(tick, 100)

})

testingEl.addEventListener('click', () => {
	testingEl.classList.add('black')
	// testingEl.style.gridArea = "4 / 5 / 5 / 6"
	testingEl.style.gridArea = `${var1} / ${var2} / ${var1 + 1} / ${var2 + 1}`

	clearInterval(timerId)
})





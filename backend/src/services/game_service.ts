import prisma from "../prisma"

export const getGames = () => {
	return prisma.game.findMany()
}

export const createGame = (name: string) => {
	return prisma.game.create({
		data: {
			timeCreated: Date.now(),
			timeStarted: 0,
			timeFinished: 0,
			playerOneName: name,
			playerOneScore: 0,
			playerOneAvgTime: 0.00,
			playerTwoName: '',
			playerTwoScore: 0,
			playerTwoAvgTime: 0.00
		}
	})
}

export const getAvailableGame = () => {
	return prisma.game.findFirst({
		where: {
			timeStarted: 0
		}
	})
}

export const joinGame = (id: string, name: string) => {
	return prisma.game.update({
		where: {
			id
		},
		data: {
			timeStarted: Date.now(),
			playerTwoName: name
		}
	})
}

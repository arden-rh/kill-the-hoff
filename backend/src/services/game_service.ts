import prisma from "../prisma"

export const getGames = () => {
	return prisma.game.findMany()
}

export const getGamesOngoing = () => {
	return prisma.game.findMany({
		where: {
			timeFinished: 0
		}
	})
}

export const getGamesFinished = () => {
	return prisma.game.findMany({
		where: {
			roundsPlayed: 10
		}
	})
}

export const createGame = (userId: string, name: string) => {
	return prisma.game.create({
		data: {
			timeCreated: Date.now(),
			timeStarted: 0,
			timeFinished: 0,
			playerOneId: userId,
			playerOneName: name,
			playerOneScore: 0,
			playerOneAvgTime: 0.00,
			playerTwoId: '',
			playerTwoName: '',
			playerTwoScore: 0,
			playerTwoAvgTime: 0.00,
			roundsPlayed: 0
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

export const joinGame = (id: string, userId: string, name: string) => {
	return prisma.game.update({
		where: {
			id
		},
		data: {
			timeStarted: Date.now(),
			playerOneId: userId,
			playerTwoName: name
		}
	})
}

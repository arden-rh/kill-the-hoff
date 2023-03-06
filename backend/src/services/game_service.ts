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
			playerOneResponseTimes: [],
			playerTwoId: '',
			playerTwoName: '[Player 2]',
			playerTwoScore: 0,
			playerTwoResponseTimes: [],
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
			playerTwoId: userId,
			playerTwoName: name
		}
	})
}


export const updateGame = (id: string, gameOwner: boolean, round: number, responseTime: number) => {

	console.log(responseTime)

	if (gameOwner) {
		return prisma.game.update({
			where: {
				id,
			},
			data: {
				playerOneResponseTimes: {
					push: responseTime,
				}
			}
		})
}

	return prisma.game.update({
		where: {
			id,
		},
		data: {
			playerOneResponseTimes: {
				push: responseTime,
			}
		}
	})
}

export const deleteGame = (id: string) => {
	return prisma.game.delete({
		where: {
			id
		}
	})
}

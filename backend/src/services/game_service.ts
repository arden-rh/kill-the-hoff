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
			timeFinished: {
				gt: 0
			}
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
			playerTwoResponseTimes: []
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


export const updateGame = (id: string, gameOwner: boolean, responseTime: number) => {
	if (gameOwner) {
		return prisma.game.update({
			where: {
				id
			},
			data: {
				playerOneResponseTimes: {
					push: responseTime
				}
			}
		})
	} else {
		return prisma.game.update({
			where: {
				id
			},
			data: {
				playerTwoResponseTimes: {
					push: responseTime
				}
			}
		})
	}
}

export const deleteGame = (id: string) => {
	return prisma.game.delete({
		where: {
			id
		}
	})
}

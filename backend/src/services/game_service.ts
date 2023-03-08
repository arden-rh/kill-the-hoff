import prisma from "../prisma"

export const getGames = () => {
	return prisma.game.findMany()
}

export const getGame = (id: string) => {
	return prisma.game.findUnique({
		where: {
			id
		}
	})
}

export const getGamesOngoing = () => {
	return prisma.game.findMany({
		where: {
			timeFinished: 0
		},
		orderBy: {
			timeCreated: 'desc'
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
			playerOnePoints: 0,
			playerOneResponseTimes: [],
			playerTwoId: '',
			playerTwoName: '',
			playerTwoPoints: 0,
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

export const increasePoints = (id: string, isPlayerOne: boolean, points: number) => {
	if (isPlayerOne) {
		return prisma.game.update({
			where: {
				id
			},
			data: {
				playerOnePoints: points
			}
		})
	} else {
		return prisma.game.update({
			where: {
				id
			},
			data: {
				playerTwoPoints: points
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

export const endGame = (id: string) => {
	return prisma.game.update({
		where: {
			id
		},
		data: {
			timeFinished: Date.now()
		}
	})
}

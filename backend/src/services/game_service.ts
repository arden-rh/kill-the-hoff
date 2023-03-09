import prisma from "../prisma"

/**
 * Ongoing games
 * @returns all ongoing games
 */
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

/**
 * Games finished
 * @returns the ten last finished games
 */
export const getGamesFinished = () => {
	return prisma.game.findMany({
		where: {
			timeFinished: {
				gt: 0
			}
		},
		take: 10,
		orderBy: {
			timeFinished: 'desc'
		}
	})
}

/**
 * Create a game
 * @param userId user's socket id
 * @param name username
 * @returns all data in a game
 */
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

/**
 * Check if there is an available game
 * @returns (if there is) an available game
 */
export const getAvailableGame = () => {
	return prisma.game.findFirst({
		where: {
			timeStarted: 0
		}
	})
}

/**
 * Join an existing/available game
 * @param id
 * @param userId
 * @param name
 * @returns
 */
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

/**
 * Update player's response time
 * @param id
 * @param gameOwner
 * @param responseTime
 * @returns
 */
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

/**
 * Update player's points
 * @param id
 * @param isPlayerOne
 * @param points
 * @returns
 */
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

/**
 * Delete game
 * @param id
 * @returns
 */
export const deleteGame = (id: string) => {
	return prisma.game.delete({
		where: {
			id
		}
	})
}

/**
 * Update game when it is finished
 * @param id
 * @returns
 */
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

/**
 * Get the responsetimes
 * @param id
 * @returns
 */
export const getResponseTimes = (id:string) => {
	return prisma.game.findUnique({
		where: {
			id
		},
		select: {
			playerOneResponseTimes:true,
			playerTwoResponseTimes:true
		}
	})
}

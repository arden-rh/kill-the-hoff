import prisma from "../prisma"

export const getScores = () => {
	return prisma.score.findMany()
}

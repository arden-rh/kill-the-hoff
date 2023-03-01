import prisma from "../prisma"

export const getScores = async () => {
	return await prisma.score.findMany()
}

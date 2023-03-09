import prisma from "../prisma"

export const getScores = () => {
	return prisma.score.findMany()
}

/**
 * Create the player's scores
 * @param name
 * @param avgTime
 * @param fastestTime
 * @returns
 */
export const createScore = (name:string,avgTime:number, fastestTime:number) =>{
return prisma.score.create({
	data:{
	name,
	avgTime,
	fastestTime,
	timestamp:Date.now()
	}

})
}




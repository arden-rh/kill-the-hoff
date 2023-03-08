import prisma from "../prisma"

export const getScores = () => {
	return prisma.score.findMany()
}


export const averageTime = (player:string,time:number) =>{
return prisma.score.create({
	data:{
	name:player,
	avgTime:time,
	timestamp:Date.now()
	}

})
}

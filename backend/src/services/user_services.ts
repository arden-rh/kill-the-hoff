import prisma from "../prisma"

export const createUser = async (id: string, username: string) => {
	return await prisma.user.upsert({
		where: {
			id
		},
		create: {
			id,
			name: username,
			timestamp: Date.now()
		},
		update: {
			name: username,
			timestamp: Date.now()
		}
	})
}

export const deleteUser = async (id: string) => {
	return await prisma.user.deleteMany({
		where: {
			id
		}
	})
}

export const getUsers = async () => {
	return await prisma.user.findMany()
}

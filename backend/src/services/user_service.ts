import prisma from "../prisma"

export const createUser = (id: string, username: string) => {
	return prisma.user.upsert({
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

export const deleteUser = (id: string) => {
	return prisma.user.deleteMany({
		where: {
			id
		}
	})
}

export const getUsers = () => {
	return prisma.user.findMany()
}

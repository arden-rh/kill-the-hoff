import prisma from "../prisma"

/**
 * Create a user
 * Update if user reconnects
 * @param id
 * @param username
 * @returns
 */
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

/**
 * Delete users
 * @param id
 * @returns
 */
export const deleteUser = (id: string) => {
	return prisma.user.deleteMany({
		where: {
			id
		}
	})
}

/**
 * Get all users
 * @returns
 */
export const getUsers = async () => {
	return await prisma.user.findMany()
}

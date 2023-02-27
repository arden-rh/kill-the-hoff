import { Room, User } from "@prisma/client"
export {}

export interface ServerToClientEvents {
	hello: () => void
}

export interface ClientToServerEvents {
}

export interface InterServerEvents {
}
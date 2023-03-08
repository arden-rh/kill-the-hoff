import express from "express"

const router = express.Router()

/**
 * GET /
 */
router.get('/', (req, res) => {
	res.send({
		message: "WELCOME TO KILL THE HOFF",
	})
})

export default router

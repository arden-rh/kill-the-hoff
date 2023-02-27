import express from "express"

// instantiate a new router
const router = express.Router()

/**
 * GET /
 */
router.get('/', (req, res) => {
	res.send({
		message: "I AM VIRUS-API, BEEP BOOP",
	})
})

export default router

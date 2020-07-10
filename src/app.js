require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')

const { NODE_ENV, API_KEY } = require('./config')

// set up winston
const logger = require('./logger')

const bookmarksRouter = require('./bookmarks/bookmarks-router')

const app = express()

const morganOption = NODE_ENV === 'production' ? 'tiny' : 'common'

app.use(morgan(morganOption))

app.use(cors())
app.use(helmet())

app.use(function validateBearerToken(req, res, next) {
	const apiToken = API_KEY
	const authToken = req.get('Authorization')

	if (!authToken || authToken.split(' ')[1] !== apiToken) {
		logger.error(`Unauthorized request to path: ${req.path}`)
		return res.status(401).json({ error: 'Unauthorized request' })
	}
	// move to the next middleware
	next()
})

app.use(bookmarksRouter)

app.get('/', (req, res) =>
	res.send({
		message: 'Hello, world! This is the bookmarks server',
	})
)

// eslint-disable-next-line no-unused-vars
app.use((error, req, res, _next) => {
	let response
	if (NODE_ENV === 'production') {
		response = { error: { message: 'server error' } }
	} else {
		logger.error(error)
		response = { message: error.message, error }
	}
	res.status(500).json(response)
})

module.exports = app

const express = require('express')
const { v4: uuid } = require('uuid')

const logger = require('../logger')
const { bookmarks } = require('../store')

const bookmarksRouter = express.Router()

const bodyParser = express.json()

bookmarksRouter
	.route('/bookmarks')
	.get((req, res) => {
		res.json(bookmarks)
	})
	.post(bodyParser, (req, res) => {
		const { url, description, rating } = req.body

		const expression =
			'https?://(?:www.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9].[^s]{2,}|www.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9].[^s]{2,}|https?://(?:www.|(?!www))[a-zA-Z0-9]+.[^s]{2,}|www.[a-zA-Z0-9]+.[^s]{2,}'
		const regex = new RegExp(expression)

		if (!url || !url.match(regex)) {
			logger.error(`No url or invalid format ('http://...')`)
			return res.status(400).send({
				error: `No url or invalid format ('http://...')`,
			})
		}
		if (!description) {
			logger.error(`Desription is required`)
			return res
				.status(400)
				.send({ error: `Description is required to POST` })
		}
		if (!rating || rating < 1 || rating > 5) {
			logger.error(
				`Rating is not provided or is less than 1 or greater than 5`
			)
			return res.status(400).send({
				error: `Rating is not provided or is less than 1 or greater than 5`,
			})
		}
		const id = uuid()
		const bookmark = {
			id,
			url,
			description,
			rating,
		}
		bookmarks.push(bookmark)
		res.send({
			message: 'POST request to the homepage',
			bookmark,
		})
	})

bookmarksRouter
	.route('/bookmarks/:id')
	.get((req, res) => {
		const { id } = req.params

		const bookmark = bookmarks.find(
			(bookmark) => bookmark.id === id
		)

		if (!bookmark) {
			logger.error(`Bookmark not found matching id ${id}`)
			return res.status(404).send({
				error: `Bookmark not found matching id ${id}`,
			})
		}

		res.json({ message: `Bookmark retrieved!`, bookmark })
	})
	.delete((req, res) => {
		const { id } = req.params

		const index = bookmarks.findIndex(
			(bookmark) => bookmark.id === id
		)

		if (index === -1) {
			logger.error()
			return res.status(404).send({
				error: `Delete failed, no bookmark found matching id: ${id}`,
			})
		}
		const deletedBookmark = bookmarks[index]
		bookmarks.splice(index, 1)

		logger.info(
			`Deletion successful. Bookmark with id: ${id} was deleted`
		)
		res.send({
			message: `Deleted bookmark id:${id}`,
			deletedBookmark,
		})
	})

module.exports = bookmarksRouter

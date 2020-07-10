const app = require('./app')
const { PORT } = require('./config')
const logger = require('./logger')

app.listen(PORT, () =>
	logger.info(`Server listening at http://localhost:${PORT}`)
)

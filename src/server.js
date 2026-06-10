require('dotenv').config();

const express = require('express');
const logger = require('./utils/logger');
const bookingRoutes = require('./routes/bookingRoutes');
const { startEmailWorker } = require('./queues/emailWorker');

const app = express();
app.use(express.json());

app.use('/api', bookingRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`Server listening on port ${PORT}`);
});

// Start the background worker that sends booking confirmation emails.
startEmailWorker();

module.exports = app;

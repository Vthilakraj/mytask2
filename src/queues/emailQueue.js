const { Queue } = require('bullmq');
const { connection } = require('../config/redis');

const EMAIL_QUEUE_NAME = 'email-notifications';

const emailQueue = new Queue(EMAIL_QUEUE_NAME, { connection });

const maxRetries = Number(process.env.EMAIL_MAX_RETRIES || 5);
const backoffDelay = Number(process.env.EMAIL_RETRY_BACKOFF_MS || 5000);

async function enqueueBookingConfirmationEmail(booking) {
  return emailQueue.add('booking-confirmation', booking, {
    attempts: maxRetries,
    backoff: {
      type: 'exponential',
      delay: backoffDelay,
    },
    removeOnComplete: 1000,
    removeOnFail: false,
  });
}

module.exports = {
  EMAIL_QUEUE_NAME,
  emailQueue,
  enqueueBookingConfirmationEmail,
};

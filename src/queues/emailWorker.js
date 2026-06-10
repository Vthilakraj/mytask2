const { Worker } = require('bullmq');
const { connection } = require('../config/redis');
const { EMAIL_QUEUE_NAME } = require('./emailQueue');
const { sendBookingConfirmationEmail } = require('../services/mailer');
const logger = require('../utils/logger');

function startEmailWorker() {
  const worker = new Worker(
    EMAIL_QUEUE_NAME,
    async (job) => {
      if (job.name === 'booking-confirmation') {
        await sendBookingConfirmationEmail(job.data);
        return;
      }
      logger.warn('Unknown email job type received', { jobName: job.name });
    },
    { connection }
  );

  worker.on('completed', (job) => {
    logger.info('Email job completed', {
      jobId: job.id,
      bookingId: job.data?.bookingId,
    });
  });

  worker.on('failed', (job, err) => {
    logger.error('Email job failed', {
      jobId: job?.id,
      bookingId: job?.data?.bookingId,
      attemptsMade: job?.attemptsMade,
      maxAttempts: job?.opts?.attempts,
      error: err.message,
    });

    if (job && job.attemptsMade >= (job.opts?.attempts || 1)) {
      logger.error('Email permanently failed after exhausting retries', {
        jobId: job.id,
        bookingId: job.data?.bookingId,
      });
      // TODO: hook into an alerting system (e.g. PagerDuty, Slack) here
      // so operators are notified of permanent delivery failures.
    }
  });

  worker.on('error', (err) => {
    logger.error('Email worker error', { error: err.message });
  });

  return worker;
}

module.exports = { startEmailWorker };

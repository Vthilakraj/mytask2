const { v4: uuidv4 } = require('uuid');
const { enqueueBookingConfirmationEmail } = require('../queues/emailQueue');
const logger = require('../utils/logger');

// In-memory store for demo purposes. Replace with a real database in production.
const bookings = new Map();

async function createBooking(payload) {
  const bookingId = uuidv4();

  const booking = {
    bookingId,
    customerName: payload.customerName,
    customerEmail: payload.customerEmail,
    movieTitle: payload.movieTitle,
    theaterName: payload.theaterName,
    theaterLocation: payload.theaterLocation,
    showDateTime: payload.showDateTime,
    seatNumbers: payload.seatNumbers,
    paymentId: payload.paymentId,
    amountPaid: payload.amountPaid,
    createdAt: new Date().toISOString(),
  };

  bookings.set(bookingId, booking);

  // Enqueue the confirmation email on a background queue so the booking
  // API response is never blocked or delayed by email delivery.
  // A hard timeout guarantees this never holds up the response, even if
  // the queue backend (Redis) is unreachable or slow to connect.
  const ENQUEUE_TIMEOUT_MS = 2000;
  try {
    await Promise.race([
      enqueueBookingConfirmationEmail(booking),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Enqueue timed out')), ENQUEUE_TIMEOUT_MS)
      ),
    ]);
  } catch (err) {
    // Failing to enqueue must not fail the booking itself, but it must be logged.
    logger.error('Failed to enqueue booking confirmation email', {
      bookingId,
      error: err.message,
    });
  }

  return booking;
}

function getBooking(bookingId) {
  return bookings.get(bookingId);
}

module.exports = { createBooking, getBooking };

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
  try {
    await enqueueBookingConfirmationEmail(booking);
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

const { createBooking, getBooking } = require('../services/bookingService');
const logger = require('../utils/logger');

const REQUIRED_FIELDS = [
  'customerName',
  'customerEmail',
  'movieTitle',
  'theaterName',
  'theaterLocation',
  'showDateTime',
  'seatNumbers',
  'paymentId',
  'amountPaid',
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function bookTicket(req, res) {
  const payload = req.body || {};

  const missingFields = REQUIRED_FIELDS.filter((field) => !payload[field]);
  if (missingFields.length > 0) {
    return res.status(400).json({
      error: 'Missing required fields',
      fields: missingFields,
    });
  }

  if (!EMAIL_REGEX.test(payload.customerEmail)) {
    return res.status(400).json({ error: 'Invalid customerEmail' });
  }

  if (!Array.isArray(payload.seatNumbers) || payload.seatNumbers.length === 0) {
    return res.status(400).json({ error: 'seatNumbers must be a non-empty array' });
  }

  try {
    const booking = await createBooking(payload);

    return res.status(201).json({
      message: 'Booking confirmed. A confirmation email will be sent shortly.',
      bookingId: booking.bookingId,
    });
  } catch (err) {
    logger.error('Booking creation failed', { error: err.message });
    return res.status(500).json({ error: 'Failed to create booking' });
  }
}

function getBookingDetails(req, res) {
  const booking = getBooking(req.params.bookingId);
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  // Never expose the raw payment ID via the API.
  const { paymentId, ...safeBooking } = booking;
  return res.json(safeBooking);
}

module.exports = { bookTicket, getBookingDetails };

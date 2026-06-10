const nodemailer = require('nodemailer');
const logger = require('../utils/logger');
const { render } = require('./templateService');

let transporter;

function getTransporter() {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true', // true for port 465, false for STARTTLS on 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
}

// Mask all but the last 4 characters of an identifier so it never appears
// in full in emails or logs.
function maskSensitiveId(value) {
  if (!value) return '';
  const str = String(value);
  if (str.length <= 4) return '*'.repeat(str.length);
  return '*'.repeat(str.length - 4) + str.slice(-4);
}

async function sendBookingConfirmationEmail(booking) {
  const maskedPaymentId = maskSensitiveId(booking.paymentId);

  const html = render('bookingConfirmation', {
    customerName: booking.customerName,
    movieTitle: booking.movieTitle,
    theaterName: booking.theaterName,
    theaterLocation: booking.theaterLocation,
    showDateTime: booking.showDateTime,
    seatNumbers: Array.isArray(booking.seatNumbers)
      ? booking.seatNumbers.join(', ')
      : booking.seatNumbers,
    bookingId: booking.bookingId,
    maskedPaymentId,
    amountPaid: booking.amountPaid,
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: booking.customerEmail,
    subject: `Booking Confirmed: ${booking.movieTitle} (#${booking.bookingId})`,
    html,
  };

  const info = await getTransporter().sendMail(mailOptions);

  logger.info('Booking confirmation email sent', {
    bookingId: booking.bookingId,
    messageId: info.messageId,
    // Never log the recipient address or full payment ID.
  });

  return info;
}

module.exports = { sendBookingConfirmationEmail, maskSensitiveId };

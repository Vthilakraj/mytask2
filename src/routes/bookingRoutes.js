const express = require('express');
const { bookTicket, getBookingDetails } = require('../controllers/bookingController');

const router = express.Router();

router.post('/bookings', bookTicket);
router.get('/bookings/:bookingId', getBookingDetails);

module.exports = router;

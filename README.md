# Movie Ticket Booking - Email Confirmation

After a successful booking (`POST /api/bookings`), a confirmation email is rendered
from a Handlebars template (`src/templates/bookingConfirmation.hbs`) containing the
movie title, show timing, seat numbers, theater info, and a masked payment reference.

## Architecture

- **API response is non-blocking**: the booking endpoint enqueues an email job on a
  BullMQ (Redis-backed) queue and returns immediately.
- **Background worker** (`src/queues/emailWorker.js`) consumes the queue and sends
  email via `nodemailer` over SMTP.
- **Retry logic**: failed email jobs are retried automatically with exponential
  backoff (configurable via `EMAIL_MAX_RETRIES` / `EMAIL_RETRY_BACKOFF_MS`).
- **Logging/monitoring**: all email send attempts, successes, and failures (including
  permanent failures after retries are exhausted) are logged via `winston`
  (`logs/combined.log`, `logs/error.log`).
- **Sensitive data**: payment IDs are masked before being included in the email or
  logs; recipient addresses and full payment IDs are never logged. SMTP credentials
  are read from environment variables (see `.env.example`) and must not be committed.

## Setup

```bash
npm install
cp .env.example .env   # fill in real SMTP and Redis settings
npm start               # requires a running Redis instance
```

## API

- `POST /api/bookings` - create a booking, enqueue confirmation email
- `GET /api/bookings/:bookingId` - fetch booking details (payment ID excluded)

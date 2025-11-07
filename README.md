# XKCD Comic Subscription - MERN Stack

This is a MERN stack (MongoDB, Express, React, Node.js) application that allows users to subscribe to daily XKCD comics via email. The application uses Brevo (formerly Sendinblue) for email delivery.

## Features

- 📧 Email subscription with verification code
- 🎲 Random XKCD comic delivery via email
- 🚫 Unsubscribe functionality with verification
- 🎨 Beautiful, responsive frontend UI with cosmic theme
- ⏰ Schedule your preferred delivery time and days
- 🤖 Automated daily comic delivery via cron job
- 🔐 Secure token-based unsubscribe links
- 🌌 Catchy XKCD comic information section

## Local Setup

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd xkcd-mern/backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the `backend` directory and add your environment variables (see `.env.example` for reference):

```env
# Database
MONGODB_URI=mongodb://localhost:27017/xkcd-subscription

# Brevo Email Configuration
BREVO_API_KEY=your_brevo_api_key_here
FROM_EMAIL=no-reply@yourdomain.com
FRONTEND_URL=http://localhost:5173

# Server
PORT=5000
NODE_ENV=development
```

4. Start the backend server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to the client directory:
```bash
cd xkcd-mern/client
```

2. Install dependencies:
```bash
npm install
```

3. Start the React development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## API Endpoints

### User Management
- `POST /api/users/register` - Register a new user and send verification code
- `POST /api/users/verify` - Verify email with code
- `POST /api/users/unsubscribe-request` - Request unsubscribe verification
- `POST /api/users/unsubscribe` - Confirm unsubscribe with code
- `GET /api/users/unsubscribe-token/:token` - Immediate unsubscribe with token

### User Preferences
- `PUT /api/users/preferences` - Update user's comic delivery preferences
- `GET /api/users/preferences` - Get user's current preferences

### XKCD Comics
- `GET /api/xkcd/random` - Get a random XKCD comic
- `POST /api/xkcd/send-to-subscribers` - Manually send XKCD comics to subscribers

## Environment Variables

### Backend (.env)

Create a `.env` file in the `backend` directory with the following variables:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
BREVO_API_KEY=your_production_api_key
FROM_EMAIL=verified@yourdomain.com
FRONTEND_URL=https://yourdomain.com
NODE_ENV=production
PORT=process_port_or_default
```

## Data Models

### User
```json
{
  "email": "String - User's email address",
  "isVerified": "Boolean - Email verification status",
  "verificationCode": "String - 6-digit verification code",
  "verifiedAt": "Date - Email verification timestamp",
  "unsubscribed": "Boolean - Unsubscribe status",
  "unsubscribedAt": "Date - Unsubscribe timestamp",
  "unsubscribeToken": "String - Secure token for immediate unsubscribe",
  "unsubscribeTokenExpires": "Date - Token expiration timestamp",
  "preferredTime": "String - Preferred delivery time (HH:MM format)",
  "preferredDays": "Array[String] - Preferred delivery days (mon-sun)",
  "createdAt": "Date - User registration timestamp"
}
```

## How It Works

1. Users enter their email to subscribe
2. A 6-digit verification code is sent via email
3. Users enter the code to verify their email
4. Verified users receive a random XKCD comic daily at their preferred time
5. Users can unsubscribe using the unsubscribe link in emails

## About XKCD

XKCD is a webcomic created by Randall Munroe that combines humor, science, math, technology, and philosophy in delightfully nerdy and often profound ways. Every XKCD comic is a delightful blend of intellectual humor and unexpected wisdom that'll brighten your day and maybe teach you something new!

## Deployment

The application is designed to deploy easily to Railway using the provided Dockerfile and railway.json configuration.

## License

MIT License - See LICENSE file for details.
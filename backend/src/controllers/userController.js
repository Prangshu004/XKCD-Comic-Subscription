const User = require('../models/User');
const emailService = require('../services/emailService');
const xkcdService = require('../services/xkcdService');
const { validationResult } = require('express-validator');

// Generate a 6-digit numeric verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Register a new user
const registerUser = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      if (user.unsubscribed) {
        // If unsubscribed, allow re-registration and reset status
        user.verificationCode = generateVerificationCode();
        user.unsubscribed = false; // Reset unsubscribed status
        user.unsubscribedAt = null; // Clear unsubscribe timestamp
        user.isVerified = false; // Reset verification status since they need to verify again
        await user.save();
      } else {
        return res.status(400).json({ msg: 'User already registered' });
      }
    } else {
      // Create new user
      user = new User({
        email,
        isVerified: false,
        verificationCode: generateVerificationCode()
      });
      await user.save();
    }

    // Send verification email
    const sent = await emailService.sendVerificationEmail(user.email, user.verificationCode);
    if (!sent) {
      return res.status(500).json({ msg: 'Error sending verification email' });
    }

    res.json({ msg: 'Verification code sent to your email' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};

// Verify email with code
const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    // Find user by email and verification code
    const user = await User.findOne({ 
      email: email.toLowerCase(),
      verificationCode: code
    });

    if (!user) {
      return res.status(400).json({ msg: 'Invalid verification code' });
    }

    // Update user as verified
    user.isVerified = true;
    user.verifiedAt = new Date();
    user.verificationCode = undefined; // Remove the verification code after use
    await user.save();

    // Re-schedule jobs to account for new user (now that they're verified)
    await xkcdService.scheduleDynamicXKCD();

    res.json({ msg: 'Email verified successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};

// Request unsubscribe verification
const requestUnsubscribe = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Email not found in subscription list' });
    }

    // Generate new verification code for unsubscribe
    user.verificationCode = generateVerificationCode();
    await user.save();

    // Send unsubscribe verification email
    const sent = await emailService.sendUnsubscribeVerificationEmail(user.email, user.verificationCode);
    if (!sent) {
      return res.status(500).json({ msg: 'Error sending unsubscribe verification email' });
    }

    res.json({ msg: 'Unsubscribe verification code sent to your email' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};

// Confirm unsubscribe with code
const confirmUnsubscribe = async (req, res) => {
  try {
    const { email, code } = req.body;

    // Find user by email and verification code
    const user = await User.findOne({ 
      email: email.toLowerCase(),
      verificationCode: code
    });

    if (!user) {
      return res.status(400).json({ msg: 'Invalid verification code' });
    }

    // Update user as unsubscribed
    user.unsubscribed = true;
    user.unsubscribedAt = new Date();
    user.verificationCode = undefined; // Remove the verification code after use
    await user.save();

    // Re-schedule jobs to account for unsubscribed user
    await xkcdService.scheduleDynamicXKCD();

    res.json({ msg: 'Successfully unsubscribed' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};

// Immediate unsubscribe with token (no verification code needed)
const immediateUnsubscribe = async (req, res) => {
  try {
    const { token } = req.params;

    // Find user by unsubscribe token
    const user = await User.findOne({ 
      unsubscribeToken: token,
      unsubscribeTokenExpires: { $gt: Date.now() } // Check if token hasn't expired
    });

    if (!user) {
      // Render HTML page with error message
      return res.status(400).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Unsubscribe - XKCD Subscription</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              margin: 0;
              padding: 0;
              min-height: 100vh;
              display: flex;
              justify-content: center;
              align-items: center;
            }
            .container {
              background: white;
              padding: 2rem;
              border-radius: 10px;
              box-shadow: 0 10px 30px rgba(0,0,0,0.2);
              text-align: center;
              max-width: 500px;
              width: 90%;
            }
            .error {
              color: #e74c3c;
              font-size: 1.2rem;
              margin: 1rem 0;
            }
            .back-link {
              display: inline-block;
              margin-top: 1rem;
              color: #3498db;
              text-decoration: none;
              font-weight: 500;
            }
            .back-link:hover {
              text-decoration: underline;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Unsubscribe Request</h1>
            <div class="error">
              Invalid or expired unsubscribe link. Please try again.
            </div>
            <a href="/" class="back-link">Back to Home</a>
          </div>
        </body>
        </html>
      `);
    }

    // Update user as unsubscribed
    user.unsubscribed = true;
    user.unsubscribedAt = new Date();
    user.unsubscribeToken = undefined; // Remove the token after use
    user.unsubscribeTokenExpires = undefined; // Clear expiration
    await user.save();

    // Re-schedule jobs to account for unsubscribed user
    await xkcdService.scheduleDynamicXKCD();

    // Render HTML page with success message
    res.status(200).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Unsubscribed - XKCD Subscription</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 0;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .container {
            background: white;
            padding: 2rem;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            text-align: center;
            max-width: 500px;
            width: 90%;
          }
          .success {
            color: #27ae60;
            font-size: 1.2rem;
            margin: 1rem 0;
          }
          .back-link {
            display: inline-block;
            margin-top: 1rem;
            color: #3498db;
            text-decoration: none;
            font-weight: 500;
          }
          .back-link:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Unsubscribed Successfully</h1>
          <div class="success">
            You have been successfully unsubscribed from XKCD comic emails.
          </div>
          <p>We're sorry to see you go. If you ever want to resubscribe, you can visit our website anytime.</p>
          <a href="/" class="back-link">Back to Home</a>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error(error.message);
    // Render HTML page with error message
    res.status(500).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Error - XKCD Subscription</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 0;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .container {
            background: white;
            padding: 2rem;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            text-align: center;
            max-width: 500px;
            width: 90%;
          }
          .error {
            color: #e74c3c;
            font-size: 1.2rem;
            margin: 1rem 0;
          }
          .back-link {
            display: inline-block;
            margin-top: 1rem;
            color: #3498db;
            text-decoration: none;
            font-weight: 500;
          }
          .back-link:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Server Error</h1>
          <div class="error">
            Something went wrong. Please try again later.
          </div>
          <a href="/" class="back-link">Back to Home</a>
        </div>
      </body>
      </html>
    `);
  }
};

// Update user's comic delivery preferences
const updatePreferences = async (req, res) => {
  try {
    const { email, preferredTime, preferredDays } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Validate time format (HH:MM)
    if (preferredTime && !/^[0-2]\d:[0-5]\d$/.test(preferredTime)) {
      return res.status(400).json({ msg: 'Invalid time format. Use HH:MM (24-hour format).' });
    }

    // Validate days if provided
    if (preferredDays && !Array.isArray(preferredDays)) {
      return res.status(400).json({ msg: 'Preferred days must be an array of day abbreviations (e.g., ["mon", "tue"])' });
    }

    const originalTime = user.preferredTime; // Store original value to detect changes

    // Update user preferences
    if (preferredTime) user.preferredTime = preferredTime;
    if (preferredDays) user.preferredDays = preferredDays;

    await user.save();

    // Only reschedule if the delivery time changed (which affects scheduling)
    if (originalTime !== user.preferredTime) {
      await xkcdService.scheduleDynamicXKCD();
    }

    res.json({ msg: 'Preferences updated successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};

// Get user's current preferences
const getPreferences = async (req, res) => {
  try {
    const { email } = req.query;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json({
      email: user.email,
      preferredTime: user.preferredTime,
      preferredDays: user.preferredDays
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};

module.exports = {
  registerUser,
  verifyEmail,
  requestUnsubscribe,
  confirmUnsubscribe,
  immediateUnsubscribe,
  updatePreferences,
  getPreferences
};
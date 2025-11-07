const brevo = require('@getbrevo/brevo');
const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    // Initialize Brevo API with API key using the correct modern approach
    if (process.env.BREVO_API_KEY) {
      try {
        // Create TransactionalEmailsApi instance directly
        this.emailApi = new brevo.TransactionalEmailsApi();
        // Set API key using the correct method
        this.emailApi.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);
      } catch (error) {
        console.error('Error initializing Brevo API:', error.message);
        // Fallback to SMTP only
        this.emailApi = null;
      }
    } else {
      // No API key configured, use SMTP only
      this.emailApi = null;
    }
    
    // Initialize SMTP transporter as fallback
    this.smtpTransporter = nodemailer.createTransport({
      host: process.env.BREVO_SMTP_HOST || process.env.SMTP_HOST || 'smtp-relay.brevo.com',
      port: process.env.BREVO_SMTP_PORT || process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.BREVO_SMTP_USER || process.env.SMTP_USER,
        pass: process.env.BREVO_SMTP_PASS || process.env.SMTP_PASS
      }
    });
  }

  async sendVerificationEmail(email, code) {
    const subject = 'Your Verification Code';
    const html = `<p>Your verification code is: <strong>${code}</strong></p>`;
    
    // Try Brevo API first if API key is available
    if (this.emailApi && process.env.BREVO_API_KEY) {
      try {
        const sendSmtpEmail = new brevo.SendSmtpEmail();
        sendSmtpEmail.to = [{ email, name: email }];
        sendSmtpEmail.subject = subject;
        sendSmtpEmail.htmlContent = html;
        sendSmtpEmail.sender = { 
          email: process.env.FROM_EMAIL || 'no-reply@example.com', 
          name: 'XKCD Subscription' 
        };

        const result = await this.emailApi.sendTransacEmail(sendSmtpEmail);
        console.log('Verification email sent via Brevo API successfully');
        return true;
      } catch (error) {
        console.error('Brevo API failed, falling back to SMTP:', error.message);
      }
    }
    
    // Fallback to SMTP
    try {
      const result = await this.smtpTransporter.sendMail({
        from: process.env.FROM_EMAIL || 'no-reply@example.com',
        to: email,
        subject: subject,
        html: html
      });

      console.log('Verification email sent via SMTP successfully:', result.messageId);
      return true;
    } catch (error) {
      console.error('SMTP fallback failed:', error);
      return false;
    }
  }

  async sendXKCDComicEmail(email, comicData, unsubscribeToken = null) {
    const subject = 'Your XKCD Comic';
    
    // Warn if FRONTEND_URL is not configured
    if (!process.env.FRONTEND_URL) {
      console.warn('WARNING: FRONTEND_URL not configured in environment variables. Unsubscribe links may not work correctly.');
    }
    
    // Create an unsubscribe link with token if available, otherwise use email parameter
    let unsubscribeLink;
    if (unsubscribeToken) {
      // Secure unsubscribe link with token
      unsubscribeLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/api/users/unsubscribe-token/${unsubscribeToken}`;
    } else {
      // Fallback to email parameter method
      unsubscribeLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/unsubscribe?email=${encodeURIComponent(email)}`;
    }
    
    // Check if unsubscribeLink is valid
    if (unsubscribeLink && !unsubscribeLink.startsWith('http')) {
      console.warn('WARNING: Unsubscribe link may be invalid due to missing FRONTEND_URL:', unsubscribeLink);
    }
    
    const html = `
      <h2>XKCD Comic</h2>
      <h3>${comicData.title}</h3>
      <img src="${comicData.img}" alt="XKCD Comic" style="max-width: 100%; height: auto;">
      <p>${comicData.alt || ''}</p>
      <p><a href="${unsubscribeLink}" id="unsubscribe-button" style="
        display: inline-block;
        padding: 10px 20px;
        background: linear-gradient(135deg, #EF476F, #FF7096);
        color: white;
        text-decoration: none;
        border-radius: 5px;
        font-weight: bold;
        margin-top: 15px;
      ">Unsubscribe</a></p>
    `;
    
    
    
    // Try Brevo API first if API key is available
    if (this.emailApi && process.env.BREVO_API_KEY) {
      try {
        const sendSmtpEmail = new brevo.SendSmtpEmail();
        sendSmtpEmail.to = [{ email, name: email }];
        sendSmtpEmail.subject = subject;
        sendSmtpEmail.htmlContent = html;
        sendSmtpEmail.sender = { 
          email: process.env.FROM_EMAIL || 'no-reply@example.com', 
          name: 'XKCD Subscription' 
        };

        const result = await this.emailApi.sendTransacEmail(sendSmtpEmail);
        console.log('XKCD comic email sent via Brevo API successfully:', result);
        return true;
      } catch (error) {
        console.error('Brevo API failed, falling back to SMTP:', error.message);
      }
    }
    
    // Fallback to SMTP
    try {
      const result = await this.smtpTransporter.sendMail({
        from: process.env.FROM_EMAIL || 'no-reply@example.com',
        to: email,
        subject: subject,
        html: html
      });

      console.log('XKCD comic email sent via SMTP successfully:', result.messageId);
      return true;
    } catch (error) {
      console.error('SMTP fallback failed:', error);
      return false;
    }
  }

  async sendUnsubscribeVerificationEmail(email, code) {
    const subject = 'Confirm Un-subscription';
    const html = `<p>To confirm un-subscription, use this code: <strong>${code}</strong></p>`;
    
    // Try Brevo API first if API key is available
    if (this.emailApi && process.env.BREVO_API_KEY) {
      try {
        const sendSmtpEmail = new brevo.SendSmtpEmail();
        sendSmtpEmail.to = [{ email, name: email }];
        sendSmtpEmail.subject = subject;
        sendSmtpEmail.htmlContent = html;
        sendSmtpEmail.sender = { 
          email: process.env.FROM_EMAIL || 'no-reply@example.com', 
          name: 'XKCD Subscription' 
        };

        const result = await this.emailApi.sendTransacEmail(sendSmtpEmail);
        console.log('Unsubscribe verification email sent via Brevo API successfully');
        return true;
      } catch (error) {
        console.error('Brevo API failed, falling back to SMTP:', error.message);
      }
    }
    
    // Fallback to SMTP
    try {
      const result = await this.smtpTransporter.sendMail({
        from: process.env.FROM_EMAIL || 'no-reply@example.com',
        to: email,
        subject: subject,
        html: html
      });

      console.log('Unsubscribe verification email sent via SMTP successfully!');
      return true;
    } catch (error) {
      console.error('SMTP fallback failed:', error);
      return false;
    }
  }
}

module.exports = new EmailService();

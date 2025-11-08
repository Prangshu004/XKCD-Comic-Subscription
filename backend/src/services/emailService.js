const brevo = require('@getbrevo/brevo');
const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    console.log('🚀 Initializing EmailService...');
    console.log('🪵 DEBUG LOG → ENV check:');
    console.log('   BREVO_API_KEY exists:', !!process.env.BREVO_API_KEY);
    console.log('   BREVO_SMTP_USER:', process.env.BREVO_SMTP_USER ? '✅ Set' : '❌ Missing');
    console.log('   BREVO_SMTP_PASS:', process.env.BREVO_SMTP_PASS ? '✅ Set' : '❌ Missing');
    console.log('   FROM_EMAIL:', process.env.FROM_EMAIL || 'default@domain.com');
    console.log('   FRONTEND_URL:', process.env.FRONTEND_URL || '⚠️ Not set');

    // Initialize Brevo API
    if (process.env.BREVO_API_KEY) {
      try {
        console.log('🔑 Using Brevo API key...');
        this.emailApi = new brevo.TransactionalEmailsApi();
        this.emailApi.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);
        console.log('✅ Brevo API initialized successfully.');
      } catch (error) {
        console.error('❌ Error initializing Brevo API:', error.message);
        this.emailApi = null;
      }
    } else {
      console.warn('⚠️ BREVO_API_KEY not found. Falling back to SMTP only.');
      this.emailApi = null;
    }

    // Initialize SMTP transporter as fallback
    console.log('🛜 Setting up SMTP transporter...');
    this.smtpTransporter = nodemailer.createTransport({
      host: process.env.BREVO_SMTP_HOST || process.env.SMTP_HOST || 'smtp-relay.brevo.com',
      port: process.env.BREVO_SMTP_PORT || process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.BREVO_SMTP_USER || process.env.SMTP_USER,
        pass: process.env.BREVO_SMTP_PASS || process.env.SMTP_PASS
      }
    });

    console.log('✅ SMTP transporter ready.');
  }

  // ------------------- VERIFICATION EMAIL -------------------
  async sendVerificationEmail(email, code) {
    console.log(`📨 Preparing verification email for ${email}...`);

    const subject = 'Your Verification Code';
    const html = `<p>Your verification code is: <strong>${code}</strong></p>`;

    // Try Brevo API first
    if (this.emailApi && process.env.BREVO_API_KEY) {
      try {
        console.log('📡 Attempting to send via Brevo API...');
        const sendSmtpEmail = new brevo.SendSmtpEmail();
        sendSmtpEmail.to = [{ email, name: email }];
        sendSmtpEmail.subject = subject;
        sendSmtpEmail.htmlContent = html;
        sendSmtpEmail.sender = { 
          email: process.env.FROM_EMAIL || 'no-reply@example.com', 
          name: 'XKCD Subscription' 
        };

        const result = await this.emailApi.sendTransacEmail(sendSmtpEmail);
        console.log('✅ Verification email sent via Brevo API successfully:', result?.messageId || '[No messageId]');
        return true;
      } catch (error) {
        console.error('❌ Brevo API failed:', error.message);
        console.error('🪵 DEBUG LOG: Error details →', error.response?.body || error);
      }
    }

    // Fallback to SMTP
    try {
      console.log('📬 Falling back to SMTP...');
      const result = await this.smtpTransporter.sendMail({
        from: process.env.FROM_EMAIL || 'no-reply@example.com',
        to: email,
        subject,
        html
      });
      console.log('✅ Verification email sent via SMTP:', result.messageId);
      return true;
    } catch (error) {
      console.error('❌ SMTP fallback failed:', error);
      return false;
    }
  }

  // ------------------- COMIC EMAIL -------------------
  async sendXKCDComicEmail(email, comicData, unsubscribeToken = null) {
    console.log(`🎨 Preparing XKCD comic email for ${email}...`);
    
    const subject = 'Your XKCD Comic';

    let unsubscribeLink;
    if (unsubscribeToken) {
      unsubscribeLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/api/users/unsubscribe-token/${unsubscribeToken}`;
    } else {
      unsubscribeLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/unsubscribe?email=${encodeURIComponent(email)}`;
    }

    console.log('🪵 DEBUG LOG → Unsubscribe link generated:', unsubscribeLink);

    const html = `
      <h2>XKCD Comic</h2>
      <h3>${comicData.title}</h3>
      <img src="${comicData.img}" alt="XKCD Comic" style="max-width: 100%; height: auto;">
      <p>${comicData.alt || ''}</p>
      <p><a href="${unsubscribeLink}" style="
        display:inline-block; padding:10px 20px;
        background:linear-gradient(135deg,#EF476F,#FF7096);
        color:white; text-decoration:none; border-radius:5px;
      ">Unsubscribe</a></p>
    `;

    if (this.emailApi && process.env.BREVO_API_KEY) {
      try {
        console.log('📡 Attempting to send comic via Brevo API...');
        const sendSmtpEmail = new brevo.SendSmtpEmail();
        sendSmtpEmail.to = [{ email, name: email }];
        sendSmtpEmail.subject = subject;
        sendSmtpEmail.htmlContent = html;
        sendSmtpEmail.sender = { 
          email: process.env.FROM_EMAIL || 'no-reply@example.com', 
          name: 'XKCD Subscription' 
        };

        const result = await this.emailApi.sendTransacEmail(sendSmtpEmail);
        console.log('✅ Comic email sent via Brevo API successfully');
        return true;
      } catch (error) {
        console.error('❌ Brevo API failed for comic email:', error.message);
        console.error('🪵 DEBUG LOG: Error details →', error.response?.body || error);
      }
    }

    // Fallback to SMTP
    try {
      console.log('📬 Falling back to SMTP for comic...');
      const result = await this.smtpTransporter.sendMail({
        from: process.env.FROM_EMAIL || 'no-reply@example.com',
        to: email,
        subject,
        html
      });
      console.log('✅ Comic email sent via SMTP successfully:', result.messageId);
      return true;
    } catch (error) {
      console.error('❌ SMTP fallback failed for comic:', error);
      return false;
    }
  }

  // ------------------- UNSUBSCRIBE EMAIL -------------------
  async sendUnsubscribeVerificationEmail(email, code) {
    console.log(`📨 Preparing unsubscription verification email for ${email}...`);
    const subject = 'Confirm Un-subscription';
    const html = `<p>To confirm un-subscription, use this code: <strong>${code}</strong></p>`;

    if (this.emailApi && process.env.BREVO_API_KEY) {
      try {
        console.log('📡 Attempting to send unsubscribe email via Brevo API...');
        const sendSmtpEmail = new brevo.SendSmtpEmail();
        sendSmtpEmail.to = [{ email, name: email }];
        sendSmtpEmail.subject = subject;
        sendSmtpEmail.htmlContent = html;
        sendSmtpEmail.sender = { 
          email: process.env.FROM_EMAIL || 'no-reply@example.com', 
          name: 'XKCD Subscription' 
        };

        const result = await this.emailApi.sendTransacEmail(sendSmtpEmail);
        console.log('✅ Unsubscribe verification email sent via Brevo API successfully');
        return true;
      } catch (error) {
        console.error('❌ Brevo API failed for unsubscribe email:', error.message);
        console.error('🪵 DEBUG LOG: Error details →', error.response?.body || error);
      }
    }

    try {
      console.log('📬 Falling back to SMTP for unsubscribe...');
      const result = await this.smtpTransporter.sendMail({
        from: process.env.FROM_EMAIL || 'no-reply@example.com',
        to: email,
        subject,
        html
      });
      console.log('✅ Unsubscribe verification email sent via SMTP:', result.messageId);
      return true;
    } catch (error) {
      console.error('❌ SMTP fallback failed for unsubscribe:', error);
      return false;
    }
  }
}

module.exports = new EmailService();

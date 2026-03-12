// server.js — Portfolio Backend
// Simple Express server: serves static files + handles contact form
// Replace EMAIL_* env vars with your real email credentials

const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ── MIDDLEWARE ──────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));  // Serve portfolio HTML/CSS/JS

// ── HEALTH CHECK ───────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── CONTACT FORM API ───────────────────────────────────────
app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;
  console.log('Received contact form submission:', { name, email, subject, message });

  // Basic validation
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email and message are required.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }

  // ── OPTION 1: Send via SMTP (Gmail / any SMTP) ──────────
  // Set EMAIL_USER, EMAIL_PASS, EMAIL_TO in your .env file
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS, // Use Gmail App Password, not your real password
        },
      });

      await transporter.sendMail({
        from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_TO || process.env.EMAIL_USER,
        replyTo: email,
        subject: `[Portfolio] ${subject || 'New message from ' + name}`,
        html: `
          <h2>New Portfolio Contact</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject || 'N/A'}</p>
          <hr/>
          <p>${message.replace(/\n/g, '<br/>')}</p>
        `,
      });

      return res.json({ success: true, message: 'Email sent!' });
    } catch (err) {
      console.error('Email error:', err.message);
      return res.status(500).json({ error: 'Failed to send email. Check server logs.' });
    }
  }

  // ── OPTION 2: Log to console (dev/demo mode) ─────────────
  console.log('\n📬 New Contact Form Submission:');
  console.log(`  Name:    ${name}`);
  console.log(`  Email:   ${email}`);
  console.log(`  Subject: ${subject || 'N/A'}`);
  console.log(`  Message: ${message}\n`);

  return res.json({ success: true, message: 'Received! (dev mode — no email sent)' });
});

// ── CATCH-ALL (SPA) ────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ── START SERVER ───────────────────────────────────────────
const server = app.listen(PORT, () => {
  console.log(`\n🚀 Portfolio server running at http://localhost:${PORT}\n`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n⚠️  Port ${PORT} is already in use.\n   Run: lsof -ti:${PORT} | xargs kill -9\n   Then restart with: npm start\n`);
    process.exit(1);
  } else {
    throw err;
  }
});

module.exports = app;

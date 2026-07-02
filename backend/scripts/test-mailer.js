#!/usr/bin/env node
/*
 Simple test harness for the Mailer.
 Usage:
  - Set ADMIN_TOKEN to call the backend endpoint: ADMIN_TOKEN=... node test-mailer.js
  - Or, run directly using SMTP env vars (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM): node test-mailer.js
*/
const axios = require('axios');

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1331';
const adminToken = process.env.ADMIN_TOKEN;

const payload = {
  to: process.env.TEST_MAIL_TO || 'you@example.com',
  subject: 'FocusWord test email',
  text: 'This is a test email from FocusWord test harness',
};

async function sendViaApi() {
  const url = `${API_URL}/mailer/test`;
  console.log(`Posting to ${url}`);
  const headers = {};
  if (adminToken) headers.Authorization = `Bearer ${adminToken}`;
  const resp = await axios.post(url, payload, { headers });
  console.log('API response:', resp.data);
}

async function sendDirect() {
  console.log('Sending directly via nodemailer using SMTP env vars');
  let nodemailer;
  try {
    nodemailer = require('nodemailer');
  } catch (err) {
    console.error('Please install nodemailer: npm install nodemailer');
    process.exit(1);
  }

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || `no-reply@focusword.com`;

  if (!host) {
    console.error('SMTP_HOST not set. Cannot send directly.');
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    host,
    port: Number(port),
    secure: process.env.SMTP_SECURE === 'true',
    auth: user && pass ? { user, pass } : undefined,
  });

  const info = await transporter.sendMail({
    from,
    to: payload.to,
    subject: payload.subject,
    text: payload.text,
  });
  console.log('Direct send info:', info);
}

(async () => {
  try {
    if (adminToken) {
      await sendViaApi();
      return;
    }

    // Try API without token first (might be restricted)
    try {
      await sendViaApi();
      return;
    } catch (e) {
      console.warn('API send failed, falling back to direct SMTP if available:', e.message || e);
    }

    await sendDirect();
  } catch (err) {
    console.error('Mailer test failed:', err);
    process.exit(1);
  }
})();

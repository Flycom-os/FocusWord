Mailer test harness
===================

This repository includes a small test harness for the Mailer implementation.

Usage
-----

1. Install dependencies (if needed):

```bash
cd backend
npm install nodemailer axios
```

2. Preferred: call the protected backend endpoint (requires an admin JWT):

```bash
export ADMIN_TOKEN="<your admin jwt>"
export TEST_MAIL_TO="you@example.com"
node scripts/test-mailer.js
```

3. Or send directly via SMTP env vars:

```bash
export SMTP_HOST=smtp.example.com
export SMTP_PORT=587
export SMTP_USER=youruser
export SMTP_PASS=yourpass
export TEST_MAIL_TO=you@example.com
node scripts/test-mailer.js
```

Notes
-----
- The script will try the backend API first (without token if not provided) and fall back to direct SMTP when possible.
- For production usage, configure `mailer_config` setting via the Settings API or the env vars.

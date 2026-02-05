Title: feat: simple auth UI — register & login (draft)

What:
- Minimal registration (/register), login (/login) UI and welcome screen (/welcome).
- Express server with simple file storage server/data/users.json.
- API:
  - POST /api/register — errors: missing_fields, email_taken, phone_taken
  - POST /api/login — errors: missing_fields, invalid_credentials

Why:
- Provide base flow for registration/login to build further features.

How to test:
(see README.md — Manual test)

Scope / Boundaries:
- NOT in this PR: email/SMS confirmation, token/session management, password hashing, captcha, security hardening.

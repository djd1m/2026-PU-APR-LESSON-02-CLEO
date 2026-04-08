# Security Rules: cleo-rf

## Data Protection (ФЗ-152)
- All user data encrypted at rest (AES-256)
- TLS 1.3 for all connections
- Raw CSV data: deleted after analysis, store only aggregates
- Privacy policy in Russian required before launch
- User consent before data processing
- Right to delete all data on request
- Data stored on Russian-located VPS

## Authentication
- Passwords: bcrypt with cost factor 12
- Sessions: JWT, 7-day expiry, refresh on activity
- Telegram: HMAC verification of init_data
- Rate limit login: 5 attempts per 15 minutes

## API Security
- Input validation: Zod schemas on ALL endpoints
- Rate limiting: per-user, per-endpoint (see Specification.md)
- CORS: whitelist production domain only
- CSRF: SameSite cookies + CSRF token
- File upload: max 10MB, CSV extension + magic bytes check

## Share Cards
- NEVER expose actual financial amounts in share card images
- Blur or replace with emoji bars
- Referral codes must be non-guessable (UUID-based)

## Secrets Management
- All secrets in .env file, NEVER committed
- Docker secrets in production
- AI API keys: server-side only, never exposed to client
- No secrets logged in any log level

## Content Safety
- AI-generated roasts pass through content guardrails
- Regex + keyword filter for offensive content
- Fallback to safe template if guardrail triggers
- Report button for users to flag inappropriate content

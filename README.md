Lonuhiri's website and admin panel, built with Next.js and React.

Confirmed contact details are maintained in `lib/siteContact.js`: phone
`+9604001114`, WhatsApp `+9607234800`, and `booking@lonuhiri.com`. The address is
hidden until confirmed. Instagram support is retained but hidden until a URL is
provided; Facebook and the starter brand logos/favicon have been removed.
There is no public registration endpoint. Admin user management and both database
seed endpoints remain available.

### User accounts and password recovery

User listing, creation, editing, deletion, and password reset require an admin
session. Passwords are hashed once by the User model. Email addresses are normalized
and duplicate email conflicts are reported explicitly. A password must contain at
least six characters and fit within bcrypt's 72-byte UTF-8 limit. Changing a password,
email, or role invalidates that user's previous sessions; changing your own login
details signs you out. You cannot delete or demote your own admin account.

Use **My Account → Profile & password** in the admin header to edit your account,
or `/admin/users` to manage another user. Password reset is handled by
`PUT /api/users/USER_ID/password` and changes no profile fields.

The old hardcoded `admin@admin.com` / `123456` login bypass has been removed. Accounts
created by the former double-hashing bug may need a password reset. Existing valid
admin sessions can reset those passwords through the user editor.

If no admin can sign in, use the retained `/api/seed-admin` recovery endpoint:

1. Generate a temporary random secret locally and set `ADMIN_BOOTSTRAP_TOKEN` in
   `.env.local`, then restart the server.
2. Send `POST /api/seed-admin` with `Authorization: Bearer YOUR_BOOTSTRAP_TOKEN`,
   `Content-Type: application/json`, and this body with your own values:

   ```json
   { "name": "Your name", "email": "your-admin-email", "password": "your-new-password", "resetPassword": true }
   ```

   An existing matching account is explicitly reset/promoted to admin. An absent
   account is created as admin. This is an operator-authorized recovery action;
   the endpoint never chooses or supplies default credentials.
3. Remove `ADMIN_BOOTSTRAP_TOKEN` and restart after recovering access.

Both seed endpoints remain present; database seeding now requires an admin session.
Public visitors can still submit booking requests, but viewing/changing bookings
and editing website content requires admin access.

## Getting Started

### Admin and contact pages

- Control panel: `/admin` (locally, `http://localhost:3000/admin`).
- Admin login: `/auth/login`. An admin account is required.
- Review management: `/admin/reviews`. Search, filter by source or homepage
  selection, sort by rating/date, and save homepage selection and display order.
  The homepage displays the first six selected, active reviews in display order.
- Contact form: `/contact`, linked in the desktop/mobile navigation and footer.
  Name, email, and message are required; a booking number is required when the
  visitor chooses an existing reservation.

There is no admin subdomain configured.

### Contact email delivery

The contact form sends messages to `booking@lonuhiri.com` using Resend's HTTPS API.
Messages come from `guest-RANDOM@messages.lonuhiri.com`; Reply-To is the guest's real
email, so staff can reply directly from their normal inbox. This is an outbound
alias, not a private two-way relay. No alias mailbox or inbound routing is needed.
For reservation enquiries, an HMAC of the guest email and supplied booking reference
creates a stable alias; other enquiries receive a unique alias per submission.
The submitted booking number is not proof of a verified booking.

To enable delivery:

1. Create a Resend account and add `messages.lonuhiri.com` as a **sending** domain.
2. Add the SPF/DKIM DNS records shown by Resend and wait for domain verification.
   Keep the existing MX records for `lonuhiri.com` and the booking inbox. Receiving
   email through Resend is not needed for this direct-reply setup.
3. Create an API key permitted to send from that domain.
4. Add these settings yourself to `.env.local`:

   ```dotenv
   RESEND_API_KEY=
   CONTACT_ALIAS_DOMAIN=messages.lonuhiri.com
   CONTACT_ALIAS_SECRET=
   ```

   Generate a random alias secret locally with
   `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`.
   Keep it private and stable; changing it changes future booking aliases.
5. Restart the website. The contact form can send from localhost once the domain
   and key are configured; no public callback URL is required.

The form clears only after provider acceptance; failures retain guest input. The
client reuses a submission ID on retries and passes it as Resend's idempotency key.
No contact messages are stored in this application's database. Resend processes the
email and retains data according to its own service settings. A honeypot and a
per-server-instance limit of five attempts per email per ten minutes provide basic
abuse protection; production hosting may need a shared limiter for stronger limits.

References: [Resend domain verification](https://resend.com/docs/dashboard/domains/introduction),
[Send API](https://resend.com/docs/api-reference/emails/send-email),
[Pricing](https://resend.com/pricing).

### Connect Google reviews

The importer uses the Google Business Profile API, which can paginate through all
reviews for a verified location you manage. Google Places returns a maximum of five
reviews and cannot supply the full collection.

1. Obtain approval for Business Profile API access for your Google Cloud project,
   enable the Google My Business API, and create OAuth client credentials.
   See [Google's setup guide](https://developers.google.com/my-business/content/basic-setup).
2. Authorize the Google account that owns/manages the verified location with scope
   `https://www.googleapis.com/auth/business.manage` and offline access. Obtain an
   OAuth refresh token using your own client ID and secret. For initial setup,
   [Google OAuth Playground](https://developers.google.com/oauthplayground/) can
   perform this flow: enable “Use your own OAuth credentials” in its settings,
   configure `https://developers.google.com/oauthplayground` as an authorized
   redirect URI on your OAuth web client, enter the scope, authorize, and exchange
   the authorization code. Keep the refresh token on the server. OAuth consent
   projects in Testing may issue refresh tokens that expire after seven days;
   configure the project's consent/publishing status appropriately for ongoing use.
3. Obtain the account ID from
   `GET https://mybusinessaccountmanagement.googleapis.com/v1/accounts` and the
   location ID from
   `GET https://mybusinessbusinessinformation.googleapis.com/v1/accounts/ACCOUNT_ID/locations?readMask=name,title`.
   Enable the Account Management and Business Information APIs for these discovery
   requests. Use a Bearer access token from the authorization flow. Use only the
   exact ID portion of `accounts/...` and `locations/...` in the settings below.
   IDs are strings; letters and symbols are accepted, and leading zeros are kept.
4. Add the following to `.env.local` (already gitignored). Do not commit credentials
   or place them in `NEXT_PUBLIC_*` variables:

   ```dotenv
   GOOGLE_BUSINESS_CLIENT_ID=
   GOOGLE_BUSINESS_CLIENT_SECRET=
   GOOGLE_BUSINESS_REFRESH_TOKEN=
   GOOGLE_BUSINESS_ACCOUNT_ID=
   GOOGLE_BUSINESS_LOCATION_ID=
   ```

   All five are required. `.env.example` lists the server configuration keys.
5. Restart the server and visit the homepage or `/admin/reviews` to start the first
   automatic import. The admin panel lists missing/invalid settings without
   displaying secrets; **Sync Google reviews** is available for an immediate refresh.
   Failed syncs show Google's HTTP status, error message, and available reason/quota
   details in the admin panel, with credentials redacted.

The importer refreshes the OAuth access token server-side and fetches every review
page (50 per request), including ratings without written comments. Reviews are
upserted by their Google resource name, so repeat syncs update rather than duplicate
them. New imports start unselected; existing selection, order, and active status
are preserved. Once a full fetch and save succeeds, reviews that
Google no longer returns are hidden. A failed/partial fetch does not update reviews.
The first review request from the website or admin panel after 24 hours
automatically refreshes all Google reviews. A database lease prevents overlapping
imports across requests/servers. Failed imports keep cached reviews and retry on
the first request after one hour. The admin sync button can force an immediate
refresh. No requests run while the website is idle; once hosting is chosen, a
background scheduler can be added if imports must run even with no traffic.
Very large profiles may need a background job on platforms with short request limits.

Google imports are a temporary cache. A MongoDB TTL index expires an imported
review 30 days after its last sync; public API responses also exclude stale Google
reviews while the TTL cleanup runs. Daily automatic refreshes renew this cache;
imports can expire during prolonged inactivity or authorization failure. Manual
reviews do not expire.
See [Google's content-storage policy](https://developers.google.com/my-business/content/policies#content_storage).

Review cards show the guest, rating, text, date, and Google source label, with no
outbound links. Admins can select Google reviews directly without maintaining
review URLs.

References:
[Business Profile review pagination](https://developers.google.com/my-business/reference/rest/v4/accounts.locations.reviews/list),
[Business Profile review fields](https://developers.google.com/my-business/reference/rest/v4/accounts.locations.reviews),
[Places review limit](https://developers.google.com/maps/documentation/places/web-service/reference/rest/v1/places),
[OAuth refresh tokens](https://developers.google.com/identity/protocols/oauth2/web-server#offline).

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

The stylesheet loads Noto Serif through Google Fonts.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!


# 🚗 Adam Motors — Car Dealership Web Application

A full-stack, production-ready car dealership platform built with **Next.js 15
(App Router)**, **TypeScript**, **Tailwind CSS**, **MongoDB Atlas**, and
**Cloudinary**.

Visitors can browse inventory, filter by category/brand/price/etc., save
favorites locally, leave reviews, and contact the dealership — all without an
account. A single admin account manages cars, categories, reviews, and
messages through a protected dashboard.

---

## 1. Prerequisites

Install these on your machine first:

| Tool | Version | Check with |
|---|---|---|
| **Node.js** | 20.x or later (LTS) | `node -v` |
| **npm** | 10.x or later (comes with Node) | `npm -v` |
| **Git** (optional) | any | `git --version` |

You will also need free accounts for:

- **[MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)** — database (must be a cluster/replica set — the free M0 tier works and supports transactions)
- **[Cloudinary](https://cloudinary.com/users/register/free)** — image storage & CDN
- *(Optional)* **[Google reCAPTCHA v3](https://www.google.com/recaptcha/admin/create)** — spam protection for forms
- *(Optional)* An email account for **SMTP** (e.g. Gmail with an [App Password](https://myaccount.google.com/apppasswords)) — for new-message notifications

---

## 2. Install Dependencies

From the project root:

```bash
npm install
```

This installs everything listed in `package.json`, including:

- `next`, `react`, `react-dom` — framework
- `mongoose` — MongoDB ODM
- `bcryptjs`, `jsonwebtoken`, `jose` — auth & password hashing
- `zod`, `react-hook-form`, `@hookform/resolvers` — validation & forms
- `cloudinary` — image storage SDK
- `nodemailer` — email notifications
- `recharts` — admin dashboard charts
- `lucide-react` — icons
- `isomorphic-dompurify` — HTML/XSS sanitization
- `tailwindcss`, `postcss`, `autoprefixer` — styling
- `typescript`, `tsx`, `dotenv` — tooling

> If you ever need to add a package later, run `npm install <package-name>`
> (or `npm install -D <package-name>` for a dev-only tool).

---

## 3. Set Up Environment Variables

Copy the example file:

```bash
cp .env.example .env.local
```

Then open `.env.local` and fill in each value. Here's where to get them:

### MongoDB Atlas
1. Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com).
2. Under **Database Access**, create a database user with a username/password.
3. Under **Network Access**, add your IP (or `0.0.0.0/0` for development).
4. Click **Connect → Drivers**, copy the connection string, and paste it into:
   ```
   MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/car-dealership?retryWrites=true&w=majority
   ```

### JWT Secret
Generate a strong random string:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Paste the output into `JWT_SECRET`.

### Cloudinary
1. Go to your [Cloudinary Console](https://console.cloudinary.com/).
2. Copy **Cloud Name**, **API Key**, and **API Secret** into:
   ```
   CLOUDINARY_CLOUD_NAME=...
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...
   ```
   (No upload preset needed — the app uses **signed** uploads generated
   server-side for security.)

### Email Notifications (optional but recommended)
If using Gmail:
1. Enable 2-Step Verification on your Google account.
2. Create an [App Password](https://myaccount.google.com/apppasswords).
3. Fill in:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=youraddress@gmail.com
   SMTP_PASS=<the 16-character app password>
   ADMIN_NOTIFICATION_EMAIL=youraddress@gmail.com
   ```
If you skip this, the contact form still saves messages to the database —
it just won't send an email alert.

### reCAPTCHA (optional but recommended)
1. Register your site at the [reCAPTCHA admin console](https://www.google.com/recaptcha/admin/create) (choose **v3**).
2. Add both keys:
   ```
   NEXT_PUBLIC_RECAPTCHA_SITE_KEY=...
   RECAPTCHA_SECRET_KEY=...
   ```
If you skip this, the review/contact forms still work — verification is
simply bypassed (rate limiting & honeypot fields still protect you).

### General Site Settings
Update these to match your dealership:

```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME="Prestige Motors"
NEXT_PUBLIC_DEALER_PHONE=+10000000000
NEXT_PUBLIC_DEALER_WHATSAPP=10000000000
NEXT_PUBLIC_DEALER_EMAIL=info@yourdealership.com
NEXT_PUBLIC_DEALER_ADDRESS="123 Auto Avenue, Motor City"
```

> ⚠️ **Important:** `.env.local` is gitignored and required — the app will
> throw an error on startup if `MONGODB_URI` or `JWT_SECRET` are missing.

---

## 4. Create Your Admin Account

There is **no public registration page** — admins are created via a CLI
script that connects directly to your database:

```bash
npm run create-admin -- --email admin@example.com --password "StrongPassword123!" --name "Admin"
```

This hashes the password with bcrypt and inserts the admin document into
MongoDB. Run this once (or again with a different email for additional
admins).

---

## 5. Run the Development Server

```bash
npm run dev
```

Visit:
- **Public site:** http://localhost:3000
- **Admin login:** http://localhost:3000/admin/login

Log in with the email/password you created in step 4. Start by adding a few
**Categories** (e.g. SUV, Sedan, Truck) under **Admin → Categories**, then add
your first **Car** under **Admin → Cars → Add New Car**.

---

## 6. Production Build

```bash
npm run build
npm run start
```

`npm run build` compiles and type-checks the app. `npm run start` runs the
optimized production server on port 3000 (set `PORT=xxxx` to change it).

---

## 7. Deployment

### Recommended: Vercel
1. Push this project to a GitHub/GitLab/Bitbucket repository.
2. Import the repo at vercel.com/new.
3. In **Project Settings → Environment Variables**, add every variable from
   your `.env.local` (use your **production** MongoDB URI, Cloudinary keys,
   etc., and set `NEXT_PUBLIC_SITE_URL` to your live domain).
4. Deploy. Vercel automatically runs `npm install` and `npm run build`.
5. After the first deploy, run the `create-admin` script **locally** pointed
   at your production `MONGODB_URI` (or run it from a one-off script/shell
   with the production env vars loaded) to create your admin login.

### Other Node hosts (Render, Railway, a VPS, etc.)
1. Set the same environment variables in your host's dashboard/secrets.
2. Build: `npm run build`
3. Start: `npm run start`
4. Ensure outbound network access to MongoDB Atlas, Cloudinary, and (if used)
   your SMTP provider and Google's reCAPTCHA endpoint.

### MongoDB Atlas Notes
- Car creation/deletion use **MongoDB transactions**, which require a
  replica set. Atlas clusters (including the free M0 tier) are replica sets
  by default — no extra configuration needed.
- Make sure your deployment's outbound IP is allowed in **Network Access**
  (or use `0.0.0.0/0` if your host has dynamic IPs).

---

## 8. Project Structure

```
app/                  Next.js App Router pages & API routes
  api/                Backend REST endpoints (auth, cars, categories, etc.)
  admin/              Admin dashboard (protected by middleware)
  cars/, categories/  Public inventory pages
  favorites/          LocalStorage-based favorites page
  contact/            Public contact page
actions/              Server-side data access functions (Server Components)
components/           Reusable UI components
hooks/                Client hooks (e.g. useFavorites)
lib/                  Core utilities (db connection, auth, cloudinary, etc.)
models/               Mongoose schemas
schemas/              Zod validation schemas
services/             Rate limiting, email, reCAPTCHA
scripts/              CLI scripts (create-admin)
middleware.ts         Route protection for /admin/*
```

---

## 9. Feature Checklist

- Public browsing — no account required
- Admin-only authentication (JWT + httpOnly cookies + bcrypt)
- Category & car CRUD with Cloudinary image uploads (signed, validated, optimized)
- Orphaned-image cleanup on failed/partial saves (MongoDB transactions)
- Search, filters (category, brand, year, fuel type, transmission, price), and sorting
- Shop-by-category sections & dedicated category pages
- Pagination
- Favorites stored in localStorage — no login required
- Review system with admin approval, rate limiting, honeypot & reCAPTCHA
- Contact form with email notifications, rate limiting & reCAPTCHA
- Admin dashboard with stats and charts (cars by category, monthly inquiries)
- SEO: dynamic metadata, Open Graph tags, sitemap.xml, robots.txt
- Security: CSP & security headers, input sanitization, CSRF checks, rate limiting
- Fully responsive (mobile, tablet, desktop)

---

## 10. Common Issues

- **"Please define the MONGODB_URI environment variable"** — `.env.local` is
  missing or wasn't created. Repeat step 3.
- **Login fails with "Invalid email or password"** — Run the `create-admin`
  script again (step 4) and double check the email/password.
- **Image upload widget doesn't open** — Check that all three `CLOUDINARY_*`
  variables are set and the dev server was restarted after editing `.env.local`.
- **Transactions error on car create/delete** — Ensure your `MONGODB_URI`
  points to an Atlas cluster (replica set), not a standalone `mongod`.

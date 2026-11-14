# 🌟 Talent Showcase Live Results & Standings

A production-ready, fully responsive web application for displaying real-time talent show competition results with official 1st, 2nd, and 3rd place podium standings, Excel spreadsheet bulk import, and a secure server-authenticated administrator management portal. Designed for instant deployment on **Vercel** with a persistent database.

---

## 🏆 Key Features

### 1. Public Viewer Website (Read-Only)
- **Zero-Barrier Access**: Anyone with the public link can view live results without signing in.
- **Strict Read-Only Enforcement**: Completely isolated viewer UI with no administrative controls, secrets, or write endpoints exposed.
- **Podium Display (1st, 2nd, 3rd Place)**:
  - Clear **Gold (1st)**, **Silver (2nd)**, and **Bronze (3rd)** place standings with winner names, performance details, and score badges.
  - Distinct **"Not announced"** placeholder state with clock badge for positions pending judge evaluation.
- **Real-Time Updates**:
  - Live Server-Sent Events (SSE) stream (`/api/events`) pushes admin updates to viewers instantaneously.
  - Automatic background fallback polling ensures seamless synchronization on mobile or interrupted connections.
- **Search & Filters**: Instant live filtering by category, participant name, school, round, or session segment, plus dual Card and Table views.

### 2. Authenticated Admin Portal
- **Server-Side Authentication**: Protected by signed HTTP-only JWT session cookies (`jose`), timing-safe credential verification, and route guards.
- **CRUD Operations**:
  - Add new competition categories, rounds (e.g. Finals, Semifinals), and segments (e.g. Morning Session).
  - Enter or edit 1st, 2nd, and 3rd place results and scores individually or in bulk.
  - Delete or reorder categories.
- **Live Publishing**: All changes are instantly broadcast to active viewers without manual refresh.
- **Master Excel Export**:
  - One-click export of complete competition standings and the 23-unit Church Point Table formatted in Excel directly from the admin header.
  - Public viewer export also available at `/api/export`.
- **Multi-Year Talent Show Editions**:
  - Ability to host a brand new talent show for 2027 or future years at `/admin/editions`.
  - Option to clone all 34 competition categories and 23 church units with a single click with clean scores.
  - Seamlessly switch between active and archived editions.

### 3. Intelligent Excel Spreadsheet Import
- **Flexible Column Mapping**: Upload any `.xlsx`, `.xls`, or `.csv` spreadsheet. The system inspects sheet names and columns, offering smart automatic header detection with full manual dropdown mapping.
- **Preview & Validation**: Pre-flight validation categorizes rows into `New`, `Conflict (Existing)`, and `Error (Missing data)`, displaying a full row-by-row preview before changes touch the database.
- **Collision Protection**: Choose between:
  - **Fill Blanks Only (Safe)**: Retains existing announced winners and only populates unannounced positions.
  - **Overwrite All**: Updates existing categories with spreadsheet data.
  - **Skip Conflicts**: Preserves all existing database records and only adds new categories.
- **Built-in Sample Template**: One-click download of a pre-formatted Excel template (`/admin/template`) directly from the admin panel.

---

## 🛠️ Tech Stack & Architecture

- **Framework**: Next.js 14 (App Router, Server Components & Serverless API Routes)
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS & Lucide React
- **Authentication**: `jose` (JWT) + HTTP-only, SameSite Secure Cookies + `bcryptjs`
- **Excel Processing**: SheetJS (`xlsx`) for server-side and client-side workbook parsing
- **Real-Time Communication**: Server-Sent Events (`/api/events`) with in-memory broadcaster + ETag sync
- **Persistent Database**:
  - **Local Development**: Persistent local SQLite via `@libsql/client` (zero configuration required).
  - **Vercel Production**: 
    - **Turso LibSQL** (Recommended, serverless SQLite with zero code changes)
    - **PostgreSQL** (Neon, Supabase, Vercel Postgres, or Railway via `pg` pool)

---

## 🚀 Local Development Setup

### 1. Prerequisites
- **Node.js**: v18.17.0 or higher (v20+ recommended)
- **pnpm**, **npm**, or **yarn**

### 2. Installation
Clone or navigate to the project directory:
```bash
cd "C:\Users\Sonu P Johnson\.gemini\antigravity\scratch\talent-show-results"
```

Install dependencies:
```bash
pnpm install
# or: npm install
```

### 3. Configure Environment Variables
Copy the example environment file:
```bash
cp .env.example .env
```

Default local configuration:
```env
# Persistent local database (auto-created in data/talent_show.db)
DATABASE_URL="file:./data/talent_show.db"
DATABASE_AUTH_TOKEN=""

# Administrator Credentials
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="TalentAdmin2026!"
ADMIN_JWT_SECRET="talent_show_secret_jwt_key_2026_super_prod_ready"

# Site Title
NEXT_PUBLIC_SITE_TITLE="Annual Talent Showcase 2026 - Live Results"
```

### 4. Seed Database with Initial Sample Data
Run the database seed script to initialize the schema and populate sample competition categories:
```bash
pnpm run seed
# or: node scripts/seed.mjs
```

### 5. Start Development Server
```bash
pnpm run dev
# or: npm run dev
```

Open your browser:
- **Public Viewer Portal**: [http://localhost:3000](http://localhost:3000)
- **Administrator Login**: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
  - **Username**: `admin`
  - **Password**: `TalentAdmin2026!`

---

## 📊 Excel Spreadsheet Import Guide

1. Log in to the Administrator Portal at `/admin/login`.
2. Click **Excel Import** in the top navigation bar (or navigate to `/admin/import`).
3. (Optional) Click **Download Sample Excel** to inspect or use the official template.
4. Drag and drop your `.xlsx`, `.xls`, or `.csv` file.
5. In **Step 2 (Map Columns)**:
   - Select your spreadsheet columns for `Category Name` (required), `Round`, `1st Place Winner`, `Details`, `Score`, `2nd Place`, and `3rd Place`.
   - The importer automatically detects headers with names like *Event*, *Category*, *1st*, *First*, *Score*, *Notes*, etc.
6. In **Step 3 (Preview & Validate)**:
   - Review the validation summary (Total Rows, New Items, Conflicts, Errors).
   - Select your **Overwrite Strategy** (*Fill Blanks Only*, *Overwrite All*, or *Skip Existing*).
7. Click **Apply Import & Publish Results**. The changes will commit to the persistent database and push live to all viewers instantly.

---

## ☁️ Vercel Deployment Instructions

Deploying this application to Vercel requires a persistent cloud database (since Vercel serverless functions have an ephemeral, read-only filesystem).

### Option A: Turso LibSQL (Recommended - Easiest & Free)

1. Create a free account at [turso.tech](https://turso.tech).
2. Create a new database:
   ```bash
   turso db create talent-show-db
   turso db show talent-show-db --url
   turso db tokens create talent-show-db
   ```
3. In your Vercel Project Settings under **Environment Variables**, add:
   - `DATABASE_URL`: `libsql://talent-show-db-<your-org>.turso.io`
   - `DATABASE_AUTH_TOKEN`: `<your-turso-auth-token>`
   - `ADMIN_USERNAME`: `<your-secure-admin-username>`
   - `ADMIN_PASSWORD`: `<your-secure-admin-password>`
   - `ADMIN_JWT_SECRET`: `<random-32-char-string>`

The application automatically uses `@libsql/client` against Turso with zero code changes.

---

### Option B: PostgreSQL (Neon, Supabase, Vercel Postgres, or Railway)

1. Create a PostgreSQL database on [Neon.tech](https://neon.tech), [Supabase](https://supabase.com), or via Vercel Postgres Storage.
2. In your Vercel Project Settings under **Environment Variables**, add:
   - `DATABASE_URL`: `postgresql://username:password@hostname:5432/dbname?sslmode=require`
   - `ADMIN_USERNAME`: `<your-secure-admin-username>`
   - `ADMIN_PASSWORD`: `<your-secure-admin-password>`
   - `ADMIN_JWT_SECRET`: `<random-32-char-string>`

The application detects `postgresql://` and automatically connects using the connection pool.

---

### Deploying via Git and Vercel

#### Step 1: Push to your Git Repository (GitHub / GitLab)
Run the following commands in the project folder:
```bash
cd "C:\Users\Sonu P Johnson\.gemini\antigravity\scratch\talent-show-results"

# 1. Add your remote repository URL (replace with your repo URL):
git remote add origin https://github.com/<your-username>/<your-repo-name>.git

# 2. Push your main branch:
git branch -M main
git push -u origin main
```

#### Step 2: Deploy to Vercel
1. Go to [vercel.com/new](https://vercel.com/new) and sign in.
2. Under "Import Git Repository", select your repository.
3. In **Environment Variables**, configure:
   - `ADMIN_USERNAME`: `admin` (or your chosen username)
   - `ADMIN_PASSWORD`: `<your-admin-password>`
   - `ADMIN_JWT_SECRET`: `<random-32-character-secret>`
   - `DATABASE_URL`: Your Turso LibSQL URL (`libsql://...`) or PostgreSQL URL (`postgres://...`)
   - `DATABASE_AUTH_TOKEN`: Your Turso token (if using Turso)
4. Click **Deploy**. Vercel will automatically build and deploy your talent show website!

---

## 🧪 Testing & Verification

An end-to-end automated verification suite is included in `scripts/test-verification.mjs`.

To run the verification suite:
```bash
pnpm run build
node scripts/start-and-test.mjs
```

### Verified Checks (32/32 Passing):
1. **Public Viewer Access**: Anonymous HTTP GET `/api/results` returns 200 OK without requiring authentication.
2. **Read-Only Guarantee**: Public responses contain zero secrets, password hashes, or admin tokens.
3. **Standings States**: 1st, 2nd, and 3rd place standings render accurately with proper "Not announced" states when positions are unannounced.
4. **Security Boundaries**: Unauthenticated access to `/api/admin/items` returns 401 Unauthorized.
5. **Authentication Flow**: Invalid credentials rejected; valid credentials issue a signed HTTP-only cookie.
6. **Live Admin Updates**: Creating and updating 1st, 2nd, and 3rd place results persists to the database and is immediately visible to public viewers.
7. **Excel Import**: File parsing, column header detection, validation preview, overwrite strategy handling, and live publication.

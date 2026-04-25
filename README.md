# ForensicLab — Digital Forensics Training Platform

A web-based training platform where users investigate simulated cybercrime scenes and build real digital forensics skills. Practice file analysis, network forensics, timeline reconstruction, and chain of custody documentation across 20+ attack scenarios.

---

## Features

- **20+ Crime Scenes** — Malware, ransomware, network attacks, insider threats, and web exploits
- **3 Difficulty Levels** — Beginner, Intermediate, Advanced
- **4-Tab Investigation Interface** — File Analysis, Timeline, Network Forensics, Chain of Custody
- **Hacker Terminal UI** — Dark terminal aesthetic with scanlines, glow effects, and real-time output
- **User Accounts** — Register and sign in with email + password, progress saved across sessions
- **Guest Access** — Try Scene 01 without an account
- **Score Tracking** — Per-scene best scores, accuracy percentage, total score on dashboard

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS v4 + CSS variables |
| Auth | NextAuth.js v5 (CredentialsProvider + bcrypt) |
| Database | PostgreSQL (Prisma ORM v5) |
| Hosting | Vercel + Prisma Postgres |
| Fonts | Share Tech Mono + Rajdhani (Google Fonts) |

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/LorenBenDavid/forensiclab.git
cd forensiclab
npm install
```

### 2. Set up environment variables

Create a `.env` file in the root:

```env
DATABASE_URL="postgresql://..."

NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-random-secret-here"
```

Generate a secure `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

### 3. Set up the database

```bash
npx prisma db push
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── login/page.tsx        # Sign in / Register
│   ├── dashboard/page.tsx    # User dashboard with all scenes
│   ├── lab/[id]/page.tsx     # Crime scene investigation interface
│   └── api/
│       ├── auth/[...nextauth]/  # NextAuth handler
│       ├── register/            # Account creation
│       └── attempt/             # Save scene attempts + update stats
├── components/
│   └── lab/
│       ├── lab-client.tsx       # Main 3-column lab UI
│       ├── onboarding-modal.tsx # Pre-scene briefing
│       ├── completion-modal.tsx # Post-scene score breakdown
│       ├── tab-timeline.tsx     # Attack timeline tab
│       ├── tab-network.tsx      # Network forensics tab
│       └── tab-custody.tsx      # Chain of custody tab
└── lib/
    ├── auth.ts                  # NextAuth config
    ├── prisma.ts                # Prisma client singleton
    └── scenes-data.ts           # All 20 scene definitions
```

---

## Crime Scene Library

### Malware & File Attacks
| # | Scene | Difficulty |
|---|---|---|
| 01 | The Disguised Script | Beginner |
| 02 | The Office Macro | Beginner |
| 03 | The Fake PDF | Intermediate |
| 04 | The DLL Hijack | Intermediate |
| 05 | The Memory Dump | Advanced |
| 06 | The Rootkit Trail | Advanced |

### Ransomware
| # | Scene | Difficulty |
|---|---|---|
| 07 | First Encryption | Beginner |
| 08 | Shadow Copy Wipe | Intermediate |
| 09 | Double Extortion | Advanced |

### Network & C2 Attacks
| # | Scene | Difficulty |
|---|---|---|
| 10 | The C2 Beacon | Beginner |
| 11 | DNS Tunneling | Intermediate |
| 12 | TOR Exit Node | Intermediate |
| 13 | Living Off the Land | Advanced |

### Insider Threat & Data Theft
| # | Scene | Difficulty |
|---|---|---|
| 14 | The Leaky USB | Beginner |
| 15 | The Email Dump | Intermediate |
| 16 | The Credential Harvest | Advanced |

### Web & Application Attacks
| # | Scene | Difficulty |
|---|---|---|
| 17 | The Web Shell | Beginner |
| 18 | The SQL Injection | Intermediate |
| 19 | The Supply Chain | Advanced |
| 20 | The Phishing Kit | Advanced |

---

## Deployment (Vercel)

1. Push the repository to GitHub
2. Import the project in [Vercel Dashboard](https://vercel.com)
3. Add the following environment variables in **Settings → Environment Variables**:

```
DATABASE_URL        your PostgreSQL connection string
NEXTAUTH_URL        https://your-project.vercel.app
NEXTAUTH_SECRET     your-random-secret
```

4. Deploy — the build script runs `prisma generate && next build` automatically

---

## Database Schema

| Table | Purpose |
|---|---|
| `User` | Registered users (name, email, hashed password) |
| `Attempt` | Per-scene investigation results and scores |
| `UserStats` | Aggregated stats per user (total score, accuracy) |
| `Scene` | Crime scene definitions (seeded from code) |
| `Account` / `Session` / `VerificationToken` | NextAuth internals |

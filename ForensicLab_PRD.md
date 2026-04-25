# ForensicLab
## Digital Forensics Training Platform
### Product Requirements Document — v1.0

---

## Project Summary

ForensicLab is a web-based training platform for digital forensic investigation. Users practice investigating simulated crime scenes across 20+ attack scenarios, building real-world skills in file analysis, network forensics, timeline reconstruction, and chain of custody documentation.

- **Target audience:** Beginners to intermediate — students with some technical background
- **Language:** English only
- **Deployment:** Web server — full-stack application with user accounts

---

## 1. Goals & Success Metrics

The platform exists to close the gap between theory and practice in digital forensics education. Users should finish a session able to articulate real investigation techniques in a job interview or on a LinkedIn post.

**Primary goals:**
- Teach forensic investigation techniques through hands-on simulation
- Track user progress across sessions with persistent accounts
- Provide 20+ varied crime scenes covering major attack categories
- Be deployable on a standard web server (VPS / cloud)

**Success metrics:**
- User completes at least 3 scenes per session on average
- Score accuracy improves measurably across repeated attempts
- Page load under 2 seconds on standard hosting

---

## 2. User Types & Authentication

### 2.1 User Roles

| Role | Description |
|---|---|
| Guest | Can view onboarding screen and attempt 1 demo scene — no account required |
| Registered User | Full access to all 20+ scenes, progress tracking, personal score history |
| Admin | Can add/edit crime scenes, view all user stats (future phase) |

### 2.2 Authentication

Authentication via Google OAuth and/or GitHub OAuth only. No email/password registration — reduces friction and avoids managing password resets.

- Login with Google
- Login with GitHub
- Session persisted in database — progress saved between sessions
- User profile: display name, avatar from OAuth provider, join date, scenes completed

**Recommended library:** NextAuth.js (if Next.js stack) or Passport.js

---

## 3. Technical Architecture

### 3.1 Recommended Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite (or Next.js) — SPA with hacker terminal aesthetic |
| Styling | Tailwind CSS + custom CSS variables for the dark terminal theme |
| Backend | Node.js + Express (or Next.js API routes) |
| Database | PostgreSQL — users, progress, scene completions, scores |
| Auth | NextAuth.js with Google + GitHub providers |
| Hosting | Any VPS (DigitalOcean, Render, Railway) or Vercel + Supabase |
| ORM | Prisma — type-safe DB access |

### 3.2 Database Schema (Core Tables)

| Table | Key Fields |
|---|---|
| users | id, name, email, avatar_url, provider, created_at |
| scenes | id, title, category, difficulty, description, files_json, solution_json |
| attempts | id, user_id, scene_id, score, findings_json, completed_at, time_taken |
| user_stats | user_id, total_score, scenes_completed, accuracy_pct, last_active |

---

## 4. Feature Specifications

### 4.1 Onboarding Screen

Shown to all users before they enter the lab. Contains:
- Scenario briefing — what happened and why the user is here
- 5-step guide: pick file → guess → AUTO SCAN → check tabs → NEW SCENE
- Color legend: HIGH / MED / LOW risk and what ✓ / ✗ mean
- START INVESTIGATION button
- Login prompt for guests — "Save your progress by logging in"

### 4.2 Crime Scene Interface (Main Lab)

The core investigation interface. Layout: 3-column grid inside a dark terminal-themed shell.

#### Left Panel
- List of files in the current scene with risk badges (HIGH / MED / LOW)
- YOUR GUESS section with 4 buttons, always fully visible with bright text
- Each button has a `?` hover tooltip explaining the technique in plain English
- **AUTO SCAN** button — large, green, impossible to miss
- **NEW SCENE** button below it
- Score bar at the bottom

#### Center Panel — Terminal
- Hacker-aesthetic terminal with scanline overlay and grid background
- Forensic engine output streams line by line with delays
- Color coding: red = HIGH, amber = MED, green = CLEAN, cyan = INFO
- Command input at bottom: `scan` | `new` | `help`
- After each guess: immediate ✓ or ✗ feedback with explanation

#### Right Panel — Live Analysis
- Risk score ring (0–100) with color matching severity
- Declared Type vs Actual Type
- Findings tags (EXT MISMATCH, SOCKET, etc.)
- SHA-256 hash display

### 4.3 Tab System

| Tab | Content |
|---|---|
| File Analysis | Main investigation interface |
| Timeline | Chronological attack reconstruction — nodes with timestamps and severity |
| Network Forensics | Outbound connections, geo analysis, DNS queries, protocol breakdown |
| Chain of Custody | Auto-logged on each correct finding + manual entry button |

### 4.4 Progress & Scoring

- Each scene has a maximum score (number of total findings)
- User score = correct guesses **before** AUTO SCAN is pressed
- Partial credit: findings discovered after AUTO SCAN are logged but scored lower
- Per-scene history: best score, number of attempts, last played
- Global stats on profile page: total scenes, average accuracy, score over time
- **No public leaderboard** — personal scores only

---

## 5. Crime Scene Library — 20 Scenarios

All scenes share the same data structure. Organized by category and difficulty.

### Malware & File Attacks (6 scenes)

| Scene | Difficulty | Description |
|---|---|---|
| 01 — The Disguised Script | BEGINNER | .jpg file that is actually Python malware. Classic magic bytes mismatch. (The demo scene from the prototype) |
| 02 — The Office Macro | BEGINNER | .docx file with embedded VBA macro that connects to C2 on open |
| 03 — The Fake PDF | INTERMEDIATE | .pdf with embedded PowerShell payload, timestamp falsified |
| 04 — The DLL Hijack | INTERMEDIATE | Legitimate app folder with malicious DLL replacing a system DLL |
| 05 — The Memory Dump | ADVANCED | Volatile memory artifact showing injected shellcode in explorer.exe |
| 06 — The Rootkit Trail | ADVANCED | Modified system files with altered timestamps and hidden registry keys |

### Ransomware (3 scenes)

| Scene | Difficulty | Description |
|---|---|---|
| 07 — First Encryption | BEGINNER | Files suddenly renamed with .locked extension, ransom note dropped |
| 08 — Shadow Copy Wipe | INTERMEDIATE | VSS deletion commands in logs, volume shadow copies removed |
| 09 — Double Extortion | ADVANCED | Exfiltration before encryption: data sent out, then files encrypted |

### Network & C2 Attacks (4 scenes)

| Scene | Difficulty | Description |
|---|---|---|
| 10 — The C2 Beacon | BEGINNER | Periodic outbound connections at regular intervals to foreign IP |
| 11 — DNS Tunneling | INTERMEDIATE | Encoded data exfiltrated via DNS TXT queries to attacker's domain |
| 12 — TOR Exit Node | INTERMEDIATE | Traffic routed through TOR, HTTPS exfiltration to onion address |
| 13 — Living Off the Land | ADVANCED | No malware files; attacker used built-in tools (certutil, powershell) |

### Insider Threat & Data Theft (3 scenes)

| Scene | Difficulty | Description |
|---|---|---|
| 14 — The Leaky USB | BEGINNER | Large file copies to removable drive at 11 PM, employee badge access logs match |
| 15 — The Email Dump | INTERMEDIATE | PST export of entire mailbox, compressed and sent via personal webmail |
| 16 — The Credential Harvest | ADVANCED | LSASS dump, pass-the-hash artifacts, lateral movement to finance server |

### Web & Application Attacks (4 scenes)

| Scene | Difficulty | Description |
|---|---|---|
| 17 — The Web Shell | BEGINNER | PHP web shell uploaded via file upload vulnerability, executed via browser |
| 18 — The SQL Injection | INTERMEDIATE | Database dump via blind SQL injection, data exfiltrated in response body |
| 19 — The Supply Chain | ADVANCED | Malicious npm package injected into build pipeline, runs on npm install |
| 20 — The Phishing Kit | ADVANCED | Credential harvesting site cloned from corporate login, victims redirected |

---

## 6. User Experience Flow

### 6.1 First Visit (Unauthenticated)
- Landing page with ForensicLab branding and brief value proposition
- "Try a free scene" CTA — opens demo scene (Scene 01) without login
- After completing demo: prompt to log in with Google/GitHub to save progress

### 6.2 Returning User
- Logged-in user lands on dashboard showing: last scene played, total score, scenes available
- Scene selector: grid of 20 cards organized by category and difficulty
- Each card shows: scene name, category badge, difficulty, best score if previously attempted
- Click card → onboarding screen → crime scene interface

### 6.3 Scene Completion
- After AUTO SCAN: modal shows "Investigation Complete" with score breakdown
- Shows: what you found correctly, what you missed, time taken
- Options: Retry scene | Next scene | Back to dashboard

---

## 7. Implementation Notes for Claude Code

### How to use this PRD

1. Open terminal in the `forensiclab` project folder
2. Run: `claude`
3. Say: "Build ForensicLab per this PRD" and attach this file
4. Start with: authentication + database schema + Scene 01 (the demo scene)
5. Iterate scene by scene — the data structure is consistent across all 20

### 7.1 Scene Data Structure (JSON Schema)

Each scene stored in DB or as seed file:

```json
{
  "id": "01",
  "title": "The Disguised Script",
  "category": "malware",
  "difficulty": "beginner",
  "scenario": "A company reported suspicious activity...",
  "files": [
    {
      "name": "vacation_photo.jpg",
      "risk": "HIGH",
      "declared_type": "JPEG Image",
      "actual_type": "Python Script",
      "risk_score": 75,
      "hash": "a3f9c2b1e4d7...",
      "findings": ["ext", "kw", "ts"],
      "terminal_lines": [...],
      "tags": [...]
    }
  ],
  "timeline": [...],
  "network_log": {
    "connections": [...],
    "dns_queries": [...],
    "stats": { "total": 4, "suspicious": 2, "exfiltrated_mb": 2.4 }
  },
  "solution": {
    "findings": ["ext", "kw", "ts"],
    "explanations": { "ext": "Magic bytes confirm Python...", ... }
  }
}
```

### 7.2 The 4 Guess Types (consistent across all scenes)

| Key | Name | Description |
|---|---|---|
| `ext` | Extension Mismatch | File magic bytes don't match declared extension |
| `kw` | Suspicious Keywords | Dangerous commands found in file content |
| `ts` | Timestamp Anomaly | File created/modified at unusual hours |
| `hash` | Hash Match | SHA-256 matches known malware signature |

### 7.3 Build Priority Order

- **Phase 1:** Auth (Google + GitHub) + user table + session management
- **Phase 2:** Scene 01 fully implemented — all 4 tabs working
- **Phase 3:** Progress tracking — save attempts and scores to DB
- **Phase 4:** Dashboard + scene selector with all 20 scenes
- **Phase 5:** Profile page with personal stats and history
- **Phase 6:** Polish — animations, mobile responsiveness, hint system

---

## 8. UI Design Reference

The interface uses a hacker terminal aesthetic. Key design tokens:

```css
--green: #00ff88;
--red: #ff3355;
--amber: #ffaa00;
--cyan: #00ccff;
--bg: #050a06;
--panel: #0a120b;
--text: #c8f5d8;
--text-dim: #5a8a6a;
--border: rgba(0,255,136,0.13);
--font-mono: 'Share Tech Mono', monospace;
--font-display: 'Rajdhani', sans-serif;
```

- Dark background with subtle grid overlay and scanlines
- All interactive text must be fully visible without hover — no hidden labels
- AUTO SCAN button: large, green, always in view
- Fonts: Share Tech Mono (terminal text) + Rajdhani (headings)

---

## 9. Out of Scope — v1

- Public leaderboard (personal scores only)
- Hebrew language toggle (English only)
- Admin CMS for adding scenes (use seed files)
- Mobile app (web-first)
- Payment / premium tier
- Real file execution or sandbox environments

---

*ForensicLab PRD v1.0 — Ready for development*
*Project folder name: `forensiclab`*

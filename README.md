# 🛡️ ChainSight

**Software Supply Chain Security & Blast-Radius Visualizer**

ChainSight is a full-stack, interactive security platform designed to map, analyze, and neutralize software supply chain vulnerabilities. By providing a live topological view of dependency trees, ChainSight helps engineering and security teams visualize the "blast radius" of compromised packages, simulate patches, and maintain immutable cryptographic audit trails.

---

## ✨ Key Features

*   **Interactive Blast Radius Topology:** A high-performance vector graph canvas visualizing exploit cascade pathways. Features directional markers, SVG glow filters, and animated dash arrays to track vulnerabilities from root origins down to compromised downstream microservices.
*   **Vulnerability Trace Inspector:** Multi-hop call chain visualization detailing how deep an exploit runs (e.g., direct require → transitive carrier → unguarded hook). 
*   **Automated Cross-Verification Engine:** A post-remediation scanner that verifies patch efficacy. It confirms CVE elimination, ensures the blast radius is reduced to zero, and checks dependency tree compatibility before attaching a "Verified Clean" badge.
*   **Cryptographic Audit History:** Maintains an immutable audit trail featuring **SLSA Level 3** attestations, Cosign signature verifications, and KMS signer identities, exportable as in-toto Statement JSON.
*   **SBOM Generation & Export:** Native dual-format exporter supporting **CycloneDX 1.5 (JSON)** and **SPDX 2.3 (JSON)** for seamless compliance reporting.
*   **Automated PR Generation:** One-click remediation that automatically generates pull requests with target branches, commit summaries, and lockfile diffs.
*   **Security Triage Alerts:** Real-time dashboard tracking active supply chain alerts with CVSS ratings, microservice reach, and SLA countdowns.

---

## 🏗️ Architecture & Tech Stack

The project is structured into three cleanly separated domains for full-stack scalability:

*   **Frontend:** React, TypeScript, Vite, Tailwind CSS v4
*   **Backend:** Node.js, Express, TypeScript
*   **Database:** Firebase (Cloud Firestore Enterprise), Google Auth

### Directory Structure

```text
├── database/                # Zero-trust security rules and validation blueprints
│   ├── firestore.rules      # Collection access and validation logic
│   ├── firebase-config.json # Cloud Firestore & Auth config
│   └── FirebaseContext.tsx  # React context for auth and real-time sync
├── frontend/                # Single Page App UI
│   ├── components/          # Visualizer Canvas, Modals, Nav, Alerts
│   ├── App.tsx              # Main application shell
│   └── index.css            # Tailwind v4 theme and styling
└── backend/                 # API & Server Logic
    ├── server.ts            # Express server entry point
    └── types.ts             # Shared types bridging frontend and database

# 🚀 COMMIT — B2B Receivables & Payment Recovery OS

[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.2-646cff.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.3-38bdf8.svg)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-4.19-000000.svg)](https://expressjs.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**COMMIT** is an intelligent, automated **B2B Receivables & Payment Recovery Operating System**. It bridges the gap between invoice generation and cash realization by converting informal customer payment promises into tracked, verified, and auto-reconciled financial commitments.

---

## 📸 Key Capabilities & Features

### 🧠 1. Smart Commitment Extraction Engine
* **NLP & Communications Parsing**: Automatically extracts promised payment dates, partial/full amounts, and payment channels from incoming customer emails, chats, and inbox messages.
* **Confidence Scoring**: Assigns confidence scores to extracted payment promises and flags low-confidence snippets for manual human-in-the-loop review.

### 🔄 2. Commitment Lifecycle Management
* **Strict State Engine**: Tracks every commitment through verified states:
  * `ACTIVE`: Promise confirmed, awaiting payment by target date.
  * `FULFILLED`: Payment received and fully reconciled.
  * `PARTIAL`: Partial payment received against promised amount.
  * `BROKEN`: Promised date passed without matching payment.
  * `EXPIRED` / `CANCELLED`: Invalidated or overridden promises.

### 💳 3. Razorpay Payment Gateway & Real-time Webhooks
* **Order Generation**: Generates dynamic payment links and Razorpay orders directly tied to invoice balances.
* **Secure Webhook Ingestion**: Receives `payment.captured` webhooks with **HMAC SHA256** signature verification.
* **Idempotency & Replay Protection**: Tracks processed webhook event IDs to prevent duplicate credit processing.

### 📊 4. Recovery Decision Matrix & Risk Scoring
* **Dynamic Policy Engine**: Configurable grace periods, reminder schedules, late fee policies, and escalation steps.
* **Customer Risk Profiling**: Categorizes accounts into risk bands (`Low`, `Medium`, `High`, `Critical`) based on payment history and broken promises.
* **Automated Batch Evaluation**: Evaluates aging invoices and active promises on schedule to trigger timely reminders.

### 🛡️ 5. Exception Center & Audit Logging
* **Exception Resolution Workflow**: Captures ambiguous payments, discrepancy cases, and over/under-payments for AR team review.
* **Immutable Audit Trail**: Logs every system event, status transition, payment capture, and manual override with timestamps and actor details.

### 🧪 6. Time-Travel Simulation Sandbox
* **Simulated Date Advancement**: Fast-forward system dates to test how commitments expire, break, or trigger escalations.
* **Razorpay Webhook Simulator**: Trigger mock `payment.captured` webhooks directly from the UI without relying on live payment gateways.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
|---|---|
| **Frontend Framework** | React 19, TypeScript, Vite 8 |
| **Styling & UI** | TailwindCSS v4, Lucide React Icons, Recharts |
| **Linting & Tooling** | Oxlint, TypeScript (strict mode) |
| **Backend Framework** | Node.js, Express, TypeScript, `ts-node-dev` |
| **Security & Integrations** | Razorpay SDK, Crypto (HMAC SHA256), `dotenv`, CORS |
| **Data Persistence** | In-Memory JSON Store with disk snapshotting (`store.json`) |

---

## 📁 Repository Structure

```
AI-Promise/
├── backend/                  # Express + TypeScript API Server
│   ├── data/
│   │   └── store.json        # Persistent JSON data store
│   ├── src/
│   │   ├── config/           # Default recovery policy settings
│   │   ├── data/             # Mock datasets & initial seed state
│   │   ├── db/               # In-memory storage & snapshot engine
│   │   ├── engine/           # Commitment extraction & recovery logic
│   │   ├── routes/           # REST API endpoints & webhook handlers
│   │   ├── scripts/          # Webhook test CLI scripts
│   │   ├── services/         # Razorpay gateway & signature verification
│   │   ├── types/            # Shared TypeScript domain models
│   │   └── index.ts          # Server entry point
│   ├── .env.example          # Environment variable template
│   └── package.json
│
├── frontend/                 # React 19 + Vite Dashboard
│   ├── src/
│   │   ├── assets/           # Static media assets
│   │   ├── components/       # Feature-driven UI components
│   │   │   ├── AuditTrail/       # Compliance log viewer
│   │   │   ├── BatchEvaluation/# Automated recovery engine runner
│   │   │   ├── Commitments/     # Commitment tracker & details
│   │   │   ├── Dashboard/       # Executive summary & metrics
│   │   │   ├── DecisionEngine/  # Recovery matrix & risk rules
│   │   │   ├── Exceptions/      # Exception center & manual review
│   │   │   ├── Inbox/           # Communications & message extractor
│   │   │   ├── Invoices/        # Invoice listing & payment modal
│   │   │   └── Simulator/       # Time-travel sandbox & webhook tester
│   │   ├── services/         # API integration client
│   │   ├── types/            # UI TypeScript definitions
│   │   ├── App.tsx           # Main application view container
│   │   └── main.tsx          # React root render
│   ├── index.html
│   └── package.json
│
└── README.md
```

---

## ⚡ Quick Start Guide

### Prerequisites
* **Node.js**: `v18.x` or higher
* **npm**: `v9.x` or higher

---

### 1. Backend Setup

Navigate to the `backend` directory, install dependencies, and start the development server:

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/` (or copy from `.env.example`):
```env
PORT=8000
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=commit_webhook_secret_key_12345
```

Start the backend API server:
```bash
npm run dev
```
> 🚀 Backend server will start at: **`http://localhost:8000`**

---

### 2. Frontend Setup

In a new terminal window, navigate to the `frontend` directory, install dependencies, and launch Vite:

```bash
cd frontend
npm install
npm run dev
```
> 🌐 Dashboard application will open at: **`http://localhost:5173`**

---

## 🌐 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Backend status, version & simulated system date |
| `GET` | `/api/dashboard` | Aggregated recovery metrics, promises & financial totals |
| `GET` | `/api/invoices` | List all tracked B2B invoices |
| `GET` | `/api/commitments` | Retrieve active, broken, and fulfilled payment promises |
| `POST` | `/api/commitments/extract` | Extract payment commitments from customer text snippets |
| `POST` | `/api/messages` | Process inbound customer messages & auto-extract promises |
| `POST` | `/api/payments` | Record manual or offline payment ingestion |
| `POST` | `/api/payments/create-order/:invoice_id` | Create a Razorpay order for invoice payment |
| `POST` | `/api/payments/simulate-webhook` | Simulate a Razorpay `payment.captured` event |
| `POST` | `/api/webhooks/razorpay` | Production Razorpay webhook target with HMAC signature check |
| `GET` | `/api/exceptions` | View outstanding exception cases needing review |
| `POST` | `/api/exceptions/:id/resolve` | Resolve an exception case manually |
| `GET` | `/api/audit` | Fetch complete audit log history |
| `POST` | `/api/simulation/date` | Set simulated system date (time-travel) |
| `POST` | `/api/simulation/reset` | Reset simulation store to default seed state |
| `GET` | `/api/policy` | Fetch active recovery policy configuration |
| `PUT` | `/api/policy` | Update recovery policy parameters |

---

## 🧪 Testing Razorpay Webhooks

You can test webhook processing using the included backend CLI script:

```bash
cd backend
npx ts-node src/scripts/testRazorpayWebhook.ts
```

Alternatively, use the built-in **Live Sandbox** tab in the web application UI to generate simulated webhook payloads with valid HMAC signatures at the click of a button!

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

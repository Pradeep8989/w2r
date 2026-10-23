# Waste to Resource (WTR) — Circular Recovery Platform

> **Hackathon Track:** Sustainability & Climate Tech (Problem ST-01: Waste to Resource)  
> **Core Principle:** Effortless circular material recovery for busy households through AI classification, transparent partner routing, and closed-loop scale verification.

---

## 🌟 Overview

**Waste to Resource** is a comprehensive, production-grade web application prototype built for a live hackathon demonstration. It addresses the fundamental hurdle in household waste segregation: **busy people lack the time and motivation to decode resin numbers or search municipal schedules**. 

The platform turns passive waste generation into active resource recovery through:
- **AI-Ready Waste Identification:** Upload or test sample waste photos to detect material streams (PET, HDPE, Cardboard, Aluminum, Glass, Organics, E-Waste).
- **Indicative Value Range:** Dynamic market valuation per kilogram without handling real fiat or pretending to process commercial cash.
- **Partner Matching & Routing:** Instant compatibility filtering between material categories and certified local recyclers.
- **Physical Scale Verification:** Recyclers certify gross and rejected weights on certified scales before closing the recovery loop.
- **Transparent Non-Cash Rewards:** Earn non-monetary Resource Points, unlock badges, maintain streaks, and redeem illustrative sponsor coupons.
- **Audit-Grade Life Cycle Telemetry:** Environmental metrics (landfill diversion, avoided CO2e) derived from physical scale measurements and documented formulas (EPA WARM v15, DEFRA 2024).

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+ or v20+)
- npm (v9+ or v10+)

### 1. Installation
Clone or navigate to the project directory and install dependencies:
```bash
npm install
```

### 2. Development Mode
Start the Vite development server locally:
```bash
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

### 3. Production Build
Validate types and compile the optimized production bundle:
```bash
npm run build
```

---

## 🧭 Live Hackathon Demonstration Workflow

The application includes an instant **Demo Role Switcher** in the top navigation bar allowing judges to test the closed-loop circular workflow in under 3 minutes without signing in:

```
[1. Customer: Scan & List] ➡️ [2. Recycler: Accept & Weigh] ➡️ [3. Customer: Points & Impact] ➡️ [4. Admin: AI & Model Audit]
```

### End-to-End Steps:
1. **Public Landing (`/`)**: View the value proposition, 3-step pipeline (*Identify &bull; Connect &bull; Recover*), and telemetry banner.
2. **Scan Waste (`/customer/scan`)**: Click **"Try sample: Plastic bottle"** (or Cardboard / Mixed waste), and click **"Analyze Waste"**.
3. **Assessment & Quantity (`/customer/analysis`)**: Review the AI confidence score, contamination prevention tips, and move the batch slider to **5.0 kg**. Observe how indicative recovery value updates in real time.
4. **Choose Recovery Route (`/customer/recovery`)**: Select a compatible partner (**EcoCycle Polymers & Fibers**) and proceed to create the listing.
5. **Publish Listing (`/customer/listings/new`)**: Review the pre-populated form and click **"Publish Waste Listing"**.
6. **Track Status (`/customer/listings/WTR-xxxx`)**: Inspect the live chronological audit timeline. Click the top button **"Demo: Process as Recycler &rarr;"**.
7. **Recycler Hub (`/recycler/requests/:id`)**: Confirm the pickup slot and click **"Accept & Confirm Pickup"**.
8. **Pickup Management (`/recycler/pickups`)**: Mark the batch as **"Collected"**, simulating driver collection from the resident's address.
9. **Facility Weighment (`/recycler/verification/:id`)**: Enter the certified gross scale weight (e.g., **5.2 kg**), verify the contamination score, and click **"Confirm Recovery & Award Customer Points"** to trigger celebratory confetti!
10. **Customer Closed Loop (`/customer/listings/:id` & `/customer/rewards`)**: Switch back to Customer mode to observe the certified weighment certificate, updated timeline, and **+104 Resource Points** credited to Sarah's wallet.
11. **Admin Inspection (`/admin/*`)**:
    - **AI Model Evaluation (`/admin/evaluation`)**: Inspect the 25-sample benchmark validation suite, per-class accuracy chart, and confusion breakdown.
    - **Before / After Impact (`/admin/impact`)**: Compare baseline municipal segregation against prototype performance with transparent numerators and denominators.
    - **Methodology & Formulas (`/admin/methodology`)**: Review exact mathematical formulas and EPA WARM / DEFRA sources.

> 💡 **Demo Reset:** Click **"Reset Demo Data"** in the top banner at any time to return the application back to its pristine seed state.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | React 19 + TypeScript |
| **Build Tool** | Vite 8 |
| **Styling** | Tailwind CSS v4 + Vanilla CSS Design Tokens |
| **Routing** | React Router v7 (`createBrowserRouter`) |
| **Icons** | Lucide React |
| **Data Visualization** | Recharts (Responsive Pie & Bar charts) |
| **Persistence** | Browser `localStorage` with reactive cross-component event sync |
| **Celebrations** | Canvas Confetti |

---

## 📐 Application Architecture & Folder Structure

```
src/
├── app/
│   └── App.tsx               # Root component with ToastProvider and Router
├── router.tsx                # Client-side route declarations
├── types/
│   └── index.ts              # Strongly typed interfaces (Listing, Recycler, Metrics, Factors)
├── data/
│   ├── seedData.ts           # Realistic seed listings, partners, depots, evaluation samples
│   └── materials.ts          # Configured material categories, rates, and emission factors
├── services/
│   ├── storageService.ts     # LocalStorage persistence, state sync & reset capabilities
│   ├── mockAnalysis.ts       # Simulated computer vision classifier with test scenarios
│   ├── listingService.ts     # Lifecycle state machine (draft -> collected -> verified -> confirmed)
│   ├── recyclerService.ts    # Material stream compatibility and routing logic
│   ├── impactService.ts      # Scale-weighted carbon & landfill diversion computations
│   └── evaluationService.ts  # Benchmark dataset accuracy and confusion matrix analyzer
├── components/
│   ├── layout/               # AppShell, Navbar, Sidebar, DemoBanner, RoleSwitcher, Breadcrumbs
│   ├── ui/                   # Button, Card, Badge, Modal, Toast, EmptyState
│   └── waste/                # StatusTimeline, MaterialTag, ConfidenceMeter
└── pages/
    ├── public/               # LandingPage.tsx
    ├── customer/             # Dashboard, Scan, Analysis, Recovery, Listings, Details, Points, Rewards, Impact
    ├── recycler/             # Dashboard, IncomingRequests, Details, PickupManagement, WeightVerification
    └── admin/                # Overview, MaterialPricing, Recyclers, Evaluation, BeforeAfterImpact, Methodology
```

---

## 🔬 Honesty & Simulation Disclosures

In accordance with responsible hackathon design principles:
1. **Simulated AI Inference:** Computer vision inference is currently simulated locally through pre-calibrated sample scenarios and filename heuristics. No live camera machine learning model or external paid API key is invoked.
2. **Indicative Values (No Real Money):** Financial figures represent indicative commodity indices ($/kg) to provide households with tangible perceived value. The platform contains **zero payment gateways, bank integrations, fiat deposits, or withdrawals**.
3. **Non-Cash Resource Points:** Points awarded upon scale weighment are non-monetary community incentive tokens redeemable for illustrative zero-waste partner coupons.
4. **Transparent Environmental Assumptions:** Measured weights are strictly distinguished from user estimates and sourced factors. Emission calculations reference documented standard models (EPA WARM v15 and DEFRA 2024).

---

## 🔮 Future Production Integration Points

When advancing from hackathon prototype to production pilot:
- **Edge Computer Vision:** Deploy a fine-tuned MobileNetV4 / YOLOv8-seg model on browser WebAssembly or edge cloud for real-time mobile camera classification.
- **IoT Smart Bin & Scale Integration:** Connect digital platform scales via Bluetooth Low Energy (BLE) / MQTT to directly ingest tare and gross weights into the verification ledger.
- **GIS Routing Optimization:** Integrate OSRM (Open Source Routing Machine) or Google Maps Distance Matrix to dynamically group pickups into fuel-optimal clusters.
- **Decentralized Verification Ledger:** Store material recovery certificates on an open carbon accounting ledger to facilitate corporate Scope 3 emission audits.

---

## 📄 License
MIT License &bull; Built for Hackathon Track ST-01 (Sustainability & Climate Tech).

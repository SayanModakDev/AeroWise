# AeroWise — Intelligent Urban Air Quality & Daily Action Assistant

> **PromptWars Challenge 6: Urban Air Quality Assistant**  
> *"Don't just tell people how polluted their city is. Help them decide what to do about it."*

---

## 1. Project Title
**AeroWise: Intelligent Urban Air Quality & Daily Action Assistant**

AeroWise is an action-oriented environmental intelligence application engineered to help families and urban communities navigate severe winter smog and chronic air pollution. Instead of merely displaying passive AQI numbers or generic awareness advice, AeroWise features a deterministic **Air-to-Action Decision Engine** paired with a grounded **Google Gemini GenAI Assistant** to deliver actionable, schedule-aware, and budget-sensitive daily plans.

---

## 2. Challenge Name & Chosen Vertical
- **Hackathon:** PromptWars 2026
- **Challenge:** Challenge 6 — Urban Air Quality Assistant
- **Vertical:** Environmental Intelligence, Public Health & Clean Mobility

---

## 3. Problem Statement
During severe winter smog episodes across South Asia and global industrial metropolitan areas, surface temperature inversions trap toxic fine particulate matter ($\text{PM}_{2.5}$) and coarse dust ($\text{PM}_{10}$) near ground level. Urban residents face severe health challenges, yet existing air quality apps suffer from critical shortcomings:
1. **Passive "Doomsday Dashboards":** They report alarming numbers without concrete, time-specific instructions on what actions to take.
2. **Generic, Impractical Advice:** Recommendations often assume unlimited budgets (telling everyone to buy ₹25,000 air purifiers) or indiscriminately advise staying indoors for weeks.
3. **Indoor Source Blindspots:** Apps ignore household combustion (biomass chulhas, incense sticks, smouldering mosquito coils, unventilated frying), which often spikes indoor particulate loads far above outdoor smog.
4. **Counter-Productive "Green" Guidance:** Recommending cycling or jogging along congested arterial corridors during severe smog causes severe alveolar particulate deposition.
5. **Regulatory Confusion:** Many commercial apps mislabel numerical weather model outputs or US AQI as official government statutory AQI.

---

## 4. Project Overview
AeroWise bridges the gap between atmospheric science and daily household decisions. Its core philosophy:

$$\text{Environmental Forecast} + \text{Household Context} + \text{Transparent Decision Rules} \longrightarrow \text{Actionable Daily Plan}$$

Key pillars:
- **Transparent Environmental Intelligence:** Clear separation of numerical model forecasts (CAMS Global via Open-Meteo) from official statutory regulatory monitoring stations (CPCB India).
- **Personalized Household Context:** Adapts to vulnerable family members (infants under 5, seniors, pregnancy, respiratory vulnerabilities), cooking fuel types, daily commute modes, and financial budget constraints.
- **Air-to-Action Decision Engine:** A pure, testable TypeScript module implementing 7 transparent rules to score, rank, and contextualize daily interventions.
- **Indoor Air Guardian:** Audits indoor combustion sources and guides zero-cost interventions (e.g., damp wet mopping instead of dry broom sweeping, timed cross-ventilation, avoiding ozone-generating purifiers).
- **Community Clean Air Action Board:** Connects individual households to community-level impacts (idle-free school gates, municipal reporting of open waste burning, carpooling, dust suppression).
- **Grounded GenAI Assistant:** Powered by Google Gemini with deterministic local fallback, zero PII transmission, and strict grounding in verified engine facts.

---

## 5. Target Users
1. **Families with Vulnerable Members:** Households with infants, young children under five, elderly grandparents, or individuals with asthma, COPD, or cardiovascular conditions.
2. **Daily Commuters & Field Workers:** Two-wheeler riders, pedestrians, bus/metro commuters, and outdoor delivery/construction personnel facing prolonged roadside exposure.
3. **Budget-Constrained Households:** Urban and peri-urban families seeking effective, zero-cost protective measures without buying expensive equipment.
4. **Schools & Resident Welfare Associations (RWAs):** Parent communities and neighborhood groups organizing collective anti-idling and dust-reduction efforts.

---

## 6. Key Features
| Module | Capability |
| :--- | :--- |
| **Air Quality Overview** | Current modelled $\text{PM}_{2.5}$ & $\text{PM}_{10}$ ($\mu\text{g/m}^3$), 24h modelled mean, 3-day forecast, forecast timestamp vs retrieval timestamp, WHO 2021 reference comparison, and direct link to official CPCB India portal. |
| **Location Intelligence** | Instant city search with Open-Meteo Geocoding API, browser geolocation detection (on explicit user click), and popular Indian metropolitan presets. |
| **Interactive 3-Day Trend Chart** | Custom SVG forecast chart plotting diurnal curves, inversion peaks, WHO 24h reference line ($15\,\mu\text{g/m}^3$), and lowest-exposure afternoon troughs. |
| **Personalized Household Setup** | Comprehensive configuration of household vulnerability, cooking fuel, ventilation, lifestyle, commute, and budget tier. Stored locally in `localStorage`. |
| **Air-to-Action Decision Engine** | Evaluates and ranks evidence-based recommendations across 6 categories with explicit separation of exposure protection vs emissions reduction. |
| **Today's Action Plan** | Showcases Top 3 Priority Actions, categorizes actions by time window (Morning, Afternoon, Evening, At Home, Commuting), includes an interactive checklist, and provides 1-click clipboard sharing. |
| **Indoor Air Guardian** | Source-by-source audit for biomass cooking, incense/mosquito coils, indoor smoke, kitchen exhaust, AC recirculation, and ozone purifier warnings. |
| **Community Action Board** | Practical community guides: Idle-Free School Pickup Gates, Open Waste Burning reporting via CPCB SAMEER / 311, shared commuting, and dust suppression. |
| **Grounded AI Assistant** | Google Gemini server-side integration grounded in current environmental facts and verified recommendations, with immediate deterministic local fallback. |
| **5 Demonstration Scenarios** | One-click simulation of 5 realistic urban hardship cases: Severe Winter Smog (Delhi), Sensitive Infant (Mumbai), Outdoor Worker (Kolkata), Biomass Cooking (Patna), and Zero-Budget Runner (Bengaluru). |

---

## 7. Architecture
```
                         ┌───────────────────────────────────────────────┐
                         │               Client (Next.js)                │
                         │   - React 19 / TypeScript / Tailwind CSS v4   │
                         │   - Browser LocalStorage (Zero Server PII)    │
                         └───────────────┬───────────────────────────────┘
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 ▼                                               ▼
   ┌───────────────────────────┐                   ┌───────────────────────────┐
   │    Air Quality Service    │                   │   Server-Side Assistant   │
   │  - Open-Meteo Geocoding   │                   │      (/api/assistant)     │
   │  - Open-Meteo Air Quality │                   ├───────────────────────────┤
   │  - CAMS Global (~45km)    │                   │   - Zod Schema Validation │
   │  - In-Memory Cache (15m)  │                   │   - Privacy Strip (No GPS)│
   └─────────────┬─────────────┘                   │   - Google GenAI SDK      │
                 │                                 │   - Local Engine Fallback │
                 ▼                                 └─────────────┬─────────────┘
   ┌───────────────────────────┐                                 │
   │ Air-to-Action Engine      │                                 │
   │  - 7 Deterministic Rules  │◄────────────────────────────────┘
   │  - Vulnerability Boost    │
   │  - Budget Sensitivity     │
   │  - Source Elimination     │
   │  - Top 3 / Time Grouping  │
   └───────────────────────────┘
```

- **Frontend:** Next.js 15 App Router, React 19, TypeScript (strict mode), Tailwind CSS v4, Lucide React icons.
- **Backend:** Next.js Server-Side API Route (`/api/assistant`) with server-only environment variables.
- **Environmental Data:** Open-Meteo Air Quality & Geocoding APIs (utilizing Copernicus Atmosphere Monitoring Service - CAMS Global numerical forecasts).
- **AI Integration:** Google Gemini API (`@google/generative-ai`) with deterministic local decision-engine fallback.
- **Testing:** Vitest with unit tests for data parsing, decision rules, WHO benchmarks, CPCB compliance, and AI fallback.

---

## 8. Decision-Engine Logic
The **Air-to-Action Decision Engine** (`src/lib/decision-engine/`) is an isolated, testable TypeScript module that evaluates candidate recommendations using 7 transparent rules:

1. **Rule 1 — Vulnerable Households:** When young children under 5, seniors, pregnant members, or individuals with cardio-respiratory conditions are present, protective actions (indoor stay during inversion peaks, certified N95 respirators, limiting vigorous exertion) receive top priority weighting.
2. **Rule 2 — Outdoor Activities:** Scans hourly forecast curves to identify lower-pollution diurnal windows (typically 12:00–15:30). *Crucially: lower relative pollution is never labelled as "safe air."* High pollution levels dynamically substitute outdoor cardio with indoor workouts.
3. **Rule 3 — Indoor Air Quality:** Audits combustion sources. Solid biomass cooking receives critical priority for fuel transition or outdoor displacement. Incense and mosquito coils trigger 100% free source-elimination advice (bed nets, wire mesh). Kitchen exhaust protocols and selective cross-ventilation rules prevent indoor accumulation without flooding the home with peak traffic smog.
4. **Rule 4 — Transport & Commuting:** Adapts to transport modes. Two-wheeler commuters receive visor and N95 barrier instructions. Private car drivers are prompted on anti-idling and trip chaining. Public transit (electric metro rail) is prioritized where accessible.
5. **Rule 5 — Budget Sensitivity:** Never assumes the user can afford expensive appliances. When "No Additional Budget" is selected, 100% free actions (wet mopping instead of dry sweeping, draft sealing with damp towels, schedule shifts, source elimination) are prioritized at the top.
6. **Rule 6 — Community Action:** Connects household habits to community airsheds via realistic, actionable steps: idle-free school pickup gates, municipal reporting of open burning, shared carpooling, and misted dust suppression.
7. **Rule 7 — Impact Explanation:** Explicitly separates **Exposure Protection** (how an action shields human lungs) from **Emissions Reduction** (how an action reduces community air pollution). *Never invents unsupported quantitative disease-prevention percentages or guaranteed carbon reductions.*

---

## 9. GenAI Integration & Grounding
- **Endpoint:** `POST /api/assistant`
- **Model:** Configurable via `GEMINI_MODEL` (defaults to `gemini-2.5-flash`).
- **Grounding Protocol:**
  1. The API route receives the user message, aggregated environmental facts (city, modelled $\text{PM}_{2.5}$, $\text{PM}_{10}$, trend), and the top candidate recommendations already evaluated by the decision engine.
  2. The system prompt strictly restricts the model to supplied facts and candidate actions. The model is forbidden from inventing live AQI readings, monitoring stations, or medical claims.
  3. Medical guardrails: For acute symptoms (chest tightness, severe breathlessness), the model is instructed to direct users immediately to in-person medical care.
- **Privacy Enforcement:** Exact GPS coordinates, personal names, and health vulnerability flags are stripped on the client and never sent to external AI servers.
- **Deterministic Fallback:** If `GEMINI_API_KEY` is not configured, or if the API times out or hits quota limits, the local decision-engine Q&A generator immediately answers the query. The user interface transparently badges responses as **"Generated by Google Gemini AI"** vs. **"Generated by AeroWise Decision Engine (Local Fallback)"**.

---

## 10. Environmental Data Sources
1. **Open-Meteo Air Quality API:**
   - Endpoint: `https://air-quality-api.open-meteo.com/v1/air-quality`
   - Parameters: `current=pm2_5,pm10`, `hourly=pm2_5,pm10`, `forecast_days=3`, `timezone=auto`
   - Attributes numerical predictions from the **Copernicus Atmosphere Monitoring Service (CAMS Global)** operated by ECMWF.
2. **Open-Meteo Geocoding API:**
   - Endpoint: `https://geocoding-api.open-meteo.com/v1/search`
   - Provides country-aware city search without third-party tracking.
3. **World Health Organization (WHO) 2021 Global Air Quality Guidelines:**
   - 24-hour mean reference limit: $\text{PM}_{2.5} = 15\,\mu\text{g/m}^3$, $\text{PM}_{10} = 45\,\mu\text{g/m}^3$.
4. **Central Pollution Control Board (CPCB) India NAQI:**
   - Reference breakpoints and direct statutory link to `https://app.cpcbccr.com/AQI_India/`.

---

## 11. Data Limitations & Assumptions
- **Spatial Resolution:** Global CAMS forecasts have a spatial resolution of approximately $0.4^\circ \times 0.4^\circ$ (~45 km). They reflect regional atmospheric dynamics and cannot represent hyper-local street-level microclimates or specific intersection hotspots.
- **Modelled vs. Regulatory Measurements:** Modelled forecasts are numerical weather predictions, **not validated regulatory measurements from government continuous ambient air quality monitoring stations (CAAQMS)**.
- **24-Hour Mean Data Completeness:** In compliance with environmental data standards, AeroWise calculates a 24-hour modelled mean **only when at least 18 valid hourly observations ($\ge 75\%$) are present**.
- **No Fabricated Data:** Missing API readings are stored as `null` and never silently replaced with zero.

---

## 12. Setup Instructions

### Prerequisites
- Node.js v18+ (tested on Node v20 & v26)
- npm v9+

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Sayan901/AeroWise.git
   cd AeroWise
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables (optional for Gemini AI; app works completely in Local Engine mode without an API key):
   ```bash
   cp .env.example .env.local
   ```
   Add your Google Gemini API key to `.env.local`:
   ```env
   GEMINI_API_KEY=your_google_ai_studio_api_key_here
   GEMINI_MODEL=gemini-2.5-flash
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 13. Environment Variables
See `.env.example`:
```env
# Google Gemini API Key (Server-side only)
# Get your API key from Google AI Studio: https://aistudio.google.com/
GEMINI_API_KEY=

# Google Gemini Model (e.g., gemini-2.5-flash or gemini-1.5-flash)
# Defaults to gemini-2.5-flash if unset
GEMINI_MODEL=gemini-2.5-flash
```

---

## 14. Testing Instructions
Run the full test suite using Vitest:
```bash
# Run unit tests
npm run test

# Run TypeScript typecheck
npm run typecheck

# Run Next.js linter
npm run lint

# Build production bundle
npm run build
```

---

## 15. Privacy & Security Considerations
- **No Hardcoded Secrets:** Zero API keys or secrets in source code or Git history.
- **Client-Side Persistence:** Household composition, fuel choices, and health sensitivity flags are stored **strictly in browser `localStorage`**.
- **No Medical Data Leakage:** When querying the GenAI Assistant, health vulnerability flags and exact coordinates are stripped. Only general environmental context and candidate action titles are passed.
- **No User Accounts or Tracking:** No paid database, no user tracking, no session cookies, and no advertising analytics.
- **Input Sanitization:** All incoming requests to `/api/assistant` are validated using strict Zod schemas with message length caps ($< 500$ characters).

---

## 16. Known Limitations
1. **Model Forecast Resolution:** As noted, CAMS forecasts cover ~45 km grid squares; local conditions near immediate industrial chimneys or unpaved construction corridors may experience higher localized particulate concentrations.
2. **Browser Geolocation:** Relies on browser device permissions; in high-density urban areas without GPS hardware, IP-based location may resolve to the nearest regional ISP gateway. Manual city search is provided as a seamless alternative.
3. **Free Gemini Tier Rate Limits:** When using Google AI Studio free tier keys, rate limits may apply during high query bursts. AeroWise automatically falls back to the deterministic local decision engine without interrupting the user.

---

## 17. Video Demonstration Link
- **Demonstration Video:** `[Video Demonstration Placeholder — To be added during hackathon submission]`
- **Interactive Script:** See [`DEMO_SCRIPT.md`](./DEMO_SCRIPT.md) for the complete step-by-step evaluation workflow.

---

## Attribution & Data Acknowledgments
- **Air Quality Forecasts:** Courtesy of [Open-Meteo](https://open-meteo.com/) under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), utilizing numerical models from the **Copernicus Atmosphere Monitoring Service (CAMS)** operated by ECMWF.
- **Health Guidelines:** [World Health Organization (WHO) Global Air Quality Guidelines (2021)](https://www.who.int/publications/i/item/9789240034228).
- **Regulatory Framework:** [Central Pollution Control Board (CPCB), Ministry of Environment, Forest and Climate Change, Government of India](https://cpcb.nic.in/).

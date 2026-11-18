# AeroWise — Interactive Demonstration Script
## PromptWars Challenge 6: Urban Air Quality Assistant

This script guides evaluators and users through a comprehensive, 5-minute walkthrough of **AeroWise: Your Daily Air-Quality Action Planner**.

---

### Phase 1: Immediate Value & Air Quality Overview (60 Seconds)

1. **Open the Application**:
   - The dashboard opens directly in **Live Data Mode** defaulted to New Delhi (or your detected city).
   - Notice the top notice bar clearly distinguishing **modelled atmospheric forecast data (CAMS Global, ~45 km grid)** from government station measurements.
   - Point to the direct, prominent button linking to the **Official CPCB National AQI Portal** (`app.cpcbccr.com/AQI_India/`).
2. **Review Real Environmental Metrics**:
   - View current modelled **PM2.5 (Fine Particulates)** and **PM10 (Coarse Dust)** in exact µg/m³ units.
   - Observe the **24h Modelled Mean** (calculated strictly when $\ge 18$ valid hourly observations are available).
   - Check the **WHO 2021 Reference Benchmark card** explaining health guideline ratios (e.g., $10\times$ WHO 24h limit of 15 µg/m³).
3. **Inspect the 3-Day Forecast Chart**:
   - Hover across the interactive SVG curve to see diurnal fluctuation (morning/evening inversion peaks vs. mid-afternoon trough).
   - Notice the green dashed **WHO 24h reference limit line (15 µg/m³)**.
   - Expand the **CPCB National AQI Reference Table** to understand regulatory category breakpoints and statutory completeness requirements.

---

### Phase 2: Stress-Testing the 5 Demonstration Scenarios (90 Seconds)

Click the **"Scenarios"** button in the header navigation to test how the **Air-to-Action Decision Engine** dynamically adapts across different urban hardships:

1. **Scenario 1: Severe Winter Smog (Delhi NCR)**:
   - *Condition*: PM2.5 = 295 µg/m³, winter temperature inversion, household with infant and elderly grandparent.
   - *Result*: The decision engine automatically promotes **"Restrict Strenuous Physical Exertion for Vulnerable Family Members"** and **"Certified N95/FFP2 Respirator for Transit"** to Critical priority.
2. **Scenario 2: Moderate Inversion & Sensitive Infant (Mumbai)**:
   - *Condition*: PM2.5 = 68 µg/m³, traditional morning agarbatti (incense) burning.
   - *Result*: Detects the indoor combustion source and prioritizes **"Extinguish Incense Sticks & Smouldering Coils"** to eliminate dangerous bedroom particulate spikes.
3. **Scenario 3: Outdoor Worker & Motorcycle Commute (Kolkata)**:
   - *Condition*: 9 hours daily roadside exposure, motorcycle transit, low budget.
   - *Result*: Surfaces **"Upgrade Two-Wheeler Commute with Sealed Mask & Visor"** and residential by-lane route diversion.
4. **Scenario 4: Indoor Biomass / Chulha Exposure (Patna Peri-Urban)**:
   - *Condition*: Solid firewood cooking, zero extra budget, mosquito coils.
   - *Result*: Critical priority for **Biomass Fuel Transition / Outdoor Cooking Shift** and zero-cost bed nets instead of burning coils.
5. **Scenario 5: Zero-Budget Runner & No Purifier (Bengaluru)**:
   - *Condition*: Renter with asthma who jogs outdoors; cannot afford an air purifier.
   - *Result*: Replaces outdoor running with indoor workouts; promotes zero-cost wet-mopping over dry broom sweeping (no equipment required).

---

### Phase 3: Personalized Household Setup & Privacy (45 Seconds)

1. Click the **"My Household"** tab.
2. Toggle flags:
   - Add a *Child Under 5* or *Respiratory Vulnerability*.
   - Change cooking fuel to *Induction* or *LPG*.
   - Toggle *Air Purifier* on or off.
   - Change *Budget Flexibility Tier* to "No Additional Budget".
3. Notice the green **Privacy Notice**:
   - All profile data is saved instantly to **browser `localStorage`**.
   - No medical flags, names, or GPS coordinates are ever transmitted to external servers or AI.

---

### Phase 4: Indoor Air Guardian Audit (45 Seconds)

1. Click the **"Indoor Air"** tab.
2. Review the four-pillar breakdown for each active household issue:
   - **Why It Matters**: Physiological risk explained.
   - **What to Change**: Specific behavioural step.
   - **Free or Low-Cost Alternative**: Accessible zero-cost alternative.
   - **Safety Consideration**: Fire, mould, or ozone hazard warnings.
3. Notice the clear warning against **ozone-generating air purifiers** and the recommendation for **wet mopping instead of dry broom sweeping (jhadu)** to prevent dust resuspension.

---

### Phase 5: Today's Action Plan & Execution Checklist (45 Seconds)

1. Click the **"Daily Planner"** tab.
2. Review the **Top 3 Priority Actions** featured in the header card.
3. Filter actions by **Time Window** (Morning, Afternoon, Evening, At Home, Commuting) or **Cost** (100% Free, Low Cost).
4. Expand an action card to inspect the **Rule 7 Impact Separation**:
   - **Exposure Protection Impact**: How the action shields personal lungs.
   - **Emissions Reduction Impact**: How the action reduces community pollution.
5. Check off completed items in the **Interactive Checklist**; notice the live progress bar.
6. Click **"Share Action Plan"** to copy a clean markdown summary for WhatsApp or email.

---

### Phase 6: Grounded GenAI Assistant & Local Fallback (45 Seconds)

1. Click the **"AI Assistant"** tab.
2. Click any of the pre-configured prompt chips:
   - *"How can I reduce indoor pollution without buying a purifier?"*
   - *"Why should I change my outdoor exercise time today?"*
   - *"What are low-emission commute alternatives for my routine?"*
3. Observe the response:
   - Clearly badged with its generation source (**Google Gemini AI** when `GEMINI_API_KEY` is configured, or **AeroWise Decision Engine (Local Fallback)**).
   - Expand **"View Verified Grounding Facts"** to verify that answers are anchored strictly in current modelled concentrations and decision-engine candidates.
   - Medical safety guardrails: clearly disclaims clinical medical advice and directs acute symptoms to professional emergency care.

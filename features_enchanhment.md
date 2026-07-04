# Crop Buddy - Proposed Features Enhancement Plan

This document outlines the detailed technical specifications and implementation plans for adding five high-value, client-side features to **Crop Buddy** to support farmers.

---

## 1. Weather-Based Spray Advisories (હવામાન આધારિત દવાની ભલામણો)

### A. Concept
A feature that informs farmers whether it is safe to spray pesticides or fungicides on their crops based on real-time weather forecasts (analyzing temperature, wind speed, and rain probability).

### B. Technical Architecture
*   **Weather Provider**: [Open-Meteo API](https://open-meteo.com/) (Free, open-source, requires no registration or API keys).
*   **Location Fetching**: HTML5 Geolocation API (`navigator.geolocation`).
*   **Safety Threshold Rules**:
    *   **Wind Speed**:
        *   `< 10 km/h`: Safe (🟢)
        *   `10 - 15 km/h`: Caution - drift risk (🟡)
        *   `> 15 km/h`: Danger - do not spray (🔴)
    *   **Rain Probability (within next 4 hours)**:
        *   `< 15%`: Safe (🟢)
        *   `15% - 30%`: Caution - potential wash-off (🟡)
        *   `> 30%`: Danger - high wash-off risk (🔴)
    *   **Temperature**:
        *   `15°C - 30°C`: Safe (🟢)
        *   `30°C - 35°C`: Caution (🟡)
        *   `> 35°C` or `< 10°C`: Danger - chemical evaporation or leaf stress (🔴)

### C. Implementation Steps
1.  Add a "Check Weather Advisor" button next to the analysis portal.
2.  On click, request user geolocation coordinates.
3.  Query the Open-Meteo hourly forecast API:
    ```
    https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&hourly=temperature_2m,precipitation_probability,wind_speed_10m&forecast_days=1
    ```
4.  Parse the forecast data for the next 4 hourly blocks.
5.  Apply the threshold logic and display a bilingual visual widget:
    *   *English*: "🟢 Safe to Spray: Winds are low, and no rain is expected."
    *   *Gujarati*: "🟢 દવા છાંટવા માટે અનુકૂળ સમય છે: પવન ઓછો છે અને વરસાદની સંભાવના નથી."

---

## 2. Voice Reader / Audio Narrator (ઓડિયો દ્વારા માહિતી)

### A. Concept
A text-to-speech button that reads out the leaf diagnostic results and treatment instructions in either English or Gujarati to aid farmers who find it difficult to read small text on screens.

### B. Technical Architecture
*   **Core Engine**: Web Speech Synthesis API (`window.speechSynthesis`), built directly into all modern web browsers.
*   **Bilingual Detection**: Identify which paragraphs contain Gujarati text or English text and map synthesis settings to the appropriate voice locale.

### C. Implementation Steps
1.  Add a speaker icon button (🔊) at the top of the Results Card.
2.  Write a script to compile the generated diagnosis name and treatment instructions into a plain reading string.
3.  Load the browser's supported system voices:
    ```javascript
    const voices = window.speechSynthesis.getVoices();
    ```
4.  Match locales:
    *   For English sections, set voice locale to `en-IN` (Indian English) or `en-US`.
    *   For Gujarati sections, set voice locale to `gu-IN`.
5.  Implement synthesis controls: Speak, Pause, and Stop. Automatically stop playback if the user uploads a new image or navigates away.

---

## 3. Dosage & Land Calculator (જમીન અને દવાની માત્રાનું કેલ્ક્યુલેટર)

### A. Concept
An interactive calculator where the farmer enters their land area, and the system automatically calculates the exact amount of pesticide product and water required to spray that area.

### B. Technical Architecture
*   **Inputs**:
    *   Land size (numerical input).
    *   Unit dropdown: **Acres** or **Bighas** (Standard conversion: 1 Acre = 2.5 Bigha in Gujarat).
*   **Data Models**:
    *   Map standard values: Most crop treatments require ~150 Liters of water per acre.
    *   Extract dosage ratios from `pesticides.json` (e.g. `2 ml / Liter` or `1.5 grams / Liter`).

### C. Implementation Steps
1.  Integrate a collapsible "Dosage Calculator" card within the analysis results panel.
2.  Input validation: Prevent zero or negative numbers.
3.  Calculate formulas:
    $$\text{Total Water (Liters)} = \text{Land Size (Acres)} \times 150$$
    $$\text{Total Pesticide} = \text{Total Water} \times \text{Dosage Ratio (per Liter)}$$
4.  Render the result card:
    *   *English*: "You need **{pesticide_qty}** of chemical mixed in **{water_qty} Liters** of water."
    *   *Gujarati*: "તમારે **{water_qty} લીટર** પાણીમાં **{pesticide_qty}** દવા મિશ્રણ કરવાની રહેશે."

---

## 4. Interactive Sowing-to-Harvest Calendar (પાક સમયપત્રક)

### A. Concept
A timeline tracking tool that tells the farmer what developmental stage their crop is in and what agricultural steps (watering, fertilizing, weeding, checking for specific diseases) they should execute this week.

### B. Technical Architecture
*   **Static Timeline Database**: A new metadata structure matching the 14 supported crops.
    *   *Example: Tomato Timeline*:
        *   Week 1–2: Transplanting, initial root watering.
        *   Week 3–4: Weeding, Nitrogen top-dressing.
        *   Week 5–7: Flowering stage (monitor for Bacterial Spot).
        *   Week 8–10: Fruit development (monitor for Early Blight / Spider Mites).
        *   Week 12+: Ripening & harvesting.

### C. Implementation Steps
1.  Create a separate page section or modal tab titled "Crop Calendar Planner / પાક સમયપત્રક".
2.  Add a dropdown to select one of the 14 crops and a date picker to choose the Sowing Date.
3.  Calculate `daysElapsed = today - sowingDate`.
4.  Generate and render an interactive vertical timeline list showing past completed milestones (greyed out), the active current week stage (highlighted in bright green with tips), and future milestones.

---

## 5. Camera Overlay Guides (કેમેરા ગાઈડ)

### A. Concept
A visual alignment stencil overlay placed on top of the live camera view finder to help farmers take high-quality macro leaf photographs, reducing errors from blurry or distant images.

### B. Technical Architecture
*   **Camera Hook**: HTML5 MediaDevices API (`navigator.mediaDevices.getUserMedia`).
*   **Stencil overlay**: A transparent absolute-positioned SVG/Canvas overlaying the `<video>` element containing a dashed leaf outline.

### C. Implementation Steps
1.  Add a "Open Live Camera" button to the leaf upload zone.
2.  Request camera hardware permissions. Start a rear-camera stream and feed it into a full-screen or boxed `<video>` tag.
3.  Draw a green leaf outline stencil using HTML5 Canvas or SVG positioned precisely in the center of the video box.
4.  Overlay guide messages:
    *   *English*: "Align leaf lesion inside the dashed outline. Hold steady."
    *   *Gujarati*: "પાનના રોગિષ્ઠ ભાગને તૂટક રેખાની અંદર ગોઠવો અને કેમેરો સ્થિર રાખો."

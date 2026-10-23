# Sepsis Sentinel — project prompt

Use this as a project specification in your coding assistant or as your own implementation checklist:

> Build a professional React + Vite dashboard named **Sepsis Sentinel**, an ICU early-warning research/demo interface. Use a restrained clinical design system: warm light-gray page background, white panels, deep navy text, teal as the primary accent, muted amber for elevated risk, and muted red for high-priority demo flags. Use DM Sans for UI text and IBM Plex Mono for numeric data. Create a fixed desktop sidebar that becomes a slide-in mobile menu, a compact top bar, consistent cards, responsive charts, accessible form controls, and clear hierarchy. Avoid excessive gradients, neon colors, huge headings, glassmorphism, and generic AI landing-page styling.
>
> Implement five navigable pages:
> 1. **Overview:** four KPI cards (patients monitored, high-priority flags, elevated flags, synthetic data completeness), risk distribution trend chart, current category donut chart, prioritised alert queue, and unit/pod snapshot.
> 2. **Patient Monitoring:** searchable patient roster with risk and pod filters; sortable patient list; patient selection; vitals columns for HR, SBP, respiratory rate, temperature, and SpO₂; patient trend chart; observation summary.
> 3. **Risk Analysis:** summary cards, ranked alert stream, risk category distribution, and grouped high/elevated counts by pod. Selecting an alert opens that patient in monitoring.
> 4. **Model Performance:** honest validation-pending state, planned metrics and evaluation checklist. Never invent AUROC/AUPRC values.
> 5. **About & Sources:** explain the demo data, risk-scoring limitations, intended architecture, data provenance, and responsible-use disclaimer.
>
> Use reusable React components and keep demo records separate from UI code. Use Recharts for charts and Lucide icons. All patient records in the starter are synthetic and all scores are heuristic demonstration values. Clearly label the interface as a research/demo prototype and never imply that it is clinically validated. Make all navigation, search, filters, risk threshold sliders, table selection, and alert actions work. Include responsive behavior, keyboard focus states, readable contrast, empty states, and reduced-motion support.
>
> Do not claim the website was written without assistance if it was not. The developer should understand the code, adapt the design, verify the implementation, and disclose assistance where required by the event rules.

## Suggested page-by-page implementation prompts

### Overview
Implement a calm, information-dense clinical dashboard. Make the four KPI cards easy to scan. Add an area chart for illustrative category trends, a donut chart for current risk distribution, a ranked alert list, and a care-pod snapshot. Keep the demo disclaimer visible.

### Patient Monitoring
Build a usable patient roster with search by patient ID/bed, category and pod filters, selected-row state, and a patient details section. Show the latest synthetic vitals and a 24-hour illustrative trend. Do not silently impute missing data or represent sample data as real.

### Risk Analysis
Show high/elevated/low distribution, prioritized alert records, and grouped pod counts. Let a user select an alert and navigate to the corresponding patient. Explain that category thresholds are configurable demo cutoffs, not clinical boundaries.

### Model Performance
Do not fabricate model results. Display validation pending, explain which metrics and safety evaluations are needed, and include an implementation checklist.

### About & Sources
Describe what is synthetic, what the score does and does not mean, and what would be required before connecting real clinical records or deploying a model.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite, typically `http://localhost:5173`.

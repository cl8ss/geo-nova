# Geo Nova

Geo Nova is an environmental intelligence platform concept for environmental intelligence demonstrations. The existing Phase 3 live-monitoring route now extends from a regional map into a global, hierarchical monitoring experience.

## Global Environmental Monitoring Map

The `/dashboard/live-monitoring` route uses a world-first drill-down hierarchy:

`Global → Country → Demo industrial site → Sensor → Live simulated environmental data`

The initial world view shows ten demonstration countries: Oman, Saudi Arabia, United Arab Emirates, Qatar, Kuwait, Bahrain, United States, United Kingdom, Germany, and Japan. Current seeded demo sites are associated with Oman; countries without seeded sites remain available as demo catalog entries without invented sensor statistics.

- World zoom (`<= 4`) shows country-level demo markers.
- Country/site zoom (`5–7`) shows demo industrial-site markers.
- Site zoom (`>= 8`) shows individual simulated sensor markers.
- Country, site, status, alert-severity, and combined search filters are available.
- Breadcrumbs and `Reset Global View` return through the hierarchy without reloading the browser.
- Country and site panels calculate counts and readings from the API/database response.
- The map preserves its Leaflet instance, scope, selection, and refresh behavior during the 10-second data refresh.

All locations, countries, facilities, readings, alerts, and thresholds are fictional demo data. Geo Nova does not currently monitor real-world countries, facilities, or physical sensors.

## Phase 3 capabilities

- Dedicated live-monitoring route at `/dashboard/live-monitoring`
- React Leaflet map using OpenStreetMap tiles
- Existing seeded sites, sensors, readings, and active alerts as the source of truth
- Normal, Warning, Critical, and Offline sensor states
- Sensor marker popups and a selected-sensor details panel
- Site, status, and sensor search filters
- Fit-all-sensors map control and automatic map fitting
- Automatic dashboard summary refresh every 10 seconds
- Sensor history loading for the selected sensor
- Loading, API error, empty-filter, and missing-selection states
- Responsive desktop, tablet, and mobile monitoring layouts
- Persistent simulated-data and fictional-coordinate disclosures

## Phase 4 capabilities

- `/dashboard/analytics` with selectable metric/period trends, site comparison, deterministic risk overview, explainable contributors, and automated demo insights
- `/dashboard/alerts` with status, severity, site/sensor/metric search, acknowledgement workflow, and alert detail explanations
- `/dashboard/reports` with print-friendly report previews and escaped CSV export
- Analytics, risk, report, and insight calculations derived from existing simulated readings, sensors, sites, and alerts without new analytics tables
- Bounded API responses, loading/error/empty states, responsive layouts, accessible controls, and persistent simulated-data disclosures

Phase 4 risk scores and insights are deterministic software demonstrations. They are not machine-learning predictions, official environmental limits, compliance evidence, medical guidance, emergency response, or real-world safety guarantees.

## Phase 5 — Smart Environmental Intelligence

- `/dashboard/intelligence` provides experimental statistical forecasting, rule-based anomaly detection, sensor-health summaries, smart insights, and summary cards.
- Intelligence API endpoints are `/api/intelligence/summary`, `/api/intelligence/forecast`, `/api/intelligence/anomalies`, `/api/intelligence/sensor-health`, `/api/intelligence/insights`, and `/api/intelligence/alert-context/:id`.
- Forecasts use a bounded linear trend over recent observations and support AQI, PM2.5, PM10, CO, H₂S, and VOC for 1-, 3-, or 6-hour horizons. Fewer than twelve observations produces an explicit insufficient-data state.
- Trend classification compares preceding and recent observation windows: changes below 5% are Stable; larger changes are Increasing or Decreasing; fewer than six observations is Insufficient data.
- Anomaly detection uses each sensor/metric's rolling mean and standard deviation. Absolute z-scores of 2 or 3 classify Unusual or Anomaly; a demonstration threshold crossing alone does not create an anomaly.
- Sensor health uses software-observable status, last-seen age, recent AQI variability, reading count, and battery level. It reports Healthy, Delayed, Unstable, or Offline and does not diagnose hardware.
- Insights are bounded rule-based records for increasing trends, unusual patterns, sensor-health states, and stable conditions. Alert context combines recent readings, trend, baseline, anomaly state, sensor health, related alerts, and existing deterministic risk.

Phase 5 does not include a validated machine-learning model. Forecasts are experimental estimates from simulated data; anomalies are unusual-pattern signals rather than incident confirmation; health is software-level monitoring; and all thresholds remain fictional demonstration values.

## Phase 2 capabilities

- React + TypeScript + Vite dashboard connected to a local API
- Fastify REST API on port `3001`
- Prisma with SQLite local database
- Three seeded demo industrial sites and eight simulated sensors
- Automatic simulated readings every 10 seconds
- Temperature, humidity, PM2.5, PM10, AQI, CO, H2S, and VOC readings
- Configurable demo-threshold alert engine with Info, Warning, and Critical severities
- Dashboard summary, sensor status, latest readings, history, and alert acknowledgement
- Clear simulated-data labeling throughout the UI and API

## Setup on Windows PowerShell

From the project directory:

```powershell
cd "D:\Desktop\GEO-NOVA pro"
npm install
npm run db:generate
npm run db:push
npm run db:seed
```

The database is stored locally at `prisma/dev.db` and is ignored by Git.

## Run the application

Run the frontend and backend together:

```powershell
npm run dev
```

Or run them separately:

```powershell
npm run start:api
npm run dev:web
```

The frontend runs at `http://localhost:5173` and the API runs at `http://127.0.0.1:3001`.

## Simulator

The backend starts the simulator automatically when the API starts. It generates a new reading for every online demo sensor every 10 seconds. Most values remain in a safe demo range; occasional simulated anomalies demonstrate warning and critical alert states.

To trigger an anomaly immediately for a presentation or local verification:

```powershell
Invoke-WebRequest -Uri "http://127.0.0.1:3001/api/simulator/demo-alert" -Method Post -ContentType "application/json" -Body "{}"
```

This system does not connect to physical sensors or external IoT devices.

## API endpoints

- `GET /health`
- `GET /api/countries`
- `GET /api/countries/:id/summary`
- `GET /api/countries/:id/sites`
- `GET /api/sites`
- `GET /api/sites/:id`
- `GET /api/sensors`
- `GET /api/sensors/:id`
- `GET /api/readings/latest`
- `GET /api/readings/history?hours=24`
- `GET /api/alerts`
- `POST /api/alerts/:id/acknowledge`
- `GET /api/dashboard/summary`
- `GET /api/simulator/status`
- `POST /api/simulator/demo-alert`
- `GET /api/analytics/trends?hours=24&metric=aqi`
- `GET /api/analytics/comparison?hours=24`
- `GET /api/analytics/risk?scope=global`
- `GET /api/analytics/insights?hours=24`
- `GET /api/reports/summary?hours=24`
- `GET /api/intelligence/summary`
- `GET /api/intelligence/forecast?metric=aqi&horizon=1`
- `GET /api/intelligence/anomalies?metric=aqi`
- `GET /api/intelligence/sensor-health`
- `GET /api/intelligence/insights`
- `GET /api/intelligence/alert-context/:id`

## Quality checks

```powershell
npm run lint
npm run typecheck:server
npm run build
```

## Structure

- `src/` — React frontend, dashboard, live monitoring route, landing page, API client, and reusable UI
- `src/components/live-monitoring/` — map, filters, connection state, site summary, and sensor details
- `server/src/` — Fastify app, REST routes, simulator, alert engine, database client
- `prisma/schema.prisma` — SQLite data model, including the additive Country → Site relationship
- `prisma/seed.ts` — idempotent demo countries, sites, sensors, and initial readings

## Important safety and scope note

Every country, sensor value, alert, threshold, site, coordinate, and dashboard status in the global monitoring map is simulated demo data. Map coordinates are fictional display coordinates and do not identify real facilities. The thresholds are software demonstration values and are not official occupational, environmental, or emergency safety limits. This project must not be used for real-world safety decisions.

Authentication, physical IoT integrations, external environmental feeds, machine learning, and the final risk-analysis engine remain outside Phase 3 scope.

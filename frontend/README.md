Agri-Advisory Platform (Frontend)
=================================

Overview
--------
A minimal, farmer-friendly web UI with high-contrast design. Mobile-first and accessible. Three sections:
- Crop Health (upload a leaf image → shows preset Mosaic Virus analysis)
- Future Plan (simple charts with sample data)
- Notification Center (sample daily messages)

Quick Start
----------
1) Serve the `frontend` folder using any static server:

```bash
cd frontend
python3 -m http.server 8000
# open http://localhost:8000
```

2) Use the top-centered menu to switch between sections. Only one section is visible at a time.

Behavior
--------
- Crop Health: Initially only an Upload button is visible. After choosing a leaf image, the image preview and preset Mosaic Virus analysis appear.
- Future Plan: Renders simple Canvas charts using static demo data:
  - Tomato market prices (Hyderabad) for the next 7 days
  - Weather forecast for 30 days
- Notification Center: Shows 3 sample messages (title + short description).

Backend Integration (Optional)
------------------------------
Endpoints (if available):
- POST `/upload` (form-data: `file`) → store uploaded image
- GET `/crop-health` → return disease info JSON (schema similar to `mosaicVirusInfo`)
- GET `/market-forecast` → market & weather JSON
- GET `/notifications` → list of messages

Notes:
- The UI uses static/sample data by default and does not depend on a backend to run.
- If the backend is present, the upload action will POST to `/upload`. Failures are ignored in demo mode.

Accessibility & Design
----------------------
- High contrast colors, large buttons, readable fonts (Inter fallback to system fonts)
- Keyboard-focus styles, ARIA roles on tabs/sections
- Mobile-first layout, large tap targets

Files
-----
- `index.html`: Main layout with three sections and centered navigation
- `style.css`: High-contrast, mobile-first styles
- `script.js`: Tabbed navigation, image upload/preview, chart rendering, and sample notifications



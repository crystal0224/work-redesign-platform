# Workshop Screenshot Capture Script

This script automatically captures full-page screenshots (including scrolled content) of all 11 workshop steps.

## Prerequisites

```bash
npm install puppeteer
```

## Usage

1. Make sure the frontend dev server is running on `http://localhost:3000`
2. Run the script:

```bash
node scripts/capture-screenshots.js
```

## What it does

1. Opens a browser window (headless: false for visibility)
2. Navigates to `http://localhost:3000/workshop`
3. For each step (1-11):
   - Waits for page to load
   - Captures **full-page screenshot** (including all scrolled content)
   - Clicks the "빠른 테스트" button to advance to next step
   - Saves screenshot to `screenshots/step_X_fullpage.png`

## Output

Screenshots will be saved to:
```
frontend/screenshots/
├── step_1_fullpage.png
├── step_2_fullpage.png
├── step_3_fullpage.png
├── ...
└── step_11_fullpage.png
```

## Key Feature

Uses `fullPage: true` option in Puppeteer's screenshot method to capture the **entire page including scrolled content**, not just the viewport.

## Troubleshooting

- If the script fails to find the "빠른 테스트" button, it will try an alternative XPath selector
- Adjust `waitForTimeout` values if your system is slower
- Check that port 3000 is accessible

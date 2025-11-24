import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

interface WorkshopStepUI {
  stepNumber: number;
  stepName: string;
  url: string;
  pageTitle: string;
  mainHeading: string;
  subHeading: string;
  instructions: string[];
  inputFields: {
    label: string;
    type: string;
    placeholder: string;
    required: boolean;
  }[];
  buttons: string[];
  helpText: string[];
  warnings: string[];
  features: string[];
}

interface UISnapshot {
  timestamp: string;
  frontendVersion: string;
  baseUrl: string;
  steps: WorkshopStepUI[];
}

const WORKSHOP_STEPS = [
  { number: 1, path: '/workshop', name: '워크샵 시작' },
  { number: 2, path: '/workshop?step=2', name: '팀 정보 입력' },
  { number: 3, path: '/workshop?step=3', name: '팀원 정보 입력' },
  { number: 4, path: '/workshop?step=4', name: '역할 입력' },
  { number: 5, path: '/workshop?step=5', name: '업무 내용 입력' },
  { number: 6, path: '/workshop?step=6', name: 'AI 업무 추출' },
  { number: 7, path: '/workshop?step=7', name: 'AI 업무 분석 결과' },
  { number: 8, path: '/workshop?step=8', name: 'AI 교육' },
  { number: 9, path: '/workshop?step=9', name: '1:1 상담' },
  { number: 10, path: '/workshop?step=10', name: '워크플로우 설계' },
  { number: 11, path: '/workshop?step=11', name: '워크샵 완료' }
];

async function extractStepUI(page: Page, step: typeof WORKSHOP_STEPS[0], baseUrl: string): Promise<WorkshopStepUI> {
  const url = `${baseUrl}${step.path}`;

  console.log(`  📄 Step ${step.number}: ${url}`);

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 10000 });
    await page.waitForTimeout(2000); // Wait for dynamic content
  } catch (error) {
    console.warn(`  ⚠️  Failed to load ${url}, using fallback`);
  }

  // Extract page title
  const pageTitle = await page.title().catch(() => '');

  // Extract main heading (h1, h2)
  const mainHeading = await page.locator('h1, h2').first().textContent().catch(() => '') || '';
  const subHeading = await page.locator('h3, h4').first().textContent().catch(() => '') || '';

  // Extract instructions and guide text
  const instructions: string[] = [];
  const instructionElements = await page.locator('p, li, [class*="instruction"], [class*="guide"], [class*="description"]').all();
  for (const elem of instructionElements.slice(0, 10)) {
    const text = await elem.textContent();
    if (text && text.trim().length > 10 && text.trim().length < 300) {
      instructions.push(text.trim());
    }
  }

  // Extract input fields
  const inputFields: WorkshopStepUI['inputFields'] = [];
  const inputs = await page.locator('input, textarea, select').all();

  for (const input of inputs) {
    const tagName = await input.evaluate(el => el.tagName.toLowerCase());
    const type = await input.getAttribute('type') || tagName;
    const placeholder = await input.getAttribute('placeholder') || '';
    const ariaLabel = await input.getAttribute('aria-label') || '';
    const name = await input.getAttribute('name') || '';
    const required = await input.getAttribute('required') !== null;

    // Try to find associated label
    let label = ariaLabel || name;
    try {
      const inputId = await input.getAttribute('id');
      if (inputId) {
        const labelElement = await page.locator(`label[for="${inputId}"]`).first();
        const labelText = await labelElement.textContent().catch(() => '');
        if (labelText) label = labelText.trim();
      }
    } catch {}

    // If no label found, try parent label
    if (!label) {
      try {
        const parentLabel = await input.locator('..').locator('label').first().textContent().catch(() => '');
        if (parentLabel) label = parentLabel.trim();
      } catch {}
    }

    inputFields.push({
      label: label || placeholder || type,
      type,
      placeholder,
      required
    });
  }

  // Extract buttons
  const buttons: string[] = [];
  const buttonElements = await page.locator('button, [role="button"], a[class*="button"]').all();
  for (const btn of buttonElements) {
    const text = await btn.textContent();
    if (text && text.trim()) {
      buttons.push(text.trim());
    }
  }

  // Extract help text and warnings
  const helpText: string[] = [];
  const warnings: string[] = [];

  const helpElements = await page.locator('[class*="help"], [class*="hint"], [class*="tip"]').all();
  for (const elem of helpElements) {
    const text = await elem.textContent();
    if (text && text.trim().length > 5) {
      helpText.push(text.trim());
    }
  }

  const warningElements = await page.locator('[class*="warning"], [class*="error"], [class*="alert"]').all();
  for (const elem of warningElements) {
    const text = await elem.textContent();
    if (text && text.trim().length > 5) {
      warnings.push(text.trim());
    }
  }

  // Extract unique features (headings, sections)
  const features: string[] = [];
  const featureElements = await page.locator('h3, h4, h5, [class*="section"], [class*="card-title"]').all();
  for (const elem of featureElements.slice(0, 8)) {
    const text = await elem.textContent();
    if (text && text.trim().length > 3 && text.trim().length < 100) {
      features.push(text.trim());
    }
  }

  return {
    stepNumber: step.number,
    stepName: step.name,
    url,
    pageTitle,
    mainHeading,
    subHeading,
    instructions: [...new Set(instructions)].slice(0, 5), // Deduplicate and limit
    inputFields: inputFields.slice(0, 15), // Limit to prevent overflow
    buttons: [...new Set(buttons)].slice(0, 8),
    helpText: [...new Set(helpText)].slice(0, 5),
    warnings: [...new Set(warnings)].slice(0, 3),
    features: [...new Set(features)].slice(0, 8)
  };
}

async function extractAllWorkshopUI(baseUrl: string = 'http://localhost:3000'): Promise<UISnapshot> {
  console.log('🚀 Starting Workshop UI Extraction...\n');
  console.log(`📍 Base URL: ${baseUrl}\n`);

  let browser: Browser | null = null;

  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    });
    const page = await context.newPage();

    const steps: WorkshopStepUI[] = [];

    for (const step of WORKSHOP_STEPS) {
      try {
        const stepUI = await extractStepUI(page, step, baseUrl);
        steps.push(stepUI);
        console.log(`  ✅ Extracted ${stepUI.inputFields.length} inputs, ${stepUI.buttons.length} buttons\n`);
      } catch (error) {
        console.error(`  ❌ Failed to extract Step ${step.number}: ${error}`);
        // Add fallback with minimal info
        steps.push({
          stepNumber: step.number,
          stepName: step.name,
          url: `${baseUrl}${step.path}`,
          pageTitle: '',
          mainHeading: step.name,
          subHeading: '',
          instructions: [],
          inputFields: [],
          buttons: [],
          helpText: [],
          warnings: [],
          features: []
        });
      }
    }

    await browser.close();

    const snapshot: UISnapshot = {
      timestamp: new Date().toISOString(),
      frontendVersion: 'latest',
      baseUrl,
      steps
    };

    // Save to file
    const outputDir = path.join(__dirname, '..', 'outputs', 'ui-snapshots');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, 'workshop-ui-snapshot.json');
    fs.writeFileSync(outputPath, JSON.stringify(snapshot, null, 2));

    console.log('\n✅ UI Extraction Complete!');
    console.log(`📄 Saved to: ${outputPath}\n`);

    // Print summary
    console.log('📊 Summary:');
    steps.forEach(step => {
      console.log(`  Step ${step.stepNumber}: ${step.inputFields.length} inputs, ${step.buttons.length} buttons, ${step.instructions.length} instructions`);
    });

    return snapshot;

  } catch (error) {
    console.error('❌ UI Extraction failed:', error);
    if (browser) await browser.close();
    throw error;
  }
}

// CLI execution
if (require.main === module) {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  extractAllWorkshopUI(baseUrl)
    .then(() => {
      console.log('\n🎉 Done!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Error:', error.message);
      process.exit(1);
    });
}

export { extractAllWorkshopUI, WorkshopStepUI, UISnapshot };

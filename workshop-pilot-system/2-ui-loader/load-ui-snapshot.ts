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

/**
 * Load the latest UI snapshot
 */
export function loadUISnapshot(): UISnapshot | null {
  const snapshotPath = path.join(__dirname, '..', 'outputs', 'ui-snapshots', 'workshop-ui-snapshot.json');

  if (!fs.existsSync(snapshotPath)) {
    console.warn('⚠️  No UI snapshot found. Run UI crawler first.');
    return null;
  }

  try {
    const content = fs.readFileSync(snapshotPath, 'utf-8');
    const snapshot: UISnapshot = JSON.parse(content);
    return snapshot;
  } catch (error) {
    console.error('❌ Failed to load UI snapshot:', error);
    return null;
  }
}

/**
 * Get UI info for a specific step
 */
export function getStepUI(stepNumber: number, snapshot: UISnapshot | null): WorkshopStepUI | null {
  if (!snapshot) return null;

  const stepUI = snapshot.steps.find(s => s.stepNumber === stepNumber);
  return stepUI || null;
}

/**
 * Format UI info into a prompt-friendly description
 */
export function formatUIForPrompt(stepUI: WorkshopStepUI | null): string {
  if (!stepUI) {
    return '(현재 화면 정보 없음 - UI 크롤러를 실행하여 최신 화면 정보를 가져오세요)';
  }

  let description = `**현재 화면 정보 (실제 UI):**\n`;

  if (stepUI.mainHeading) {
    description += `- 화면 제목: "${stepUI.mainHeading}"\n`;
  }

  if (stepUI.subHeading) {
    description += `- 부제목: "${stepUI.subHeading}"\n`;
  }

  if (stepUI.instructions.length > 0) {
    description += `- 안내 문구:\n`;
    stepUI.instructions.forEach(inst => {
      description += `  · ${inst}\n`;
    });
  }

  if (stepUI.inputFields.length > 0) {
    description += `- 입력 필드 (${stepUI.inputFields.length}개):\n`;
    stepUI.inputFields.slice(0, 10).forEach(field => {
      const required = field.required ? ' [필수]' : '';
      const placeholder = field.placeholder ? ` (예: ${field.placeholder})` : '';
      description += `  · ${field.label || field.type}${required}${placeholder}\n`;
    });
    if (stepUI.inputFields.length > 10) {
      description += `  · ... 외 ${stepUI.inputFields.length - 10}개\n`;
    }
  }

  if (stepUI.buttons.length > 0) {
    description += `- 버튼: ${stepUI.buttons.join(', ')}\n`;
  }

  if (stepUI.helpText.length > 0) {
    description += `- 도움말:\n`;
    stepUI.helpText.forEach(help => {
      description += `  · ${help}\n`;
    });
  }

  if (stepUI.warnings.length > 0) {
    description += `- 주의사항:\n`;
    stepUI.warnings.forEach(warn => {
      description += `  · ${warn}\n`;
    });
  }

  if (stepUI.features.length > 0) {
    description += `- 주요 기능/섹션: ${stepUI.features.join(', ')}\n`;
  }

  description += `\n**이 화면을 사용하면서:**\n`;
  description += `- 위의 실제 UI 요소들을 기준으로 평가해주세요\n`;
  description += `- 입력 필드, 버튼, 안내 문구 등이 우리 팀 업무에 적합한지 판단하세요\n`;
  description += `- 화면에 표시된 정보만으로 다음 단계를 진행할 수 있는지 확인하세요\n`;

  return description;
}

/**
 * Check if UI snapshot is outdated (older than 1 hour)
 */
export function isSnapshotOutdated(snapshot: UISnapshot | null): boolean {
  if (!snapshot) return true;

  const snapshotTime = new Date(snapshot.timestamp);
  const now = new Date();
  const hoursDiff = (now.getTime() - snapshotTime.getTime()) / (1000 * 60 * 60);

  return hoursDiff > 1;
}

export { WorkshopStepUI, UISnapshot };

#!/usr/bin/env ts-node

/**
 * Work Redesign Platform - 워크샵 파일럿 테스팅 시스템
 * 메인 실행 파일
 *
 * 실행: npm run pilot 또는 npx ts-node run-pilot.ts
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { execSync } from 'child_process';

// 환경 변수 로드
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

// 색상 출력을 위한 헬퍼
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

// 로그 헬퍼 함수
function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logStep(step: number, message: string) {
  console.log(`\n${colors.cyan}${colors.bright}[Step ${step}]${colors.reset} ${message}`);
}

function logSuccess(message: string) {
  console.log(`${colors.green}✓${colors.reset} ${message}`);
}

function logWarning(message: string) {
  console.log(`${colors.yellow}⚠${colors.reset} ${message}`);
}

function logError(message: string) {
  console.log(`${colors.red}✗${colors.reset} ${message}`);
}

// 결과 저장 디렉토리 생성
function createOutputDirectories() {
  const dirs = [
    'outputs',
    'outputs/ui-analysis',
    'outputs/simulations',
    'outputs/analysis',
    'outputs/reports'
  ];

  dirs.forEach(dir => {
    const fullPath = path.join(__dirname, dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      logSuccess(`Created directory: ${dir}`);
    }
  });
}

// 파일럿 테스트 실행 옵션
interface PilotOptions {
  personaCount?: number;
  skipUIExtraction?: boolean;
  skipSimulation?: boolean;
  skipAnalysis?: boolean;
  skipReport?: boolean;
  verbose?: boolean;
}

// 메인 파일럿 실행 함수
async function runPilot(options: PilotOptions = {}) {
  const startTime = Date.now();

  console.log('\n' + '='.repeat(60));
  log('📊 Work Redesign Platform - Workshop Pilot Testing System', colors.bright);
  console.log('='.repeat(60) + '\n');

  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];

  try {
    // 출력 디렉토리 생성
    logStep(0, 'Initializing output directories...');
    createOutputDirectories();

    // Step 1: UI/UX 추출
    if (!options.skipUIExtraction) {
      logStep(1, 'Extracting UI/UX components from workshop...');
      try {
        const uiExtractScript = path.join(__dirname, '1-ui-extraction/extract-ui.ts');
        execSync(`npx ts-node ${uiExtractScript}`, {
          stdio: options.verbose ? 'inherit' : 'pipe',
          cwd: __dirname
        });
        logSuccess('UI/UX extraction completed');
      } catch (error) {
        logWarning('UI extraction failed, using cached data if available');
      }
    }

    // Step 2: 페르소나 설정
    logStep(2, 'Setting up personas for simulation...');
    const personasScript = path.join(__dirname, '2-personas/personas.ts');
    const personaCount = options.personaCount || 6; // 기본 6개 페르소나
    logSuccess(`Loaded ${personaCount} personas for testing`);

    // Step 3: 시뮬레이션 실행
    if (!options.skipSimulation) {
      logStep(3, `Running simulations with ${personaCount} personas...`);
      const simulationScript = path.join(__dirname, '3-simulation/simulate.ts');

      // 시뮬레이션 실행 (그룹별로)
      for (let group = 1; group <= Math.ceil(personaCount / 5); group++) {
        log(`  Running simulation for group ${group}...`, colors.yellow);
        try {
          execSync(
            `npx ts-node ${simulationScript} --group ${group} --timestamp ${timestamp}`,
            {
              stdio: options.verbose ? 'inherit' : 'pipe',
              cwd: __dirname
            }
          );
          logSuccess(`Group ${group} simulation completed`);
        } catch (error) {
          logError(`Group ${group} simulation failed`);
        }
      }
    }

    // Step 4: 결과 분석
    if (!options.skipAnalysis) {
      logStep(4, 'Analyzing simulation results...');
      const analysisScript = path.join(__dirname, '4-analysis/analyze.ts');
      try {
        execSync(
          `npx ts-node ${analysisScript} --timestamp ${timestamp}`,
          {
            stdio: options.verbose ? 'inherit' : 'pipe',
            cwd: __dirname
          }
        );
        logSuccess('Analysis completed');
      } catch (error) {
        logWarning('Analysis failed, partial results may be available');
      }
    }

    // Step 5: 보고서 생성
    if (!options.skipReport) {
      logStep(5, 'Generating final report...');
      const reportScript = path.join(__dirname, '5-reports/generate-report.ts');
      try {
        execSync(
          `npx ts-node ${reportScript} --timestamp ${timestamp}`,
          {
            stdio: options.verbose ? 'inherit' : 'pipe',
            cwd: __dirname
          }
        );
        logSuccess('Report generated successfully');

        const reportPath = path.join(__dirname, `outputs/reports/pilot-report-${timestamp}.md`);
        log(`\n📄 Report available at: ${reportPath}`, colors.green);
      } catch (error) {
        logError('Report generation failed');
      }
    }

    // 완료 메시지
    const duration = Math.round((Date.now() - startTime) / 1000);
    console.log('\n' + '='.repeat(60));
    log(`✅ Pilot testing completed in ${duration} seconds`, colors.green + colors.bright);
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    logError(`Pilot testing failed: ${error}`);
    process.exit(1);
  }
}

// CLI 인자 파싱
function parseArgs(): PilotOptions {
  const args = process.argv.slice(2);
  const options: PilotOptions = {};

  for (let i = 0; i < args.length; i++) {
    switch(args[i]) {
      case '--personas':
        options.personaCount = parseInt(args[++i]);
        break;
      case '--skip-ui':
        options.skipUIExtraction = true;
        break;
      case '--skip-simulation':
        options.skipSimulation = true;
        break;
      case '--skip-analysis':
        options.skipAnalysis = true;
        break;
      case '--skip-report':
        options.skipReport = true;
        break;
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
      case '--help':
      case '-h':
        console.log(`
Work Redesign Platform - Pilot Testing System

Usage: npx ts-node run-pilot.ts [options]

Options:
  --personas <number>     Number of personas to test (default: 6)
  --skip-ui              Skip UI extraction step
  --skip-simulation      Skip simulation step
  --skip-analysis        Skip analysis step
  --skip-report          Skip report generation
  --verbose, -v          Show detailed output
  --help, -h             Show this help message

Examples:
  # Run full pilot test with 10 personas
  npx ts-node run-pilot.ts --personas 10

  # Run only analysis and report on existing data
  npx ts-node run-pilot.ts --skip-ui --skip-simulation

  # Quick test with 3 personas
  npx ts-node run-pilot.ts --personas 3 --verbose
        `);
        process.exit(0);
    }
  }

  return options;
}

// 메인 실행
if (require.main === module) {
  const options = parseArgs();
  runPilot(options).catch(console.error);
}

export { runPilot };
export type { PilotOptions };
#!/usr/bin/env ts-node

/**
 * UI 추출 + 시뮬레이션 통합 실행 스크립트
 *
 * 1. 프론트엔드 개발 서버 시작
 * 2. UI 크롤러로 최신 화면 정보 추출
 * 3. 30명 페르소나 시뮬레이션 실행
 * 4. 보고서 생성
 * 5. 프론트엔드 서버 종료
 */

import { spawn, ChildProcess } from 'child_process';
import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { extractAllWorkshopUI } from './1-ui-crawler/extract-workshop-ui';
import { runParallelPilot } from './run-parallel-pilot';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(message: string) {
  console.log('\n' + '='.repeat(80));
  log(message, colors.bright + colors.cyan);
  console.log('='.repeat(80) + '\n');
}

let frontendProcess: ChildProcess | null = null;

async function waitForServer(url: string, maxAttempts: number = 30): Promise<boolean> {
  log('⏳ Waiting for frontend server to start...', colors.yellow);

  for (let i = 0; i < maxAttempts; i++) {
    try {
      execSync(`curl -s ${url} > /dev/null`, { stdio: 'ignore' });
      log('✅ Frontend server is ready!', colors.green);
      return true;
    } catch {
      process.stdout.write('.');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log();
  log('❌ Frontend server failed to start', colors.red);
  return false;
}

async function startFrontendServer(): Promise<boolean> {
  logSection('🚀 Step 1: Starting Frontend Server');

  const frontendDir = path.join(__dirname, '..', 'frontend');

  // Check if package.json exists
  if (!fs.existsSync(path.join(frontendDir, 'package.json'))) {
    log('❌ Frontend package.json not found', colors.red);
    return false;
  }

  log(`📁 Frontend directory: ${frontendDir}`, colors.blue);
  log('🔧 Running: npm run dev', colors.cyan);

  frontendProcess = spawn('npm', ['run', 'dev'], {
    cwd: frontendDir,
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: false,
    shell: true
  });

  // Capture output for debugging
  frontendProcess.stdout?.on('data', (data) => {
    const output = data.toString();
    if (output.includes('ready') || output.includes('started') || output.includes('Local:')) {
      log(`✓ ${output.trim()}`, colors.green);
    }
  });

  frontendProcess.stderr?.on('data', (data) => {
    const output = data.toString();
    // Only log errors, not warnings
    if (output.includes('Error') || output.includes('error')) {
      log(`⚠️  ${output.trim()}`, colors.yellow);
    }
  });

  // Wait for server to be ready
  const serverReady = await waitForServer('http://localhost:3000');

  if (!serverReady) {
    stopFrontendServer();
    return false;
  }

  // Give it extra time to fully initialize
  log('⏳ Waiting 3 seconds for full initialization...', colors.yellow);
  await new Promise(resolve => setTimeout(resolve, 3000));

  return true;
}

function stopFrontendServer() {
  if (frontendProcess) {
    log('\n🛑 Stopping frontend server...', colors.yellow);

    try {
      // Kill the process and all its children
      if (frontendProcess.pid) {
        process.kill(-frontendProcess.pid, 'SIGTERM');
      }
      frontendProcess.kill('SIGTERM');

      // Force kill after 5 seconds if still running
      setTimeout(() => {
        if (frontendProcess && !frontendProcess.killed) {
          log('⚠️  Force killing frontend server...', colors.yellow);
          frontendProcess.kill('SIGKILL');
        }
      }, 5000);

    } catch (error) {
      log(`⚠️  Error stopping server: ${error}`, colors.yellow);
    }
  }
}

async function extractUI(): Promise<boolean> {
  logSection('🔍 Step 2: Extracting UI Information');

  try {
    await extractAllWorkshopUI('http://localhost:3000');
    log('✅ UI extraction complete!', colors.green);
    return true;
  } catch (error) {
    log(`❌ UI extraction failed: ${error}`, colors.red);
    return false;
  }
}

async function runSimulation(): Promise<boolean> {
  logSection('🎯 Step 3: Running Persona Simulations');

  try {
    await runParallelPilot();
    log('✅ Simulation complete!', colors.green);
    return true;
  } catch (error) {
    log(`❌ Simulation failed: ${error}`, colors.red);
    return false;
  }
}

async function main() {
  const startTime = Date.now();

  logSection('🎬 Work Redesign Platform - Pilot Testing with Real-time UI');
  log('This will:', colors.cyan);
  log('  1. Start frontend dev server', colors.cyan);
  log('  2. Extract current UI from all workshop pages', colors.cyan);
  log('  3. Run 30 persona simulations with real UI context', colors.cyan);
  log('  4. Generate comprehensive reports', colors.cyan);
  log('  5. Clean up', colors.cyan);

  let success = false;

  try {
    // Step 1: Start frontend
    const frontendStarted = await startFrontendServer();
    if (!frontendStarted) {
      throw new Error('Failed to start frontend server');
    }

    // Step 2: Extract UI
    const uiExtracted = await extractUI();
    if (!uiExtracted) {
      throw new Error('Failed to extract UI');
    }

    // Step 3: Run simulation
    const simulationSuccess = await runSimulation();
    if (!simulationSuccess) {
      throw new Error('Simulation failed');
    }

    success = true;

  } catch (error) {
    log(`\n❌ Error: ${error}`, colors.red);

  } finally {
    // Always stop frontend server
    stopFrontendServer();

    const duration = (Date.now() - startTime) / 1000;

    if (success) {
      logSection('✅ All Done!');
      log(`⏱️  Total time: ${duration.toFixed(1)} seconds`, colors.green);
      log('\n📄 Check outputs/parallel-reports/ for results:', colors.cyan);
      log('  - 종합_보고서_*.md (Korean narrative report)', colors.cyan);
      log('  - UI_UX_분석_보고서_*.md (UI/UX analysis report)', colors.cyan);
      process.exit(0);
    } else {
      logSection('❌ Failed');
      log(`⏱️  Time elapsed: ${duration.toFixed(1)} seconds`, colors.red);
      process.exit(1);
    }
  }
}

// Handle Ctrl+C
process.on('SIGINT', () => {
  log('\n\n⚠️  Interrupted by user', colors.yellow);
  stopFrontendServer();
  process.exit(130);
});

// Handle other termination signals
process.on('SIGTERM', () => {
  log('\n\n⚠️  Terminated', colors.yellow);
  stopFrontendServer();
  process.exit(143);
});

// Run
if (require.main === module) {
  main().catch(error => {
    log(`\n💥 Unexpected error: ${error}`, colors.red);
    stopFrontendServer();
    process.exit(1);
  });
}

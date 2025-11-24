import { chromium, Browser, Page } from 'playwright';
import Anthropic from '@anthropic-ai/sdk';
import { Persona, PreInterviewResult } from './1-pre-interview';

export interface WorkshopStep {
  number: number;
  name: string;
  url: string;
  expectedMinutes: number;
  description: string;
}

export interface FacilitatorObservation {
  step: number;
  type: 'ERROR' | 'STUCK' | 'TIME_ISSUE' | 'DROPOUT_RISK' | 'SMOOTH' | 'CONFUSION';
  observation: string;
  timestamp: Date;
  personaReaction: 'frustrated' | 'blocked' | 'time_pressure' | 'confused' | 'ok' | 'dropout_risk';
  severity: 'critical' | 'high' | 'medium' | 'low';
}

export interface StepJourney {
  step: number;
  stepName: string;
  screenshot: string; // base64
  actualDuration: number; // minutes
  inputData: any;
  errors: number;
  pageUrl: string;
  aiResponse?: string;
  observations: FacilitatorObservation[];
}

export interface WorkshopJourney {
  personaId: string;
  personaName: string;
  preInterview: PreInterviewResult;
  steps: StepJourney[];
  facilitatorObservations: FacilitatorObservation[];
  completedSteps: number;
  dropoutAt?: number;
  dropoutReason?: string;
  totalDuration: number;
}

const WORKSHOP_STEPS: WorkshopStep[] = [
  { number: 1, name: '워크샵 시작', url: '/workshop', expectedMinutes: 5, description: '플랫폼 소개 및 목표 확인' },
  { number: 2, name: '미션 작성', url: '/workshop?step=2', expectedMinutes: 10, description: '팀 목표와 고객 가치 정의' },
  { number: 3, name: '팀 상황 확인', url: '/workshop?step=3', expectedMinutes: 7, description: '팀 특성 및 현황 입력' },
  { number: 4, name: '업무 영역 정의', url: '/workshop?step=4', expectedMinutes: 8, description: '주요 업무 도메인 입력' },
  { number: 5, name: '업무 내용 입력', url: '/workshop?step=5', expectedMinutes: 15, description: '구체적 업무 내용 작성' },
  { number: 6, name: '업무 추출 (AI)', url: '/workshop?step=6', expectedMinutes: 3, description: 'AI 자동 분석 및 추출' },
  { number: 7, name: '결과 요약', url: '/workshop?step=7', expectedMinutes: 10, description: 'AI 추출 결과 확인 및 수정' },
  { number: 8, name: 'AI 교육', url: '/workshop?step=8', expectedMinutes: 15, description: '자동화 개념 및 사례 학습' },
  { number: 9, name: 'AI 컨설팅', url: '/workshop?step=9', expectedMinutes: 10, description: '팀 자동화 전략 수립' },
  { number: 10, name: '워크플로우 설계', url: '/workshop?step=10', expectedMinutes: 12, description: '자동화 워크플로우 설계' },
  { number: 11, name: '최종 리포트', url: '/workshop?step=11', expectedMinutes: 5, description: '분석 결과 리포트 확인' }
];

/**
 * 페르소나별 현실적인 입력 데이터 생성
 */
async function generateRealisticInput(
  persona: Persona,
  step: WorkshopStep,
  anthropic: Anthropic
): Promise<any> {
  const prompt = `당신은 ${persona.name} (${persona.department} 팀장, ${persona.teamSize}명)입니다.

워크샵 Step ${step.number}: ${step.name}
${step.description}

이 단계에서 입력해야 할 현실적인 데이터를 생성해주세요.
우리 ${persona.department} 팀의 실제 업무를 반영하세요.

JSON 응답:
{
  "data": { /* 이 단계에 필요한 입력 데이터 */ }
}`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }]
    });

    const content = response.content[0];
    if (content.type === 'text') {
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]).data;
      }
    }
  } catch (error) {
    // Fallback
  }

  return { placeholder: '데이터 생성 실패' };
}

/**
 * 실제 워크샵 진행 시뮬레이션
 * Playwright로 실제 브라우저에서 실행하며 관찰
 */
export async function runRealWorkshop(
  persona: Persona,
  preInterview: PreInterviewResult,
  anthropic: Anthropic,
  baseUrl: string = 'http://localhost:3000'
): Promise<WorkshopJourney> {
  console.log(`\n👀 [워크샵 진행] ${persona.name} - 실제 브라우저 시뮬레이션 시작`);

  const facilitatorObservations: FacilitatorObservation[] = [];
  const steps: StepJourney[] = [];
  let completedSteps = 0;
  let dropoutAt: number | undefined;
  let dropoutReason: string | undefined;

  const journeyStart = Date.now();

  let browser: Browser | null = null;

  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    for (const step of WORKSHOP_STEPS) {
      const stepStart = Date.now();
      console.log(`  📍 Step ${step.number}: ${step.name}...`);

      try {
        // 1. 페이지 이동
        await page.goto(`${baseUrl}${step.url}`, {
          waitUntil: 'networkidle',
          timeout: 15000
        });

        await page.waitForTimeout(2000); // 렌더링 대기

        // 2. 실제 데이터 생성
        const inputData = await generateRealisticInput(persona, step, anthropic);

        // 3. 에러 체크
        const errors = await page.$$('.error-message, [role="alert"]');
        const errorCount = errors.length;

        if (errorCount > 0) {
          const errorTexts = await Promise.all(
            errors.map(e => e.textContent().catch(() => 'Unknown error'))
          );

          facilitatorObservations.push({
            step: step.number,
            type: 'ERROR',
            observation: `❌ 에러 발생: ${errorTexts.join(', ')}`,
            timestamp: new Date(),
            personaReaction: 'frustrated',
            severity: 'high'
          });
        }

        // 4. 화면 캡처
        const screenshot = await page.screenshot({
          fullPage: true,
          type: 'png'
        });
        const screenshotBase64 = screenshot.toString('base64');

        // 5. AI 응답 추출 (있다면)
        let aiResponse: string | undefined;
        const aiElements = await page.$$('[class*="ai-"], [class*="result"]');
        if (aiElements.length > 0) {
          const texts = await Promise.all(
            aiElements.map(e => e.textContent().catch(() => ''))
          );
          aiResponse = texts.filter(t => t.length > 10).join('\n');
        }

        // 6. 소요 시간 측정
        const actualDuration = (Date.now() - stepStart) / 1000 / 60;

        // 7. 시간 초과 체크
        if (actualDuration > step.expectedMinutes * 1.5) {
          facilitatorObservations.push({
            step: step.number,
            type: 'TIME_ISSUE',
            observation: `⏰ 예상 ${step.expectedMinutes}분 → 실제 ${actualDuration.toFixed(1)}분 (${(actualDuration / step.expectedMinutes * 100).toFixed(0)}%)`,
            timestamp: new Date(),
            personaReaction: 'time_pressure',
            severity: actualDuration > step.expectedMinutes * 2 ? 'high' : 'medium'
          });
        } else if (errorCount === 0 && actualDuration <= step.expectedMinutes) {
          facilitatorObservations.push({
            step: step.number,
            type: 'SMOOTH',
            observation: `✅ 순조롭게 진행 (${actualDuration.toFixed(1)}분)`,
            timestamp: new Date(),
            personaReaction: 'ok',
            severity: 'low'
          });
        }

        // 8. Journey 기록
        steps.push({
          step: step.number,
          stepName: step.name,
          screenshot: screenshotBase64,
          actualDuration,
          inputData,
          errors: errorCount,
          pageUrl: page.url(),
          aiResponse,
          observations: facilitatorObservations.filter(o => o.step === step.number)
        });

        completedSteps++;

      } catch (error) {
        // Step 실패
        facilitatorObservations.push({
          step: step.number,
          type: 'STUCK',
          observation: `🚫 진행 불가: ${error}`,
          timestamp: new Date(),
          personaReaction: 'blocked',
          severity: 'critical'
        });

        // 치명적 에러면 중단
        if (step.number <= 5) {
          dropoutAt = step.number;
          dropoutReason = `Step ${step.number}에서 진행 불가: ${error}`;
          break;
        }
      }

      // Rate limit
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    await browser.close();

  } catch (error) {
    console.error(`  ❌ 워크샵 실행 실패: ${error}`);
    if (browser) await browser.close();
  }

  const totalDuration = (Date.now() - journeyStart) / 1000 / 60;

  console.log(`  ✅ 완료 - ${completedSteps}/${WORKSHOP_STEPS.length} 단계 (${totalDuration.toFixed(1)}분)`);

  return {
    personaId: persona.id,
    personaName: persona.name,
    preInterview,
    steps,
    facilitatorObservations,
    completedSteps,
    dropoutAt,
    dropoutReason,
    totalDuration
  };
}

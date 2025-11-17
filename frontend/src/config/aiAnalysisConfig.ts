// AI 분석 설정 파일
// 이 파일을 수정하여 AI 분석 로직을 고도화할 수 있습니다.

export interface AnalysisConfig {
  // 분석 모델 설정
  model: {
    provider: 'claude' | 'openai' | 'custom';
    version: string;
    temperature: number;
    maxTokens: number;
  };

  // 분석 프롬프트 템플릿
  prompts: {
    documentAnalysis: string;
    taskExtraction: string;
    automationAssessment: string;
    prioritization: string;
  };

  // 분석 규칙
  rules: {
    minTaskTimeSpent: number; // 최소 소요 시간 (시간 단위)
    automationThresholds: {
      high: number;    // 높은 자동화 가능성 점수
      medium: number;  // 중간 자동화 가능성 점수
    };
    taskCategories: string[];
    frequencies: string[];
  };

  // 분석 단계별 가중치
  weights: {
    repetitiveness: number;
    timeSpent: number;
    complexity: number;
    dataProcessing: number;
  };
}

export const defaultAnalysisConfig: AnalysisConfig = {
  model: {
    provider: 'claude',
    version: 'claude-3-haiku',
    temperature: 0.3,
    maxTokens: 4000
  },

  prompts: {
    documentAnalysis: `
당신은 업무 프로세스 분석 전문가입니다. 다음 문서를 분석하여 반복적인 업무와 자동화 가능한 작업들을 찾아주세요.

문서 내용:
{document_content}

업무 영역: {domains}

다음 형식으로 분석해주세요:
1. 발견된 반복 업무들
2. 각 업무의 소요 시간 및 빈도
3. 자동화 가능성 평가
4. 권장 자동화 방법

JSON 형식으로 응답해주세요.
    `,

    taskExtraction: `
다음 텍스트에서 구체적인 업무 태스크들을 추출해주세요:

{analysis_result}

각 태스크에 대해 다음 정보를 포함해주세요:
- title: 업무 제목
- description: 상세 설명
- timeSpent: 소요 시간 (시간 단위)
- frequency: 빈도 (daily, weekly, monthly)
- category: 업무 카테고리
- automationLevel: 자동화 가능성 (high, medium, low)
- automationMethod: 권장 자동화 방법

JSON 배열로 응답해주세요.
    `,

    automationAssessment: `
다음 업무의 자동화 가능성을 평가해주세요:

업무: {task_title}
설명: {task_description}
소요시간: {time_spent}시간
빈도: {frequency}

평가 기준:
1. 반복성 (0-10점)
2. 규칙성 (0-10점)
3. 데이터 처리 여부 (0-10점)
4. 복잡도 (0-10점, 낮을수록 높은 점수)

총점과 함께 구체적인 자동화 방법을 제안해주세요.
    `,

    prioritization: `
다음 업무 목록의 우선순위를 정해주세요:

{task_list}

우선순위 기준:
1. 시간 절약 효과
2. 자동화 구현 난이도
3. 업무 중요도
4. ROI (투자 대비 효과)

우선순위 순서로 정렬하여 JSON으로 응답해주세요.
    `
  },

  rules: {
    minTaskTimeSpent: 0.5, // 30분 이상 소요되는 업무만 분석
    automationThresholds: {
      high: 7.5,   // 7.5점 이상: 높은 자동화 가능성
      medium: 5.0  // 5.0-7.5점: 중간 자동화 가능성
    },
    taskCategories: [
      '데이터 분석',
      '보고서 작성',
      '문서 관리',
      '커뮤니케이션',
      '일정 관리',
      '품질 관리',
      '고객 응대',
      '운영 관리'
    ],
    frequencies: ['daily', 'weekly', 'monthly']
  },

  weights: {
    repetitiveness: 0.3,   // 반복성 가중치
    timeSpent: 0.25,       // 소요 시간 가중치
    complexity: 0.25,      // 복잡도 가중치 (낮을수록 좋음)
    dataProcessing: 0.2    // 데이터 처리 가중치
  }
};

// AI 분석 결과 타입 정의
export interface AnalysisResult {
  taskId: string;
  confidence: number;
  automationScore: number;
  estimatedTimeSaved: string;
  implementationDifficulty: 'easy' | 'medium' | 'hard';
  recommendedTools: string[];
  expectedROI: number;
}

// 커스텀 분석 함수 인터페이스
export type CustomAnalysisFunction = (
  document: string,
  domains: string[],
  config: AnalysisConfig
) => Promise<AnalysisResult[]>;

// 분석 설정 업데이트 함수
export function updateAnalysisConfig(updates: Partial<AnalysisConfig>): AnalysisConfig {
  return {
    ...defaultAnalysisConfig,
    ...updates,
    model: { ...defaultAnalysisConfig.model, ...updates.model },
    prompts: { ...defaultAnalysisConfig.prompts, ...updates.prompts },
    rules: { ...defaultAnalysisConfig.rules, ...updates.rules },
    weights: { ...defaultAnalysisConfig.weights, ...updates.weights }
  };
}
// AI 분석 서비스 모듈
// 이 파일을 수정하여 AI 분석 로직을 고도화할 수 있습니다.

import { defaultAnalysisConfig, type AnalysisConfig, type AnalysisResult } from '../config/aiAnalysisConfig';

export interface AnalysisInput {
  documents: { content: string; filename: string; }[];
  domains: string[];
  workshopId: string;
}

export interface TaskResult {
  id: string;
  title: string;
  description: string;
  timeSpent: number;
  frequency: string;
  automation: 'high' | 'medium' | 'low';
  automationMethod: string;
  category: string;
  sourceFileId: string;
  sourceFilename: string;
  confidence: number;
  estimatedTimeSaved: string;
}

class AIAnalysisService {
  private config: AnalysisConfig;

  constructor(config: AnalysisConfig = defaultAnalysisConfig) {
    this.config = config;
  }

  // 설정 업데이트
  updateConfig(newConfig: Partial<AnalysisConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  // 메인 분석 함수
  async analyzeDocuments(input: AnalysisInput): Promise<TaskResult[]> {
    try {
      console.log('🚀 AI 분석 시작...');

      // 문서들을 하나의 텍스트로 합치기
      const combinedDocuments = input.documents
        .map(doc => `[${doc.filename}]\n${doc.content}`)
        .join('\n\n---\n\n');

      // 백엔드 AI 분석 API 호출
      const analysisResponse = await fetch('http://localhost:4000/api/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domains: input.domains,
          documents: combinedDocuments,
          userContext: `워크샵 ID: ${input.workshopId}`
        }),
      });

      if (!analysisResponse.ok) {
        throw new Error('AI 분석 API 호출 실패');
      }

      const { data: analysisInfo } = await analysisResponse.json();
      const analysisId = analysisInfo.analysisId;

      console.log(`📊 분석 ID: ${analysisId} - 분석 진행 중...`);

      // 분석 완료까지 폴링
      const tasks = await this.pollAnalysisResult(analysisId);

      console.log(`🎉 전체 분석 완료: ${tasks.length}개 업무 발견`);
      return tasks;

    } catch (error) {
      console.error('AI 분석 중 오류 발생:', error);
      throw new Error('AI 분석에 실패했습니다.');
    }
  }

  // 분석 결과 폴링
  private async pollAnalysisResult(analysisId: string): Promise<TaskResult[]> {
    const maxAttempts = 60; // 최대 60초 대기
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const response = await fetch(`http://localhost:4000/api/ai/analysis/${analysisId}`);

        if (!response.ok) {
          throw new Error('분석 상태 조회 실패');
        }

        const { data: analysis } = await response.json();

        if (analysis.status === 'completed') {
          // 백엔드 응답을 프론트엔드 형식으로 변환
          return this.convertBackendTasksToFrontend(analysis.tasks || [], analysis.priorities || []);
        } else if (analysis.status === 'failed') {
          throw new Error(analysis.error || '분석 실패');
        }

        // 1초 대기 후 재시도
        await this.delay(1000);
        attempts++;
      } catch (error) {
        console.error('분석 상태 조회 오류:', error);
        throw error;
      }
    }

    throw new Error('분석 시간 초과');
  }

  // 백엔드 태스크를 프론트엔드 형식으로 변환
  private convertBackendTasksToFrontend(backendTasks: any[], priorities: any[]): TaskResult[] {
    return backendTasks.map((task, index) => {
      const priority = priorities[index] || {};

      return {
        id: task.id || `task-${Date.now()}-${index}`,
        title: task.title || task.name || '업무',
        description: task.description || task.details || '',
        timeSpent: task.weeklyHours || task.timeSpent || 1,
        frequency: this.mapFrequency(task.frequency || task.frequency),
        automation: this.mapAutomationLevel(task.automationPotential || priority.automationPotential || 'medium'),
        automationMethod: task.automationMethod || priority.recommendedTools?.[0] || 'AI 어시스턴트 활용',
        category: task.category || task.domain || '일반 업무',
        sourceFileId: `file-${Date.now()}`,
        sourceFilename: '분석 문서',
        confidence: task.confidence || priority.confidence || 0.8,
        estimatedTimeSaved: this.calculateTimeSaved(
          task.weeklyHours || task.timeSpent || 1,
          this.mapFrequency(task.frequency || 'weekly'),
          this.mapAutomationLevel(task.automationPotential || priority.automationPotential || 'medium')
        )
      };
    });
  }

  // 빈도 매핑
  private mapFrequency(frequency: string): string {
    const frequencyMap: Record<string, string> = {
      'daily': 'daily',
      'weekly': 'weekly',
      'monthly': 'monthly',
      'once_per_week': 'weekly',
      'multiple_times_per_week': 'daily',
      'once_per_month': 'monthly'
    };
    return frequencyMap[frequency] || 'weekly';
  }

  // 자동화 레벨 매핑
  private mapAutomationLevel(level: string | number): 'high' | 'medium' | 'low' {
    if (typeof level === 'number') {
      if (level >= 8) return 'high';
      if (level >= 5) return 'medium';
      return 'low';
    }

    const levelMap: Record<string, 'high' | 'medium' | 'low'> = {
      'high': 'high',
      'medium': 'medium',
      'low': 'low',
      'excellent': 'high',
      'good': 'medium',
      'fair': 'low',
      'poor': 'low'
    };
    return levelMap[level] || 'medium';
  }




  // 시간 절약 효과 계산
  private calculateTimeSaved(timeSpent: number, frequency: string, automation: string): string {
    let multiplier = 1;
    let unit = '';

    switch (frequency) {
      case 'daily':
        multiplier = 5; // 주 5일
        unit = '주';
        break;
      case 'weekly':
        multiplier = 1;
        unit = '주';
        break;
      case 'monthly':
        multiplier = 0.25;
        unit = '주';
        break;
    }

    let efficiency = 0;
    switch (automation) {
      case 'high':
        efficiency = 0.8; // 80% 절약
        break;
      case 'medium':
        efficiency = 0.5; // 50% 절약
        break;
      case 'low':
        efficiency = 0.2; // 20% 절약
        break;
    }

    const savedHours = timeSpent * multiplier * efficiency;
    return `${savedHours.toFixed(1)}시간/${unit}`;
  }

  // 유틸리티: 지연 함수
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 싱글톤 인스턴스 생성
export const aiAnalysisService = new AIAnalysisService();

// 설정 업데이트 함수 내보내기
export const updateAIAnalysisConfig = (config: Partial<AnalysisConfig>) => {
  aiAnalysisService.updateConfig(config);
};
import * as archiver from 'archiver';
import { promises as fs } from 'fs';
import * as path from 'path';
import { Task, GeneratedTemplate, TemplateType } from '../types/workshop';
import { AIAnalysisService } from './aiAnalysisService';
import { createModuleLogger } from '../utils/logger';

const logger = createModuleLogger('TemplateGenerator');

export class TemplateGenerator {
  private aiService: AIAnalysisService;

  constructor() {
    this.aiService = new AIAnalysisService();
  }

  async generateAllTemplates(tasks: Task[]): Promise<GeneratedTemplate[]> {
    logger.info(`🔧 Starting template generation for ${tasks.length} tasks`);

    const templates: GeneratedTemplate[] = [];
    const templateTypes: TemplateType[] = ['ai_prompt', 'n8n_workflow', 'python_script', 'javascript_code'];

    for (const templateType of templateTypes) {
      try {
        const typeTemplates = await this.aiService.generateAutomationTemplates(tasks, templateType);

        for (const templateContent of typeTemplates) {
          templates.push({
            id: this.generateId(),
            type: templateType,
            name: templateContent.name,
            content: templateContent.content,
            taskId: templateContent.taskId
          });
        }

        logger.info(`✅ Generated ${typeTemplates.length} ${templateType} templates`);

      } catch (error) {
        logger.error(`❌ Template generation failed for ${templateType}:`, error);
      }
    }

    logger.info(`🎉 Template generation completed: ${templates.length} templates`);
    return templates;
  }

  async createToolkitZip(
    workshopId: string,
    tasks: Task[],
    templates: GeneratedTemplate[]
  ): Promise<string> {
    const outputDir = path.join(process.cwd(), 'generated_templates');
    await fs.mkdir(outputDir, { recursive: true });

    const zipFilename = `toolkit_${workshopId}_${Date.now()}.zip`;
    const zipPath = path.join(outputDir, zipFilename);

    const output = require('fs').createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    return new Promise((resolve, reject) => {
      output.on('close', () => {
        logger.info(`📦 ZIP file created: ${zipFilename} (${archive.pointer()} bytes)`);
        resolve(zipFilename);
      });

      archive.on('error', (err) => {
        logger.error('Archive error:', err);
        reject(err);
      });

      archive.pipe(output);

      // 템플릿 파일들 추가
      templates.forEach(template => {
        const ext = this.getFileExtension(template.type);
        const filename = `${this.sanitizeFilename(template.name)}${ext}`;
        archive.append(template.content, { name: filename });
      });

      // README 파일 추가
      const readme = this.generateReadme(tasks, templates);
      archive.append(readme, { name: 'README.md' });

      // 사용 가이드 추가
      const guide = this.generateUsageGuide();
      archive.append(guide, { name: '사용가이드.md' });

      archive.finalize();
    });
  }

  private generateId(): string {
    return `TPL_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
  }

  private getFileExtension(type: TemplateType): string {
    const extensionMap: Record<TemplateType, string> = {
      ai_prompt: '.txt',
      n8n_workflow: '.json',
      python_script: '.py',
      javascript_code: '.js'
    };
    return extensionMap[type] || '.txt';
  }

  private sanitizeFilename(name: string): string {
    return name
      .replace(/[^a-zA-Z0-9가-힣\s\-_]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 100); // 파일명 길이 제한
  }

  private generateReadme(tasks: Task[], templates: GeneratedTemplate[]): string {
    const tasksByAutomation = tasks.reduce((acc, task) => {
      if (!acc[task.automation]) acc[task.automation] = [];
      acc[task.automation].push(task);
      return acc;
    }, {} as Record<string, Task[]>);

    return `# Work Redesign Toolkit

> SK Work Redesign 워크샵에서 생성된 자동화 도구 모음

**생성일**: ${new Date().toLocaleString('ko-KR')}
**총 업무**: ${tasks.length}개
**생성된 도구**: ${templates.length}개

## 📊 업무 분석 결과

| 자동화 수준 | 업무 수 | 비율 |
|-----------|--------|------|
| 🟢 자동화 가능 | ${tasksByAutomation.high?.length || 0}개 | ${Math.round(((tasksByAutomation.high?.length || 0) / tasks.length) * 100)}% |
| 🟡 부분 자동화 | ${tasksByAutomation.medium?.length || 0}개 | ${Math.round(((tasksByAutomation.medium?.length || 0) / tasks.length) * 100)}% |
| 🔴 자동화 어려움 | ${tasksByAutomation.low?.length || 0}개 | ${Math.round(((tasksByAutomation.low?.length || 0) / tasks.length) * 100)}% |

## 🔧 포함된 도구

${tasks.map((task, i) => `
### ${i + 1}. ${task.title}

- **소요 시간**: ${task.timeSpent}시간/${this.translateFrequency(task.frequency)}
- **자동화 가능성**: ${this.translateAutomation(task.automation)}
- **카테고리**: ${task.category}
- **자동화 방법**: ${task.automationMethod}

**생성된 파일**:
${templates.filter(t => t.taskId === task.id).map(t => `- ${t.name}${this.getFileExtension(t.type)}`).join('\n')}
`).join('\n')}

## 🚀 빠른 시작

1. **AI 프롬프트 파일**: Claude AI나 ChatGPT에 복사하여 바로 사용
2. **n8n 워크플로우**: n8n 플랫폼에서 Import → JSON 업로드
3. **Python 스크립트**:
   \`\`\`bash
   python script_name.py
   \`\`\`

## 📞 지원

- 문의: SK Academy Work Redesign Team
- 이메일: work-redesign@sk.com
- 내부 커뮤니티: SK Work Innovation Hub

---
🤖 **Generated by SK Work Redesign Platform**
`;
  }

  private generateUsageGuide(): string {
    return `# 자동화 도구 사용 가이드

## 🎯 목적
이 가이드는 생성된 자동화 도구들을 실제 업무에 적용하는 방법을 안내합니다.

## 📝 AI 프롬프트 사용법

### 1. Claude AI 사용
1. [Claude.ai](https://claude.ai) 접속
2. 프롬프트 파일(.txt) 내용을 복사
3. 대화창에 붙여넣기
4. 실제 데이터를 입력하여 테스트

### 2. ChatGPT 사용
1. [ChatGPT](https://chatgpt.com) 접속
2. 프롬프트 파일 내용을 복사
3. 대화창에 붙여넷기
4. 필요에 따라 프롬프트 수정

## 🔄 n8n 워크플로우 사용법

### 설치 및 설정
1. n8n 설치: \`npm install n8n -g\`
2. 실행: \`n8n start\`
3. 브라우저에서 localhost:5678 접속

### 워크플로우 import
1. n8n 대시보드에서 "Import" 클릭
2. JSON 파일(.json) 선택하여 업로드
3. 노드 설정 검토 및 수정
4. Test 버튼으로 동작 확인
5. Activate로 자동화 시작

### 주의사항
- API 키 및 인증 정보는 별도 설정 필요
- 스케줄러 노드의 시간대 확인
- 에러 핸들링 노드 동작 확인

## 🐍 Python 스크립트 사용법

### 환경 설정
\`\`\`bash
# 가상환경 생성
python -m venv venv

# 가상환경 활성화 (Windows)
venv\\Scripts\\activate

# 가상환경 활성화 (Mac/Linux)
source venv/bin/activate

# 필요한 라이브러리 설치
pip install -r requirements.txt
\`\`\`

### 스크립트 실행
\`\`\`bash
# 기본 실행
python script_name.py

# 매개변수와 함께 실행
python script_name.py --input data.xlsx --output result.xlsx
\`\`\`

### 스케줄링 설정

#### Windows (작업 스케줄러)
1. 작업 스케줄러 열기
2. "기본 작업 만들기" 클릭
3. 트리거 설정 (매일, 매주 등)
4. Python 스크립트 경로 설정

#### Mac/Linux (cron)
\`\`\`bash
# crontab 편집
crontab -e

# 매일 오전 9시 실행 예시
0 9 * * * /path/to/python /path/to/script.py
\`\`\`

## 🔍 트러블슈팅

### 일반적인 문제
1. **권한 오류**: 파일 접근 권한 확인
2. **API 오류**: API 키 및 엔드포인트 확인
3. **의존성 오류**: 라이브러리 버전 확인

### 로그 확인
- n8n: 실행 로그에서 오류 메시지 확인
- Python: 콘솔 출력 및 로그 파일 확인

## 📈 성과 측정

### 자동화 효과 측정
1. **시간 절약**: 기존 소요시간 vs 자동화 후 시간
2. **오류 감소**: 수동 작업 오류 vs 자동화 오류
3. **처리량 증가**: 단위 시간당 처리 건수

### 추천 지표
- 주간 시간 절약량 (시간)
- 월간 반복 업무 자동화율 (%)
- 팀 생산성 향상도 (%)

## 💡 추가 개선 아이디어

1. **단계별 확장**: 간단한 업무부터 시작하여 점진적 확장
2. **팀 공유**: 성공 사례를 팀 내에서 공유
3. **지속적 개선**: 사용자 피드백을 바탕으로 도구 개선
4. **새로운 업무 적용**: 유사한 패턴의 다른 업무에 응용

---
궁금한 사항이 있으시면 SK Work Redesign Team으로 연락해주세요!
`;
  }

  private translateFrequency(freq: string): string {
    const map: Record<string, string> = {
      daily: '일일',
      weekly: '주간',
      monthly: '월간'
    };
    return map[freq] || freq;
  }

  private translateAutomation(level: string): string {
    const map: Record<string, string> = {
      high: '🟢 자동화 가능',
      medium: '🟡 부분 자동화',
      low: '🔴 자동화 어려움'
    };
    return map[level] || level;
  }
}
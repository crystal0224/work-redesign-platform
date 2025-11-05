const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

class TemplateGenerator {
  constructor() {
    this.templatesDir = path.join(__dirname, 'generated_templates');
    this.ensureTemplatesDirectory();
  }

  ensureTemplatesDirectory() {
    if (!fs.existsSync(this.templatesDir)) {
      fs.mkdirSync(this.templatesDir, { recursive: true });
    }
  }

  // 프롬프트 템플릿 생성
  generatePromptTemplate(task, agentType, scenario = null) {
    const template = {
      metadata: {
        title: `${task.title} - ${agentType} 에이전트 프롬프트`,
        description: task.description,
        agentType: agentType,
        priority: task.priority,
        estimatedHours: task.estimatedHours,
        generatedAt: new Date().toISOString(),
        version: '1.0'
      },
      promptTemplate: this.buildPromptContent(task, agentType, scenario),
      variables: this.extractVariables(task),
      exampleUsage: this.generateExampleUsage(task, agentType),
      setupInstructions: this.generateSetupInstructions(agentType)
    };

    return template;
  }

  buildPromptContent(task, agentType, scenario) {
    const basePrompt = this.getBasePromptForAgent(agentType);

    return `# ${task.title} - ${agentType} 에이전트 프롬프트

## 에이전트 역할
${basePrompt.role}

## 작업 컨텍스트
**작업명**: ${task.title}
**설명**: ${task.description}
**우선순위**: ${task.priority}
**예상 시간**: ${task.estimatedHours}시간
**필요 기술**: ${task.skills ? task.skills.join(', ') : '명시되지 않음'}

## 구체적인 지시사항
${basePrompt.instructions}

### 작업별 세부사항
1. **목표 설정**
   - ${task.title}의 명확한 목표 정의
   - 성공 지표 및 완료 기준 설정

2. **실행 단계**
${this.generateExecutionSteps(task, agentType)}

3. **품질 관리**
   - 각 단계별 검증 포인트 확인
   - 오류 발생시 대응 방안 수립
   - 지속적인 개선 사항 식별

## 출력 형식
${basePrompt.outputFormat}

## 변수 설정
${this.formatVariables(task)}

## 예시 상황
\`\`\`
상황: ${task.description}
입력: [사용자 입력 데이터]
기대 출력: [구체적인 결과물 예시]
\`\`\`

## 주의사항
- 업무의 복잡성을 고려하여 단계별 접근
- 사용자의 기술 수준에 맞는 설명 제공
- 실무에 즉시 적용 가능한 구체적인 결과 도출
- 오류 발생시 명확한 피드백 제공

---
*이 프롬프트는 SK Work Redesign Platform에서 자동 생성되었습니다.*
*생성일: ${new Date().toLocaleString('ko-KR')}*`;
  }

  getBasePromptForAgent(agentType) {
    const prompts = {
      'ANALYSIS': {
        role: '당신은 업무 분석 전문가입니다. 현재 프로세스를 체계적으로 분석하고 개선점을 도출하는 것이 주요 역할입니다.',
        instructions: `
1. 현재 업무 프로세스를 상세히 분석하세요
2. 비효율적인 구간과 병목 지점을 식별하세요
3. 자동화 가능한 영역을 찾아내세요
4. 구체적인 개선 방안을 제시하세요
5. 예상 효과와 리스크를 평가하세요`,
        outputFormat: `
**분석 결과**:
- 현재 상태 진단
- 문제점 및 개선 기회
- 권장 사항
- 구현 우선순위
- 예상 효과`
      },
      'TASK': {
        role: '당신은 작업 실행 전문가입니다. 분석된 내용을 바탕으로 실제 구현 가능한 솔루션을 개발하고 실행하는 것이 주요 역할입니다.',
        instructions: `
1. 요구사항을 명확히 이해하고 정의하세요
2. 기술적 구현 방안을 설계하세요
3. 단계별 실행 계획을 수립하세요
4. 필요한 도구와 리소스를 식별하세요
5. 테스트 및 검증 방법을 정의하세요`,
        outputFormat: `
**실행 계획**:
- 요구사항 정의
- 기술 아키텍처
- 구현 단계
- 필요 리소스
- 테스트 방법
- 완료 기준`
      },
      'COORDINATION': {
        role: '당신은 프로젝트 코디네이션 전문가입니다. 여러 작업과 팀원들을 조율하여 효율적인 협업을 이끌어내는 것이 주요 역할입니다.',
        instructions: `
1. 프로젝트 전체 일정을 관리하세요
2. 팀원간 역할과 책임을 명확히 하세요
3. 의사소통 채널과 방식을 정의하세요
4. 진행 상황을 모니터링하고 보고하세요
5. 리스크를 사전에 식별하고 대응하세요`,
        outputFormat: `
**코디네이션 계획**:
- 프로젝트 일정
- 역할 및 책임
- 커뮤니케이션 계획
- 진행 관리 방법
- 리스크 관리 방안`
      },
      'OPTIMIZATION': {
        role: '당신은 프로세스 최적화 전문가입니다. 기존 시스템과 프로세스를 지속적으로 개선하여 최대 효율을 달성하는 것이 주요 역할입니다.',
        instructions: `
1. 현재 성능 지표를 측정하고 분석하세요
2. 최적화 가능한 영역을 식별하세요
3. 개선 방안을 설계하고 테스트하세요
4. 변경사항의 영향을 평가하세요
5. 지속적인 모니터링 체계를 구축하세요`,
        outputFormat: `
**최적화 방안**:
- 현재 성능 분석
- 최적화 기회
- 개선 실행 계획
- 성과 측정 방법
- 지속 개선 체계`
      }
    };

    return prompts[agentType] || prompts['ANALYSIS'];
  }

  generateExecutionSteps(task, agentType) {
    const steps = {
      'ANALYSIS': [
        '현재 상태 데이터 수집 및 정리',
        '프로세스 맵핑 및 흐름 분석',
        '문제점 및 비효율 구간 식별',
        '개선 기회 및 솔루션 도출',
        '효과 분석 및 우선순위 설정'
      ],
      'TASK': [
        '요구사항 상세 분석 및 명세',
        '기술적 설계 및 아키텍처 정의',
        '구현 계획 수립 및 일정 설정',
        '단계별 개발 및 테스트 실행',
        '배포 및 운영 가이드 작성'
      ],
      'COORDINATION': [
        '프로젝트 범위 및 목표 정의',
        '팀 구성 및 역할 배정',
        '일정 계획 및 마일스톤 설정',
        '진행 상황 모니터링 및 조정',
        '최종 결과 검토 및 피드백'
      ],
      'OPTIMIZATION': [
        '현재 성능 기준선 측정',
        '최적화 목표 및 지표 설정',
        '개선 방안 설계 및 프로토타입',
        'A/B 테스트 및 성능 검증',
        '최적화 결과 적용 및 모니터링'
      ]
    };

    const agentSteps = steps[agentType] || steps['ANALYSIS'];
    return agentSteps.map((step, index) => `   ${index + 1}. ${step}`).join('\n');
  }

  extractVariables(task) {
    return {
      '{TASK_TITLE}': task.title,
      '{TASK_DESCRIPTION}': task.description,
      '{PRIORITY}': task.priority,
      '{ESTIMATED_HOURS}': task.estimatedHours,
      '{SKILLS}': task.skills ? task.skills.join(', ') : '',
      '{CURRENT_DATE}': new Date().toLocaleDateString('ko-KR'),
      '{USER_INPUT}': '[사용자 입력]',
      '{CONTEXT}': '[작업 컨텍스트]'
    };
  }

  formatVariables(task) {
    const variables = this.extractVariables(task);
    return Object.entries(variables)
      .map(([key, value]) => `- ${key}: ${value}`)
      .join('\n');
  }

  generateExampleUsage(task, agentType) {
    return `
## 사용 예시

### 1. 기본 사용법
\`\`\`
[프롬프트 내용을 Claude나 ChatGPT에 입력]

사용자 입력: "${task.description}"
컨텍스트: "SK 그룹 ${agentType} 에이전트 작업"
\`\`\`

### 2. 변수 치환 예시
\`\`\`
{TASK_TITLE} → ${task.title}
{PRIORITY} → ${task.priority}
{USER_INPUT} → [실제 업무 데이터]
\`\`\`

### 3. 기대 결과물
- 구체적이고 실행 가능한 ${agentType} 결과
- 단계별 가이드라인
- 품질 검증 체크리스트`;
  }

  generateSetupInstructions(agentType) {
    return `
## 설정 가이드

### 1. AI 도구 설정
- **Claude**: 이 프롬프트를 그대로 복사하여 사용
- **ChatGPT**: 프롬프트 앞에 "역할 설정:" 추가
- **기타 AI**: 각 도구의 프롬프트 형식에 맞게 조정

### 2. 변수 설정
- 프롬프트 내 {변수명} 부분을 실제 값으로 치환
- 상황에 맞게 컨텍스트 정보 추가

### 3. 품질 향상 팁
- 구체적인 예시와 함께 요청
- 단계별 피드백 요청
- 결과물에 대한 검증 기준 명시`;
  }

  // n8n 워크플로우 템플릿 생성
  generateN8nWorkflow(task, scenario) {
    const workflow = {
      name: `${task.title} 자동화 워크플로우`,
      nodes: this.buildN8nNodes(task, scenario),
      connections: this.buildN8nConnections(),
      settings: {
        executionOrder: 'v1'
      },
      staticData: null,
      tags: ['SK-WorkRedesign', task.agentType, 'automation'],
      triggerCount: 0,
      updatedAt: new Date().toISOString(),
      versionId: 1
    };

    return workflow;
  }

  buildN8nNodes(task, scenario) {
    const nodes = [
      {
        parameters: {
          rule: {
            interval: [{ field: 'cronExpression', value: '0 9 * * 1-5' }]
          }
        },
        id: 'trigger-node',
        name: 'Schedule Trigger',
        type: 'n8n-nodes-base.scheduleTrigger',
        typeVersion: 1,
        position: [240, 300]
      },
      {
        parameters: {
          url: 'https://api.sk-work-redesign.com/data',
          options: {
            headers: {
              'Authorization': 'Bearer {{$json["auth_token"]}}',
              'Content-Type': 'application/json'
            }
          }
        },
        id: 'data-fetch',
        name: 'Fetch Data',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 1,
        position: [460, 300]
      },
      {
        parameters: {
          code: this.generateProcessingCode(task)
        },
        id: 'process-data',
        name: 'Process Data',
        type: 'n8n-nodes-base.code',
        typeVersion: 1,
        position: [680, 300]
      },
      {
        parameters: {
          subject: `${task.title} - 처리 완료 알림`,
          message: `작업이 성공적으로 완료되었습니다.\n\n처리 시간: {{$json["processing_time"]}}\n결과: {{$json["result_summary"]}}`,
          options: {
            attachments: 'data:application/json;base64,{{$json["result_data"]}}'
          }
        },
        id: 'send-notification',
        name: 'Send Notification',
        type: 'n8n-nodes-base.emailSend',
        typeVersion: 1,
        position: [900, 300]
      }
    ];

    return nodes;
  }

  buildN8nConnections() {
    return {
      'Schedule Trigger': {
        main: [
          [
            {
              node: 'Fetch Data',
              type: 'main',
              index: 0
            }
          ]
        ]
      },
      'Fetch Data': {
        main: [
          [
            {
              node: 'Process Data',
              type: 'main',
              index: 0
            }
          ]
        ]
      },
      'Process Data': {
        main: [
          [
            {
              node: 'Send Notification',
              type: 'main',
              index: 0
            }
          ]
        ]
      }
    };
  }

  generateProcessingCode(task) {
    return `
// ${task.title} 데이터 처리 코드
// 생성일: ${new Date().toISOString()}

const inputData = $input.all();
const results = [];

for (const item of inputData) {
  try {
    // 데이터 전처리
    const processedData = {
      id: item.json.id,
      timestamp: new Date().toISOString(),
      original: item.json,
      processed: {
        // 작업별 처리 로직 구현
        status: 'processed',
        priority: '${task.priority}',
        category: '${task.agentType}'
      }
    };

    // 비즈니스 로직 적용
    if (item.json.value) {
      processedData.processed.normalizedValue = parseFloat(item.json.value);
      processedData.processed.classification =
        processedData.processed.normalizedValue > 100 ? 'high' : 'normal';
    }

    // 결과 데이터 구성
    results.push({
      json: processedData,
      binary: {}
    });

  } catch (error) {
    // 에러 처리
    results.push({
      json: {
        error: error.message,
        originalData: item.json,
        timestamp: new Date().toISOString()
      },
      binary: {}
    });
  }
}

return results;`;
  }

  // 코드 스니펫 생성
  generateCodeSnippets(task, language = 'python') {
    const snippets = {
      python: this.generatePythonSnippet(task),
      javascript: this.generateJavaScriptSnippet(task),
      sql: this.generateSQLSnippet(task)
    };

    return snippets[language] || snippets.python;
  }

  generatePythonSnippet(task) {
    return `"""
${task.title} - Python 자동화 스크립트
생성일: ${new Date().toISOString()}
우선순위: ${task.priority}
예상 시간: ${task.estimatedHours}시간
"""

import pandas as pd
import logging
from datetime import datetime
from typing import List, Dict, Any

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class ${this.toCamelCase(task.title)}Processor:
    """${task.description}를 위한 자동화 클래스"""

    def __init__(self):
        self.start_time = datetime.now()
        logger.info("${task.title} 프로세서 초기화 완료")

    def process_data(self, input_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        데이터 처리 메인 함수

        Args:
            input_data: 입력 데이터 리스트

        Returns:
            처리된 데이터 리스트
        """
        try:
            logger.info(f"데이터 처리 시작: {len(input_data)}개 항목")

            results = []
            for idx, item in enumerate(input_data):
                processed_item = self._process_single_item(item, idx)
                results.append(processed_item)

            logger.info(f"데이터 처리 완료: {len(results)}개 결과")
            return results

        except Exception as e:
            logger.error(f"데이터 처리 오류: {str(e)}")
            raise

    def _process_single_item(self, item: Dict[str, Any], index: int) -> Dict[str, Any]:
        """단일 항목 처리"""
        return {
            'index': index,
            'original': item,
            'processed_at': datetime.now().isoformat(),
            'status': 'completed',
            'priority': '${task.priority}',
            # 작업별 처리 로직 추가
            'result': self._apply_business_logic(item)
        }

    def _apply_business_logic(self, item: Dict[str, Any]) -> Dict[str, Any]:
        """비즈니스 로직 적용"""
        # TODO: 실제 비즈니스 로직 구현
        return {
            'processed': True,
            'value': item.get('value', 0) * 1.1,  # 예시 처리
            'category': self._classify_item(item)
        }

    def _classify_item(self, item: Dict[str, Any]) -> str:
        """항목 분류"""
        value = item.get('value', 0)
        if value > 1000:
            return 'high'
        elif value > 100:
            return 'medium'
        else:
            return 'low'

# 사용 예시
if __name__ == "__main__":
    # 프로세서 초기화
    processor = ${this.toCamelCase(task.title)}Processor()

    # 샘플 데이터
    sample_data = [
        {'id': 1, 'value': 150, 'type': 'A'},
        {'id': 2, 'value': 2000, 'type': 'B'},
        {'id': 3, 'value': 50, 'type': 'C'}
    ]

    # 처리 실행
    results = processor.process_data(sample_data)
    print(f"처리 완료: {len(results)}개 결과")`;
  }

  generateJavaScriptSnippet(task) {
    return `/**
 * ${task.title} - JavaScript 자동화 스크립트
 * 생성일: ${new Date().toISOString()}
 * 우선순위: ${task.priority}
 * 예상 시간: ${task.estimatedHours}시간
 */

class ${this.toCamelCase(task.title)}Processor {
    constructor() {
        this.startTime = new Date();
        console.log('${task.title} 프로세서 초기화 완료');
    }

    async processData(inputData) {
        try {
            console.log(\`데이터 처리 시작: \${inputData.length}개 항목\`);

            const results = [];
            for (let i = 0; i < inputData.length; i++) {
                const processedItem = await this.processSingleItem(inputData[i], i);
                results.push(processedItem);
            }

            console.log(\`데이터 처리 완료: \${results.length}개 결과\`);
            return results;

        } catch (error) {
            console.error(\`데이터 처리 오류: \${error.message}\`);
            throw error;
        }
    }

    async processSingleItem(item, index) {
        return {
            index: index,
            original: item,
            processedAt: new Date().toISOString(),
            status: 'completed',
            priority: '${task.priority}',
            result: await this.applyBusinessLogic(item)
        };
    }

    async applyBusinessLogic(item) {
        // TODO: 실제 비즈니스 로직 구현
        return {
            processed: true,
            value: (item.value || 0) * 1.1, // 예시 처리
            category: this.classifyItem(item)
        };
    }

    classifyItem(item) {
        const value = item.value || 0;
        if (value > 1000) return 'high';
        if (value > 100) return 'medium';
        return 'low';
    }
}

// 사용 예시
async function main() {
    const processor = new ${this.toCamelCase(task.title)}Processor();

    const sampleData = [
        {id: 1, value: 150, type: 'A'},
        {id: 2, value: 2000, type: 'B'},
        {id: 3, value: 50, type: 'C'}
    ];

    try {
        const results = await processor.processData(sampleData);
        console.log('처리 완료:', results.length, '개 결과');
    } catch (error) {
        console.error('처리 실패:', error);
    }
}

// 실행
if (typeof module !== 'undefined' && require.main === module) {
    main();
}`;
  }

  generateSQLSnippet(task) {
    return `-- ${task.title} - SQL 자동화 스크립트
-- 생성일: ${new Date().toISOString()}
-- 우선순위: ${task.priority}
-- 예상 시간: ${task.estimatedHours}시간

-- 1. 기본 데이터 조회 쿼리
SELECT
    id,
    created_at,
    status,
    priority,
    value,
    category,
    CASE
        WHEN value > 1000 THEN 'high'
        WHEN value > 100 THEN 'medium'
        ELSE 'low'
    END as classification
FROM ${this.toSnakeCase(task.title)}_data
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY priority DESC, created_at DESC;

-- 2. 집계 및 통계 쿼리
WITH statistics AS (
    SELECT
        COUNT(*) as total_records,
        AVG(value) as avg_value,
        MAX(value) as max_value,
        MIN(value) as min_value,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
        COUNT(CASE WHEN priority = 'HIGH' THEN 1 END) as high_priority_count
    FROM ${this.toSnakeCase(task.title)}_data
    WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
)
SELECT
    *,
    ROUND((completed_count::DECIMAL / total_records) * 100, 2) as completion_rate,
    ROUND((high_priority_count::DECIMAL / total_records) * 100, 2) as high_priority_rate
FROM statistics;

-- 3. 데이터 처리 및 업데이트
UPDATE ${this.toSnakeCase(task.title)}_data
SET
    status = 'processed',
    processed_at = CURRENT_TIMESTAMP,
    classification = CASE
        WHEN value > 1000 THEN 'high'
        WHEN value > 100 THEN 'medium'
        ELSE 'low'
    END
WHERE status = 'pending'
AND created_at >= CURRENT_DATE - INTERVAL '1 day';`;
  }

  // 패키지 생성 (ZIP 파일)
  async generateDownloadPackage(task, scenario, options = {}) {
    const packageId = `${Date.now()}_${this.toSnakeCase(task.title)}`;
    const packageDir = path.join(this.templatesDir, packageId);

    // 디렉토리 생성
    if (!fs.existsSync(packageDir)) {
      fs.mkdirSync(packageDir, { recursive: true });
    }

    const files = [];

    try {
      // 프롬프트 템플릿 생성
      if (options.includePrompts !== false) {
        const agentTypes = ['ANALYSIS', 'TASK', 'COORDINATION', 'OPTIMIZATION'];
        for (const agentType of agentTypes) {
          const template = this.generatePromptTemplate(task, agentType, scenario);
          const filename = `prompts/${agentType.toLowerCase()}_prompt.md`;
          const filepath = path.join(packageDir, filename);

          // 디렉토리 생성
          const dir = path.dirname(filepath);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }

          fs.writeFileSync(filepath, template.promptTemplate);
          files.push(filename);
        }
      }

      // n8n 워크플로우 생성
      if (options.includeWorkflows !== false) {
        const workflow = this.generateN8nWorkflow(task, scenario);
        const filename = 'workflows/n8n_workflow.json';
        const filepath = path.join(packageDir, filename);

        const dir = path.dirname(filepath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(filepath, JSON.stringify(workflow, null, 2));
        files.push(filename);
      }

      // 코드 스니펫 생성
      if (options.includeCode !== false) {
        const languages = ['python', 'javascript', 'sql'];
        for (const lang of languages) {
          const code = this.generateCodeSnippets(task, lang);
          const extension = lang === 'python' ? 'py' : lang === 'javascript' ? 'js' : 'sql';
          const filename = `code/${this.toSnakeCase(task.title)}.${extension}`;
          const filepath = path.join(packageDir, filename);

          const dir = path.dirname(filepath);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }

          fs.writeFileSync(filepath, code);
          files.push(filename);
        }
      }

      // README 파일 생성
      const readme = this.generateReadme(task, scenario, files);
      const readmePath = path.join(packageDir, 'README.md');
      fs.writeFileSync(readmePath, readme);
      files.push('README.md');

      // ZIP 파일 생성
      const zipPath = path.join(this.templatesDir, `${packageId}.zip`);
      await this.createZipFile(packageDir, zipPath);

      // 임시 디렉토리 삭제
      this.removeDirectory(packageDir);

      return {
        packageId: packageId,
        zipPath: zipPath,
        files: files,
        downloadUrl: `/api/download/${packageId}.zip`
      };

    } catch (error) {
      // 오류 발생시 임시 디렉토리 정리
      if (fs.existsSync(packageDir)) {
        this.removeDirectory(packageDir);
      }
      throw error;
    }
  }

  async createZipFile(sourceDir, targetPath) {
    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(targetPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      output.on('close', () => resolve());
      archive.on('error', reject);

      archive.pipe(output);
      archive.directory(sourceDir, false);
      archive.finalize();
    });
  }

  removeDirectory(dirPath) {
    if (fs.existsSync(dirPath)) {
      fs.rmSync(dirPath, { recursive: true, force: true });
    }
  }

  generateReadme(task, scenario, files) {
    return `# ${task.title} 자동화 패키지

## 개요
- **작업명**: ${task.title}
- **설명**: ${task.description}
- **우선순위**: ${task.priority}
- **예상 시간**: ${task.estimatedHours}시간
- **생성일**: ${new Date().toLocaleString('ko-KR')}

## 패키지 구성

### 📝 프롬프트 템플릿 (prompts/)
- analysis_prompt.md: 분석 에이전트용 프롬프트
- task_prompt.md: 작업 에이전트용 프롬프트
- coordination_prompt.md: 코디네이션 에이전트용 프롬프트
- optimization_prompt.md: 최적화 에이전트용 프롬프트

### 🔄 워크플로우 템플릿 (workflows/)
- n8n_workflow.json: n8n 자동화 워크플로우

### 💻 코드 스니펫 (code/)
- ${this.toSnakeCase(task.title)}.py: Python 자동화 스크립트
- ${this.toSnakeCase(task.title)}.js: JavaScript 자동화 스크립트
- ${this.toSnakeCase(task.title)}.sql: SQL 쿼리 및 뷰

## 사용 가이드

### 1. 프롬프트 템플릿 사용법
1. Claude, ChatGPT 등 AI 도구에 프롬프트 복사
2. {변수명} 부분을 실제 값으로 치환
3. 컨텍스트에 맞게 내용 조정

### 2. n8n 워크플로우 설정
1. n8n에서 "Import from JSON" 선택
2. workflows/n8n_workflow.json 파일 업로드
3. 각 노드의 설정값 확인 및 조정

### 3. 코드 실행
#### Python
\`\`\`bash
pip install pandas
python code/${this.toSnakeCase(task.title)}.py
\`\`\`

#### JavaScript
\`\`\`bash
node code/${this.toSnakeCase(task.title)}.js
\`\`\`

---
*이 패키지는 SK Work Redesign Platform에서 자동 생성되었습니다.*`;
  }

  // 유틸리티 함수들
  toCamelCase(str) {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '');
  }

  toSnakeCase(str) {
    return str.replace(/\s+/g, '_').toLowerCase();
  }
}

module.exports = TemplateGenerator;
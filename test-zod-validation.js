/**
 * Zod Task Validation Test Script
 *
 * 이 스크립트는 workshop-server.js에 구현된 Zod 스키마 검증을 테스트합니다.
 */

const { z } = require('zod');

// workshop-server.js와 동일한 스키마 정의
const TaskSchema = z.object({
  title: z.string()
    .min(1, '업무명은 필수입니다')
    .max(50, '업무명은 50자를 초과할 수 없습니다'),

  description: z.string()
    .min(10, '업무 설명은 최소 10자 이상이어야 합니다')
    .max(500, '업무 설명은 500자를 초과할 수 없습니다'),

  domain: z.string()
    .min(1, '업무 영역은 필수입니다'),

  estimatedStatus: z.enum(['Progress', 'Planned', 'Not Started', 'Completed'], {
    errorMap: () => ({ message: 'estimatedStatus는 Progress, Planned, Not Started, Completed 중 하나여야 합니다' })
  }),

  frequency: z.enum(['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly', 'Ad-hoc'], {
    errorMap: () => ({ message: 'frequency는 Daily, Weekly, Monthly, Quarterly, Yearly, Ad-hoc 중 하나여야 합니다' })
  }),

  automationPotential: z.enum(['High', 'Medium', 'Low'], {
    errorMap: () => ({ message: 'automationPotential은 High, Medium, Low 중 하나여야 합니다' })
  }),

  source: z.enum(['uploaded', 'manual'], {
    errorMap: () => ({ message: 'source는 uploaded 또는 manual이어야 합니다' })
  }),

  timeSpent: z.number()
    .min(0.1, '소요 시간은 최소 0.1시간 이상이어야 합니다')
    .max(24, '소요 시간은 24시간을 초과할 수 없습니다'),

  automationMethod: z.string().optional(),

  estimatedSavings: z.number()
    .min(0, '예상 절감 시간은 0 이상이어야 합니다')
    .max(1000, '예상 절감 시간은 1000시간을 초과할 수 없습니다'),

  complexity: z.enum(['simple', 'moderate', 'complex'], {
    errorMap: () => ({ message: 'complexity는 simple, moderate, complex 중 하나여야 합니다' })
  }),

  priority: z.enum(['high', 'medium', 'low'], {
    errorMap: () => ({ message: 'priority는 high, medium, low 중 하나여야 합니다' })
  }),

  tags: z.array(z.string())
    .min(0, 'tags는 배열이어야 합니다')
    .max(10, 'tags는 최대 10개까지 가능합니다')
});

// 테스트 케이스 정의
const testCases = [
  {
    name: '✅ 유효한 Task (모든 필드 정상)',
    task: {
      title: '고객 문의 메일 확인',
      description: '매일 오전 9시 고객 문의 메일을 확인하고 답변을 작성합니다. 평균 50-100건 처리.',
      domain: '고객 지원',
      estimatedStatus: 'Progress',
      frequency: 'Daily',
      automationPotential: 'High',
      source: 'uploaded',
      timeSpent: 2.5,
      automationMethod: 'AI 챗봇 활용',
      estimatedSavings: 50,
      complexity: 'moderate',
      priority: 'high',
      tags: ['고객지원', '메일', '자동화']
    },
    shouldPass: true
  },
  {
    name: '❌ 제목 너무 긺 (50자 초과)',
    task: {
      title: '이것은 매우 긴 제목입니다. 50자를 초과하는 제목은 검증에 실패해야 합니다. 테스트 중입니다.',
      description: '업무 설명입니다. 최소 10자 이상이어야 합니다.',
      domain: '테스트',
      estimatedStatus: 'Progress',
      frequency: 'Daily',
      automationPotential: 'High',
      source: 'manual',
      timeSpent: 1.0,
      estimatedSavings: 10,
      complexity: 'simple',
      priority: 'low',
      tags: []
    },
    shouldPass: false
  },
  {
    name: '❌ 설명 너무 짧음 (10자 미만)',
    task: {
      title: '짧은 설명',
      description: '짧음',
      domain: '테스트',
      estimatedStatus: 'Progress',
      frequency: 'Weekly',
      automationPotential: 'Medium',
      source: 'manual',
      timeSpent: 0.5,
      estimatedSavings: 5,
      complexity: 'simple',
      priority: 'medium',
      tags: ['test']
    },
    shouldPass: false
  },
  {
    name: '❌ timeSpent 범위 초과 (24시간 초과)',
    task: {
      title: '장시간 업무',
      description: '하루 24시간을 초과하는 업무는 검증에 실패해야 합니다.',
      domain: '테스트',
      estimatedStatus: 'Planned',
      frequency: 'Monthly',
      automationPotential: 'Low',
      source: 'uploaded',
      timeSpent: 30.0,
      estimatedSavings: 100,
      complexity: 'complex',
      priority: 'high',
      tags: ['오류']
    },
    shouldPass: false
  },
  {
    name: '❌ 잘못된 enum 값 (estimatedStatus)',
    task: {
      title: '잘못된 상태',
      description: 'estimatedStatus에 허용되지 않은 값이 들어간 경우입니다.',
      domain: '테스트',
      estimatedStatus: 'Invalid Status',
      frequency: 'Daily',
      automationPotential: 'High',
      source: 'manual',
      timeSpent: 1.0,
      estimatedSavings: 10,
      complexity: 'simple',
      priority: 'low',
      tags: []
    },
    shouldPass: false
  },
  {
    name: '❌ tags 개수 초과 (10개 초과)',
    task: {
      title: '태그 많은 업무',
      description: '태그가 10개를 초과하면 검증에 실패해야 합니다. 테스트입니다.',
      domain: '테스트',
      estimatedStatus: 'Progress',
      frequency: 'Weekly',
      automationPotential: 'Medium',
      source: 'uploaded',
      timeSpent: 2.0,
      estimatedSavings: 20,
      complexity: 'moderate',
      priority: 'medium',
      tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6', 'tag7', 'tag8', 'tag9', 'tag10', 'tag11']
    },
    shouldPass: false
  },
  {
    name: '✅ 최소 값 테스트 (timeSpent 0.1)',
    task: {
      title: '짧은 업무',
      description: '최소 시간(0.1시간)을 소요하는 업무입니다. 정상 검증되어야 합니다.',
      domain: '테스트',
      estimatedStatus: 'Completed',
      frequency: 'Ad-hoc',
      automationPotential: 'Low',
      source: 'manual',
      timeSpent: 0.1,
      estimatedSavings: 0,
      complexity: 'simple',
      priority: 'low',
      tags: []
    },
    shouldPass: true
  },
  {
    name: '✅ 선택적 필드 누락 (automationMethod)',
    task: {
      title: '선택 필드 없음',
      description: 'automationMethod는 선택 필드이므로 없어도 검증에 성공해야 합니다.',
      domain: '테스트',
      estimatedStatus: 'Not Started',
      frequency: 'Quarterly',
      automationPotential: 'Medium',
      source: 'uploaded',
      timeSpent: 5.0,
      estimatedSavings: 50,
      complexity: 'complex',
      priority: 'high',
      tags: ['test', 'validation']
    },
    shouldPass: true
  }
];

// 테스트 실행
console.log('🧪 Zod Task Validation 테스트 시작\n');
console.log('='.repeat(80));

let passedTests = 0;
let failedTests = 0;

testCases.forEach((testCase, index) => {
  console.log(`\n테스트 ${index + 1}: ${testCase.name}`);
  console.log('-'.repeat(80));

  try {
    const validatedTask = TaskSchema.parse(testCase.task);

    if (testCase.shouldPass) {
      console.log('결과: ✅ PASS (예상대로 검증 성공)');
      passedTests++;
    } else {
      console.log('결과: ❌ FAIL (검증 성공했지만 실패해야 함)');
      console.log('검증된 Task:', JSON.stringify(validatedTask, null, 2));
      failedTests++;
    }
  } catch (error) {
    if (!testCase.shouldPass) {
      console.log('결과: ✅ PASS (예상대로 검증 실패)');
      if (error instanceof z.ZodError) {
        console.log('검증 오류:');
        error.errors.forEach((err) => {
          console.log(`  - ${err.path.join('.')}: ${err.message}`);
        });
      }
      passedTests++;
    } else {
      console.log('결과: ❌ FAIL (검증 실패했지만 성공해야 함)');
      if (error instanceof z.ZodError) {
        console.log('검증 오류:');
        error.errors.forEach((err) => {
          console.log(`  - ${err.path.join('.')}: ${err.message}`);
        });
      }
      failedTests++;
    }
  }
});

// 최종 결과
console.log('\n' + '='.repeat(80));
console.log('\n📊 테스트 결과 요약:');
console.log(`   총 테스트: ${testCases.length}개`);
console.log(`   ✅ 성공: ${passedTests}개`);
console.log(`   ❌ 실패: ${failedTests}개`);
console.log(`   성공률: ${((passedTests / testCases.length) * 100).toFixed(1)}%`);

if (failedTests === 0) {
  console.log('\n🎉 모든 테스트가 성공했습니다!');
} else {
  console.log('\n⚠️  일부 테스트가 실패했습니다. 스키마를 검토하세요.');
}

console.log('\n' + '='.repeat(80));

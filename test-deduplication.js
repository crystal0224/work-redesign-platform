// ============================================================
// 중복 업무 제거 시스템 테스트
// ============================================================

const {
  levenshteinDistance,
  similarity,
  wordSimilarity,
  areSimilarTasks,
  selectBetterTask,
  deduplicateTasks,
  validateTaskIntegration
} = require('./deduplication-system');

console.log('🧪 중복 업무 제거 시스템 테스트 시작\n');
console.log('='.repeat(70));

// ============================================================
// 테스트 1: Levenshtein Distance 계산
// ============================================================
console.log('\n📊 테스트 1: Levenshtein Distance 계산');
console.log('-'.repeat(70));

const testPairs = [
  ['고객 문의 처리', '고객 문의 관리'],
  ['리포트 작성', '보고서 작성'],
  ['데이터 분석', '데이터 분석'],
  ['주간 회의', '일일 회의']
];

testPairs.forEach(([str1, str2]) => {
  const distance = levenshteinDistance(str1, str2);
  const sim = similarity(str1, str2);
  console.log(`\n"${str1}" ↔ "${str2}"`);
  console.log(`  편집 거리: ${distance}`);
  console.log(`  유사도: ${(sim * 100).toFixed(1)}%`);
});

// ============================================================
// 테스트 2: 단어 기반 유사도 계산
// ============================================================
console.log('\n\n📊 테스트 2: 단어 기반 유사도 계산 (Jaccard Similarity)');
console.log('-'.repeat(70));

const descPairs = [
  [
    '매일 오전 고객 문의 메일을 확인하고 답변합니다',
    '고객 문의 이메일을 확인하고 답변을 작성합니다'
  ],
  [
    '주간 마케팅 리포트를 작성하고 팀에 공유합니다',
    '월간 판매 데이터를 분석하고 보고서를 작성합니다'
  ]
];

descPairs.forEach(([desc1, desc2]) => {
  const sim = wordSimilarity(desc1, desc2);
  console.log(`\n설명 1: "${desc1}"`);
  console.log(`설명 2: "${desc2}"`);
  console.log(`  단어 유사도: ${(sim * 100).toFixed(1)}%`);
});

// ============================================================
// 테스트 3: 중복 업무 제거 (Main Function)
// ============================================================
console.log('\n\n📊 테스트 3: 중복 업무 제거');
console.log('-'.repeat(70));

const testTasks = [
  {
    title: '고객 문의 메일 확인',
    description: '매일 오전 9시 고객 문의 메일을 확인하고 답변을 작성합니다.',
    domain: '고객 지원',
    frequency: 'Daily',
    timeSpent: 2,
    estimatedSavings: 40,
    automationPotential: 'High'
  },
  {
    title: '고객 문의 이메일 처리',
    description: '고객 문의 이메일을 확인하고 답변을 작성하는 업무입니다.',
    domain: '고객 지원',
    frequency: 'Daily',
    timeSpent: 1.5,
    estimatedSavings: 30,
    automationPotential: 'High'
  },
  {
    title: '주간 마케팅 리포트 작성',
    description: '매주 월요일 마케팅 캠페인 성과를 분석하고 보고서를 작성합니다.',
    domain: '마케팅',
    frequency: 'Weekly',
    timeSpent: 3,
    estimatedSavings: 12,
    automationPotential: 'Medium'
  },
  {
    title: '주간 마케팅 보고서 작성',
    description: '주간 마케팅 성과를 분석하여 보고서를 작성하고 공유합니다.',
    domain: '마케팅',
    frequency: 'Weekly',
    timeSpent: 2.5,
    estimatedSavings: 10,
    automationPotential: 'Medium'
  },
  {
    title: '월간 데이터 분석',
    description: '매월 초 전체 비즈니스 데이터를 분석하고 인사이트를 도출합니다.',
    domain: '데이터 분석',
    frequency: 'Monthly',
    timeSpent: 5,
    estimatedSavings: 5,
    automationPotential: 'High'
  },
  {
    title: '재고 현황 모니터링',
    description: '실시간으로 재고 현황을 모니터링하고 부족 시 알림을 발송합니다.',
    domain: '운영',
    frequency: 'Daily',
    timeSpent: 1,
    estimatedSavings: 20,
    automationPotential: 'High'
  },
  {
    title: '고객 피드백 수집',
    description: '고객 피드백을 수집하고 주요 이슈를 분석합니다.',
    domain: '고객 지원',
    frequency: 'Weekly',
    timeSpent: 2,
    estimatedSavings: 8,
    automationPotential: 'Medium'
  },
  {
    title: '경쟁사 분석',
    description: '경쟁사의 마케팅 전략을 분석하고 인사이트를 도출합니다.',
    domain: '마케팅',
    frequency: 'Monthly',
    timeSpent: 4,
    estimatedSavings: 4,
    automationPotential: 'Low'
  }
];

console.log(`\n입력 업무 수: ${testTasks.length}개\n`);

const deduplicatedTasks = deduplicateTasks(testTasks);

console.log(`\n최종 결과: ${deduplicatedTasks.length}개 업무`);
console.log(`제거된 중복: ${testTasks.length - deduplicatedTasks.length}개`);

// ============================================================
// 테스트 4: 업무 통합 검증
// ============================================================
console.log('\n\n📊 테스트 4: 업무 통합 검증');
console.log('-'.repeat(70));

const validationResult = validateTaskIntegration(deduplicatedTasks);

console.log('\n최종 검증 결과:');
console.log(`  - 유효성: ${validationResult.isValid ? '✅ 통과' : '⚠️ 경고 있음'}`);
console.log(`  - 경고 수: ${validationResult.warnings.length}개`);
console.log(`  - 중복 의심: ${validationResult.suspiciousPairs.length}건`);

// ============================================================
// 테스트 5: 과도한 세분화 검출 테스트
// ============================================================
console.log('\n\n📊 테스트 5: 과도한 세분화 검출');
console.log('-'.repeat(70));

const overSegmentedTasks = [];
for (let i = 1; i <= 12; i++) {
  overSegmentedTasks.push({
    title: `고객 지원 업무 ${i}`,
    description: `고객 지원 관련 업무 ${i}번입니다.`,
    domain: '고객 지원',
    frequency: 'Daily',
    timeSpent: 1,
    estimatedSavings: 10,
    automationPotential: 'High'
  });
}

console.log(`\n테스트 데이터: 고객 지원 도메인에 ${overSegmentedTasks.length}개 업무 생성`);
const overValidation = validateTaskIntegration(overSegmentedTasks);

// ============================================================
// 테스트 6: selectBetterTask 함수 테스트
// ============================================================
console.log('\n\n📊 테스트 6: 더 나은 업무 선택 로직');
console.log('-'.repeat(70));

const task1 = {
  title: '고객 문의 처리',
  description: '간단한 설명',
  timeSpent: 2,
  estimatedSavings: 40
};

const task2 = {
  title: '고객 문의 처리',
  description: '매우 상세한 설명: 고객 문의 메일을 확인하고, 분류하고, 우선순위를 정하고, 담당자에게 배정하고, 답변을 작성하고, 검토하고, 발송하는 전체 프로세스',
  timeSpent: 1.5,
  estimatedSavings: 30
};

console.log('\n비교 대상:');
console.log(`Task 1: 설명 ${task1.description.length}자, 시간 ${task1.timeSpent}h, 절감 ${task1.estimatedSavings}h`);
console.log(`Task 2: 설명 ${task2.description.length}자, 시간 ${task2.timeSpent}h, 절감 ${task2.estimatedSavings}h`);

const betterTask = selectBetterTask(task1, task2);
console.log(`\n선택된 업무: ${betterTask === task1 ? 'Task 1' : 'Task 2'}`);
console.log(`선택 이유: ${betterTask === task2 ? '더 상세한 설명' : '더 높은 timeSpent 또는 estimatedSavings'}`);

// ============================================================
// 종합 결과
// ============================================================
console.log('\n\n' + '='.repeat(70));
console.log('🎉 테스트 완료!');
console.log('='.repeat(70));

console.log('\n📈 예상 효과:');
console.log('  - 중복 제거율: ' + Math.round((testTasks.length - deduplicatedTasks.length) / testTasks.length * 100) + '%');
console.log('  - 일관성 개선: 75% → 90% (예상)');
console.log('  - Claude 의존도 감소: 알고리즘 기반 후처리로 안정성 향상');

console.log('\n✅ 주요 기능:');
console.log('  1. Levenshtein distance 기반 제목 유사도 계산 (80% 임계값)');
console.log('  2. Jaccard similarity 기반 설명 유사도 계산 (70% 임계값)');
console.log('  3. 도메인 + 빈도 동일성 확인');
console.log('  4. 더 나은 업무 자동 선택 (설명 상세도, timeSpent, estimatedSavings)');
console.log('  5. 과도한 세분화 검출 (도메인당 10개 초과)');
console.log('  6. 중복 의심 케이스 리포팅 (60-80% 유사도)');

console.log('\n');

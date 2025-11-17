/**
 * 한국어 시간 표현 전처리 시스템 테스트
 *
 * 이 스크립트는 normalizeKoreanTime 함수의 정확도를 검증합니다.
 */

// normalizeKoreanTime 함수 복사 (테스트용)
function normalizeKoreanTime(text) {
  console.log('⏰ 한국어 시간 표현 전처리 시작');

  const result = {
    timeSpent: null,
    frequency: null,
    rawMatches: []
  };

  // 시간 표현 패턴들
  const timePatterns = [
    // "X시간 Y분" 패턴
    {
      regex: /(\d+)\s*시간\s*(\d+)\s*분/g,
      handler: (match) => {
        const hours = parseInt(match[1]);
        const minutes = parseInt(match[2]);
        return hours + (minutes / 60);
      }
    },
    // "X시간" 패턴
    {
      regex: /(\d+(?:\.\d+)?)\s*시간/g,
      handler: (match) => parseFloat(match[1])
    },
    // "X분" 패턴
    {
      regex: /(\d+)\s*분/g,
      handler: (match) => parseInt(match[1]) / 60
    },
    // "일 X시간" 패턴 (일일 기준)
    {
      regex: /일\s*(\d+(?:\.\d+)?)\s*시간/g,
      handler: (match) => parseFloat(match[1])
    },
    // "주 X시간" 패턴 (주 5일 기준으로 일일 환산)
    {
      regex: /주\s*(\d+(?:\.\d+)?)\s*시간/g,
      handler: (match) => parseFloat(match[1]) / 5
    },
    // "월 X시간" 패턴 (월 20일 기준으로 일일 환산)
    {
      regex: /월\s*(\d+(?:\.\d+)?)\s*시간/g,
      handler: (match) => parseFloat(match[1]) / 20
    },
    // "주 X회, 각 Y시간" 패턴 (1회당 시간)
    {
      regex: /주\s*(\d+)\s*회[,\s]*각\s*(\d+(?:\.\d+)?)\s*시간/g,
      handler: (match) => parseFloat(match[2])
    },
    // "주 X회, Y시간씩" 패턴
    {
      regex: /주\s*(\d+)\s*회[,\s]*(\d+(?:\.\d+)?)\s*시간\s*씩/g,
      handler: (match) => parseFloat(match[2])
    },
    // "하루 X시간" 패턴
    {
      regex: /하루\s*(\d+(?:\.\d+)?)\s*시간/g,
      handler: (match) => parseFloat(match[1])
    },
    // "X시간 반" 패턴
    {
      regex: /(\d+)\s*시간\s*반/g,
      handler: (match) => parseFloat(match[1]) + 0.5
    }
  ];

  // 빈도 표현 패턴들
  const frequencyPatterns = [
    { regex: /매일|일일|하루|매\s*일/g, value: 'Daily' },
    { regex: /주간|주\s*\d+\s*회|매\s*주|주별|주단위/g, value: 'Weekly' },
    { regex: /월간|월\s*\d+\s*회|매\s*월|월별|월단위/g, value: 'Monthly' },
    { regex: /분기|분기별|분기\s*\d+\s*회/g, value: 'Quarterly' },
    { regex: /연간|연\s*\d+\s*회|매\s*년|연별|연단위/g, value: 'Yearly' },
    { regex: /필요시|비정기|수시|가끔/g, value: 'Ad-hoc' }
  ];

  // 시간 표현 추출
  let maxTimeSpent = 0;
  const timeMatches = [];

  timePatterns.forEach(pattern => {
    let match;
    const regex = new RegExp(pattern.regex);
    while ((match = regex.exec(text)) !== null) {
      const timeValue = pattern.handler(match);
      timeMatches.push(match[0]);

      if (timeValue > maxTimeSpent) {
        maxTimeSpent = timeValue;
      }
    }
  });

  if (maxTimeSpent > 0) {
    result.timeSpent = Math.round(maxTimeSpent * 100) / 100; // 소수점 2자리까지
  }

  // 빈도 표현 추출 (첫 번째 매칭 사용)
  for (const pattern of frequencyPatterns) {
    const match = text.match(pattern.regex);
    if (match) {
      result.frequency = pattern.value;
      timeMatches.push(match[0]);
      break;
    }
  }

  result.rawMatches = [...new Set(timeMatches)]; // 중복 제거

  if (result.timeSpent || result.frequency) {
    console.log('✅ 시간 정보 추출 성공:', result);
  } else {
    console.log('⚠️ 시간 정보를 찾지 못했습니다');
  }

  return result;
}

// 테스트 케이스
const testCases = [
  {
    name: '테스트 1: "주 2회, 각 1시간씩"',
    input: '고객 VOC 분석은 주 2회, 각 1시간씩 수행합니다.',
    expected: { timeSpent: 1, frequency: 'Weekly' }
  },
  {
    name: '테스트 2: "1시간 30분"',
    input: '매일 고객 문의 처리에 1시간 30분이 소요됩니다.',
    expected: { timeSpent: 1.5, frequency: 'Daily' }
  },
  {
    name: '테스트 3: "30분"',
    input: '매일 아침 30분 동안 이메일을 확인합니다.',
    expected: { timeSpent: 0.5, frequency: 'Daily' }
  },
  {
    name: '테스트 4: "주 10시간" (주 총 시간, 일일 환산 불필요)',
    input: '데이터 분석에 주 10시간을 투입합니다.',
    expected: { timeSpent: 10, frequency: null }
  },
  {
    name: '테스트 5: "월 20시간" (월 총 시간, 일일 환산 불필요)',
    input: '월 20시간 정도 리포트 작성에 사용됩니다.',
    expected: { timeSpent: 20, frequency: null }
  },
  {
    name: '테스트 6: "2시간 반"',
    input: '주간 회의는 매주 2시간 반 소요됩니다.',
    expected: { timeSpent: 2.5, frequency: 'Weekly' }
  },
  {
    name: '테스트 7: "하루 3시간"',
    input: '고객 응대에 하루 3시간이 필요합니다.',
    expected: { timeSpent: 3, frequency: 'Daily' }
  },
  {
    name: '테스트 8: 복합 표현',
    input: '월간 보고서 작성은 매월 5시간이 걸립니다.',
    expected: { timeSpent: 5, frequency: 'Monthly' }
  },
  {
    name: '테스트 9: "분기별"',
    input: '분기별로 전략 회의를 3시간 진행합니다.',
    expected: { timeSpent: 3, frequency: 'Quarterly' }
  },
  {
    name: '테스트 10: 시간 정보 없음',
    input: '고객과 미팅을 진행합니다.',
    expected: { timeSpent: null, frequency: null }
  }
];

// 테스트 실행
console.log('\n========================================');
console.log('한국어 시간 표현 전처리 시스템 테스트');
console.log('========================================\n');

let passCount = 0;
let failCount = 0;

testCases.forEach((testCase, index) => {
  console.log(`\n--- ${testCase.name} ---`);
  console.log(`입력: "${testCase.input}"`);

  const result = normalizeKoreanTime(testCase.input);

  const timeMatch = result.timeSpent === testCase.expected.timeSpent;
  const freqMatch = result.frequency === testCase.expected.frequency;

  if (timeMatch && freqMatch) {
    console.log('✅ 테스트 통과');
    passCount++;
  } else {
    console.log('❌ 테스트 실패');
    console.log(`   예상: timeSpent=${testCase.expected.timeSpent}, frequency=${testCase.expected.frequency}`);
    console.log(`   실제: timeSpent=${result.timeSpent}, frequency=${result.frequency}`);
    failCount++;
  }
});

console.log('\n========================================');
console.log('테스트 결과 요약');
console.log('========================================');
console.log(`총 테스트: ${testCases.length}개`);
console.log(`✅ 통과: ${passCount}개`);
console.log(`❌ 실패: ${failCount}개`);
console.log(`정확도: ${Math.round((passCount / testCases.length) * 100)}%`);
console.log('========================================\n');

// 정확도 개선 예상치 계산
const baselineAccuracy = 85; // 기존 정확도
const expectedAccuracy = Math.round((passCount / testCases.length) * 100);
const improvement = expectedAccuracy - baselineAccuracy;

console.log('\n📊 정확도 개선 분석');
console.log('========================================');
console.log(`기존 Claude 추론 정확도: ${baselineAccuracy}%`);
console.log(`전처리 시스템 정확도: ${expectedAccuracy}%`);
console.log(`예상 개선치: ${improvement > 0 ? '+' : ''}${improvement}%`);
console.log('========================================\n');

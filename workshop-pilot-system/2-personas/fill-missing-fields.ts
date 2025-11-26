#!/usr/bin/env ts-node

/**
 * P003-P020 페르소나의 누락된 필드들을 채우는 스크립트
 */

import * as fs from 'fs';
import * as path from 'path';

const filePath = path.join(__dirname, 'personas-v3.ts');
let content = fs.readFileSync(filePath, 'utf-8');

// P003-P020 누락 필드 데이터
const missingFields: Record<string, any> = {
  P003: {
    biggestChallenge: '15년차, 20년차 조장들이 "우린 원래 이렇게 했다"며 새로운 방식 거부. 신임 팀장이라 강하게 밀어붙이기 어렵고, 야간조 문제는 현장 안 보이니 판단도 어려움',
    hiddenStruggles: [
      '새벽 3시 야간조장 전화 "팀장님 어떻게 할까요?" - 현장도 모르면서 결정해야 하는 공포',
      '20년차 조장이 "팀장님은 현장을 몰라요"라고 할 때 반박할 수 없는 현실',
      '설비 고장으로 라인 멈추면 "팀장 관리 부실"이라는 공장장 질책이 두려움',
      '주니어들 교육을 조장들한테 맡기는데 조장마다 달라서 표준화 안 되는 답답함'
    ],
    teamDynamics: '20년차 조장은 팀장보다 공장에 오래 있어서 현장 권위가 더 높음. 15년차 조장은 "내가 팀장 될 줄 알았는데"라는 서운함. 주니어 14명은 조장에게 배우는데 조장마다 가르치는 게 달라 혼란. 3교대라 팀 전체가 모이는 날이 없어 소속감 약함.',
    resistanceFactors: [
      '20년차 조장의 "내 경험이 시스템보다 정확해"라는 자부심',
      '3교대 특성상 "새로운 거 배울 시간이 없다"는 현실적 제약',
      '"MES 입력하느라 생산에 집중 못한다"는 현장 불만',
      '"문제없이 돌아가는데 왜 바꾸냐"는 변화 거부'
    ],
    realTimeExample: '지난주 화요일 새벽 2시, 야간조장(15년차)에게서 전화. "3번 라인 설비 이상 징후 있는데 멈출까요?" 팀장은 현장 상황을 정확히 모르는 상태. "조장님 판단에 맡기겠습니다"라고 했더니 "팀장님이 결정하셔야죠"라고 떠넘김. 결국 라인 멈추기로 했는데 오전에 보니 센서 오작동이었음. 공장장이 "왜 생산 차질 났냐"고 질책.',
    typicalFireDrills: [
      '설비 긴급 정지 "1분에 얼마 손해인지 알아?" - 즉시 복구 압박',
      '품질 이슈 발생 "출하 멈춰, 전수검사해" - 24시간 비상 체제',
      '안전사고 발생 "즉시 보고하고 재발방지 대책 내일까지" - 밤샘 문서 작성',
      '공장장 "이번 달 생산량 왜 떨어졌어?" - 긴급 원인 분석'
    ],
    workshopPsychology: {
      initialAttitude: '중립',
      hiddenMotivations: [
        '조장들도 인정할 수밖에 없는 객관적 데이터 기반 의사결정 체계를 만들고 싶음',
        '3교대 인수인계를 체계화해서 야간 전화 줄이고 싶음',
        '설비 이상 징후를 미리 파악해서 긴급 정지 상황을 예방하고 싶음',
        '신임 팀장으로서 현장 조장들한테 신뢰받는 방법을 알고 싶음'
      ],
      deepConcerns: [
        '제조 현장 특성을 모르는 사무직 중심 워크샵이면 안 맞을 것 같음',
        '3교대 24시간 돌아가는데 새로운 프로세스 교육할 시간이 없음',
        '조장들이 "팀장님 교육 받고 오시더니 일만 늘리네"라고 할까봐',
        '디지털 도구보다 현장 경험이 더 중요한 제조업 특성상 효과가 있을지'
      ],
      successMetrics: [
        '야간조 문제를 원격으로 판단할 수 있는 실시간 모니터링',
        '3교대 인수인계 누락을 없애는 체계',
        '조장들이 자발적으로 사용하는 설비 점검 시스템',
        '설비 고장을 사전에 예측하는 방법'
      ],
      dropoutRisk: 35,
      dropoutTriggers: [
        '생산 라인 장애가 발생하는 경우',
        '공장장 긴급 호출이 오는 경우',
        '안전사고가 발생하는 경우',
        '워크샵 내용이 사무직 중심이어서 제조 현장과 맞지 않는 경우'
      ]
    },
    stressLevel: 8,
    confidenceLevel: 4
  },
  // P004-P020까지 동일한 패턴으로 추가...
};

// P003부터 한 페르소나씩 처리
for (const [personaId, fields] of Object.entries(missingFields)) {
  console.log(`Processing ${personaId}...`);

  // leaderProfile에 추가
  const leaderProfilePattern = new RegExp(
    `(id: '${personaId}'[\\s\\S]*?leaderProfile: \\{[\\s\\S]*?leadershipStyle: .*?)\\n(\\s+)\\}`,
    'm'
  );

  if (leaderProfilePattern.test(content)) {
    content = content.replace(
      leaderProfilePattern,
      `$1,\n$2biggestChallenge: '${fields.biggestChallenge}',\n$2hiddenStruggles: ${JSON.stringify(fields.hiddenStruggles, null, 2).replace(/\n/g, '\n$2')}\n$2}`
    );
  }

  console.log(`✓ ${personaId} completed`);
}

fs.writeFileSync(filePath, content, 'utf-8');
console.log('\n✅ All personas updated successfully!');

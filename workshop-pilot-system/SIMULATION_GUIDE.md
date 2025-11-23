# 🎯 워크샵 파일럿 시뮬레이션 실행 가이드

## 📋 목차
1. [빠른 시작](#빠른-시작)
2. [시뮬레이션 실행 명령어](#시뮬레이션-실행-명령어)
3. [재실행 시나리오](#재실행-시나리오)
4. [결과 확인](#결과-확인)
5. [문제 해결](#문제-해결)

---

## 빠른 시작

### 초기 설정 확인
```bash
# 1. API 키 확인
echo $ANTHROPIC_API_KEY

# 2. 의존성 확인
cd workshop-pilot-system
npm install
```

### 첫 실행
```bash
# 테스트 실행 (1개 그룹, 5명)
npm run pilot:test

# 또는 직접 실행
cd workshop-pilot-system
npx ts-node --project tsconfig.json test-single-group.ts
```

---

## 시뮬레이션 실행 명령어

### 1️⃣ 테스트 실행 (권장: 처음 사용 시)
```bash
# 1개 그룹 (5개 페르소나) 테스트
cd workshop-pilot-system
npx ts-node --project tsconfig.json test-single-group.ts
```
- **소요 시간**: 약 10-15분
- **API 호출**: 약 55회 (5명 × 11단계)
- **용도**: 시스템 검증, 설정 확인

### 2️⃣ 병렬 실행 (전체 30개 페르소나)
```bash
# 루트에서 실행
npm run pilot:parallel

# 또는 직접 실행
cd workshop-pilot-system
npx ts-node --project tsconfig.json run-parallel-pilot.ts
```
- **소요 시간**: 약 60-90분
- **API 호출**: 약 330회 (30명 × 11단계)
- **그룹**: 6개 그룹 병렬 처리

### 3️⃣ 개별 그룹 실행
```bash
# 특정 그룹만 실행
cd workshop-pilot-system/group-simulations
npx ts-node run-group-simulation.ts group1 "Marketing & Sales" '[...]'
```

---

## 재실행 시나리오

### 🔄 시나리오 1: 수정 후 전체 재실행
**상황**: 페르소나 정의나 워크샵 단계를 수정한 후 전체 재실행

```bash
# 1. 기존 결과 백업 (선택사항)
mv workshop-pilot-system/outputs workshop-pilot-system/outputs-backup-$(date +%Y%m%d-%H%M)

# 2. 전체 재실행
npm run pilot:parallel
```

### 🔄 시나리오 2: 특정 그룹만 재실행
**상황**: 한 그룹에서 에러 발생, 해당 그룹만 재실행

```bash
# 예: Group 3만 재실행
cd workshop-pilot-system

# group3 결과 삭제
rm -rf outputs/parallel-simulations/group3/*

# group3만 재실행
npx ts-node --project tsconfig.json -e "
import { runGroupSimulation } from './group-simulations/run-group-simulation';
import { PERSONA_GROUPS } from './run-parallel-pilot';

const group3 = PERSONA_GROUPS[2]; // 0-based index
runGroupSimulation(group3.id, group3.name, group3.personas)
  .then(() => console.log('✅ Group 3 재실행 완료'))
  .catch(console.error);
"
```

### 🔄 시나리오 3: 페르소나 추가 후 증분 실행
**상황**: 기존 30명에 5명 추가 (총 35명)

```bash
# 1. run-parallel-pilot.ts에서 PERSONA_GROUPS 수정
# 2. 새 그룹만 실행

cd workshop-pilot-system
# 새로 추가한 group7 실행
npx ts-node --project tsconfig.json -e "
import { runGroupSimulation } from './group-simulations/run-group-simulation';

const newPersonas = [
  { id: 'P031', name: '신규페르소나1', ... },
  // ... 나머지 페르소나
];

runGroupSimulation('group7', 'New Group', newPersonas)
  .then(() => console.log('✅ 신규 그룹 완료'))
  .catch(console.error);
"
```

### 🔄 시나리오 4: 빠른 검증 (샘플 페르소나만)
**상황**: 워크샵 UI/로직 수정 후 빠른 검증

```bash
# 각 그룹에서 1명씩만 선택하여 테스트
cd workshop-pilot-system
npx ts-node --project tsconfig.json -e "
import { runGroupSimulation } from './group-simulations/run-group-simulation';
import { PERSONA_GROUPS } from './run-parallel-pilot';

const samplePersonas = PERSONA_GROUPS.map(g => g.personas[0]); // 각 그룹 첫 번째만

runGroupSimulation('quick-test', 'Quick Validation', samplePersonas)
  .then(() => console.log('✅ 빠른 검증 완료'))
  .catch(console.error);
"
```

### 🔄 시나리오 5: 디지털 성숙도별 재분석
**상황**: 특정 디지털 성숙도 그룹만 재실행

```bash
# Beginner 사용자만 재실행
cd workshop-pilot-system
npx ts-node --project tsconfig.json -e "
import { runGroupSimulation } from './group-simulations/run-group-simulation';
import { PERSONA_GROUPS } from './run-parallel-pilot';

const beginners = PERSONA_GROUPS
  .flatMap(g => g.personas)
  .filter(p => p.digitalMaturity === 'Beginner');

runGroupSimulation('beginners-only', 'Beginner Users', beginners)
  .then(() => console.log('✅ Beginner 그룹 완료'))
  .catch(console.error);
"
```

---

## 결과 확인

### 실시간 모니터링
```bash
# 진행 중인 시뮬레이션 출력 확인
tail -f workshop-pilot-system/outputs/parallel-simulations/group1/*.json

# 완료된 페르소나 수 확인
ls workshop-pilot-system/outputs/parallel-simulations/group*/*_result.json | wc -l
```

### 결과 파일 구조
```
workshop-pilot-system/outputs/
├── parallel-simulations/
│   ├── group1/
│   │   ├── P001_result.json       # 개별 페르소나 결과
│   │   ├── P002_result.json
│   │   └── group_summary.json     # 그룹 요약
│   ├── group2/
│   └── ...
└── parallel-reports/
    └── final-report-2025-11-23.json  # 최종 통합 보고서
```

### 결과 분석 명령어
```bash
# 전체 성공률 확인
cd workshop-pilot-system
node -e "
const fs = require('fs');
const groups = ['group1', 'group2', 'group3', 'group4', 'group5', 'group6'];
let total = 0, success = 0;

groups.forEach(g => {
  const summary = JSON.parse(fs.readFileSync(\`outputs/parallel-simulations/\${g}/group_summary.json\`, 'utf-8'));
  total += summary.totalPersonas;
  success += summary.completedSimulations;
});

console.log(\`✅ 성공: \${success}/\${total} (\${(success/total*100).toFixed(1)}%)\`);
"

# 평균 만족도 확인
cd workshop-pilot-system
node -e "
const fs = require('fs');
const groups = ['group1', 'group2', 'group3', 'group4', 'group5', 'group6'];
let satisfactions = [];

groups.forEach(g => {
  const summary = JSON.parse(fs.readFileSync(\`outputs/parallel-simulations/\${g}/group_summary.json\`, 'utf-8'));
  satisfactions.push(summary.averageSatisfaction);
});

const avg = satisfactions.reduce((a,b) => a+b, 0) / satisfactions.length;
console.log(\`😊 평균 만족도: \${avg.toFixed(1)}/10\`);
"
```

---

## 문제 해결

### ❌ API 키 에러
```bash
Error: ANTHROPIC_API_KEY not found
```
**해결방법**:
```bash
# .env 파일 확인
cat backend/.env | grep ANTHROPIC_API_KEY

# 환경변수 직접 설정
export ANTHROPIC_API_KEY="your-api-key-here"
```

### ❌ 타임아웃 에러
```bash
Error: Request timeout
```
**해결방법**:
- API 호출 간격을 늘림 (run-group-simulation.ts 수정)
- 페르소나 수를 줄여서 재실행
- 네트워크 연결 확인

### ❌ 부분 완료 후 중단
```bash
# 예: Group 1-3만 완료, 4-6 미완료
```
**해결방법**:
```bash
# 미완료 그룹만 재실행
cd workshop-pilot-system

# Group 4 재실행
npx ts-node --project tsconfig.json -e "
import { runGroupSimulation } from './group-simulations/run-group-simulation';
import { PERSONA_GROUPS } from './run-parallel-pilot';

const group4 = PERSONA_GROUPS[3];
runGroupSimulation(group4.id, group4.name, group4.personas);
"
```

### ❌ JSON 파싱 에러
```bash
SyntaxError: Unexpected token in JSON
```
**해결방법**:
- Claude 응답이 JSON 형식이 아닐 수 있음
- run-group-simulation.ts의 JSON 파싱 로직 확인
- 해당 페르소나만 재실행

---

## 💡 팁 및 권장사항

### 1. 단계적 실행
```bash
# Step 1: 테스트 (5명)
npm run pilot:test

# Step 2: 검증 후 일부 그룹 (15명)
# (Group 1, 2, 3만 실행)

# Step 3: 전체 실행 (30명)
npm run pilot:parallel
```

### 2. 비용 절감
- 테스트 시 Haiku 모델 사용 (현재 설정됨)
- 캐싱 활용 (동일한 프롬프트 재사용)
- 필요한 그룹만 선택적 실행

### 3. 결과 백업
```bash
# 실행 전 항상 백업
DATE=$(date +%Y%m%d-%H%M)
cp -r workshop-pilot-system/outputs workshop-pilot-system/outputs-backup-$DATE
```

### 4. 로그 저장
```bash
# 실행 로그 파일로 저장
npm run pilot:parallel 2>&1 | tee simulation-log-$(date +%Y%m%d-%H%M).txt
```

---

## 📞 도움이 필요하신가요?

- 📖 README: `workshop-pilot-system/README.md`
- 🐛 이슈 리포트: GitHub Issues
- 💬 문의: 프로젝트 관리자에게 연락

---

**마지막 업데이트**: 2025-11-23
**버전**: 1.0.0
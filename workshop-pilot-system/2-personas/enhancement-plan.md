# 페르소나 품질 향상 계획서

## 🎯 목표
30명 모든 페르소나를 P001 수준의 고품질로 향상

## 📊 현재 vs 목표 수준 비교

### 현재 수준 (personas-v3.ts)
- ✅ 기본 정보와 구조는 완성
- ⚠️ 심리적 깊이 부족
- ⚠️ 구체적인 상황 예시 부족
- ⚠️ 숨겨진 고민과 동기 미포함

### 목표 수준 (P001 예시)
- ✅ 신임 팀장의 **현실적 고민** 4-5개
- ✅ **팀 내부 역학관계** 상세 묘사
- ✅ **실제 업무 상황** 구체적 예시
- ✅ **숨겨진 심리** (동기, 우려, 성공기준)
- ✅ **스트레스/자신감** 수준 명시

## 🔧 추가해야 할 필드

### 1. leaderProfile 확장
```typescript
biggestChallenge: string;        // 가장 큰 어려움
hiddenStruggles: string[];       // 겉으로 드러내지 못하는 어려움들 (4-5개)
```

### 2. team 확장
```typescript
teamDynamics: string;             // 팀 내부 역학관계
resistanceFactors: string[];     // 변화 저항 요인들 (4개)
```

### 3. work 확장
```typescript
realTimeExample: string;          // 실제 업무 상황 예시
typicalFireDrills: string[];     // 자주 발생하는 긴급 상황들 (4개)
```

### 4. expectedBehavior → workshopPsychology 전환
```typescript
workshopPsychology: {
  initialAttitude: string;
  hiddenMotivations: string[];    // 숨은 참여 동기 (4개)
  deepConcerns: string[];         // 깊은 우려사항들 (4개)
  successMetrics: string[];       // 성공 기준 (4개)
  dropoutRisk: number;
  dropoutTriggers: string[];      // 중도 포기 유발 요인 (4개)
}
```

### 5. personality 확장
```typescript
stressLevel: number;              // 1-10, 현재 스트레스 수준
confidenceLevel: number;          // 1-10, 팀장으로서 자신감
```

## 📝 실행 단계

### Phase 1: 데이터 준비 (30분)
1. 부서별 특성 데이터베이스 구축
   - 각 부서의 전형적인 고민
   - 신임 팀장의 공통 어려움
   - 팀 역학관계 패턴

### Phase 2: 자동화 스크립트 개발 (1시간)
1. 기존 데이터 마이그레이션
2. 새 필드 자동 생성
3. 부서별 맞춤형 콘텐츠 적용

### Phase 3: 실행 및 검증 (30분)
1. 30명 일괄 처리
2. 품질 검증
3. 미세 조정

## 💡 부서별 특화 콘텐츠 예시

### Sales 팀장의 전형적 고민
- "실적 압박과 팀원 케어 사이에서 균형 못 찾겠다"
- "시니어 영업사원이 자기 고객만 챙기고 팀 협업 안 한다"
- "신입이 3개월 만에 그만둔다고 하는데 붙잡을 명분이 없다"

### R&D 팀장의 전형적 고민
- "기술적으로는 뛰어난데 커뮤니케이션이 안 되는 시니어"
- "프로젝트 일정은 촉박한데 품질도 포기할 수 없는 딜레마"
- "경영진은 빠른 결과를 원하는데 연구는 시간이 필요"

### HR 팀장의 전형적 고민
- "전사 정책 만들면 현업에서 '현실 모른다'는 반응"
- "좋은 인재 채용하고 싶은데 연봉 테이블에 막힘"
- "세대 차이로 인한 조직문화 갈등 중재가 어려움"

## 🚀 기대 효과
- 30명 모두 **현실감 있는** 페르소나
- AI 시뮬레이션 시 **더 정확한** 반응
- 워크샵 설계 시 **실질적인** 인사이트
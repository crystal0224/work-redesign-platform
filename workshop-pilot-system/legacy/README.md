# Legacy 시뮬레이션 파일

이 폴더에는 구버전 시뮬레이션 시스템이 보관되어 있습니다.

## ⚠️ 주의

**이 폴더의 파일들은 더 이상 사용되지 않습니다.**
최신 버전을 사용하세요: `npm run pilot:real` 또는 `npm run pilot:real:full`

---

## 📁 폴더 내용

### 구버전 시뮬레이션
- `run-pilot.ts` - 기본 11단계 시뮬레이션
- `run-parallel-pilot.ts` - 6그룹 병렬 시뮬레이션
- `run-pilot-with-ui-extraction.ts` - UI 추출 + 시뮬레이션
- `test-single-group.ts` - 단일 그룹 테스트

### 구버전 모듈
- `3-simulation/` - 구버전 시뮬레이션 로직
- `4-analysis/` - 구버전 분석 로직
- `group-simulations/` - 그룹별 실행 스크립트

### 구버전 페르소나
- `personas-v1.ts` - 기본 페르소나 (v1)

### 구버전 보고서
- `generate-report.ts` - 영문 보고서
- `generate-korean-report.ts` - 한글 보고서 (구버전)

---

## 🆕 최신 버전 사용법

```bash
# 5명 샘플 파일럿
npm run pilot:real

# 30명 전체 파일럿 (병렬)
npm run pilot:real:full

# UI/UX 분석 보고서
npm run pilot:report:uiux
```

---

## 🔄 마이그레이션 노트

### v1 → v3 주요 변경사항

**Personas:**
- v1: 기본 정보 (이름, 부서, 성숙도, 팀 규모)
- v3: 팀장 교육 시나리오 (리더십 스타일, 업무 구조화, 팀 pain points)

**시뮬레이션:**
- v1: 11단계 한번에 진행, 단순 평가
- v3: 사전인터뷰 → 실행+관찰 → 중간체크인 → 사후인터뷰 → 퍼실리테이터 분석

**보고서:**
- v1: 단순 통계 + 평가 점수
- v3: UI/UX 이슈 통합 + 막힘 지점 + 세그먼트 분석 + 개선 우선순위

---

보관 날짜: 2025-11-24

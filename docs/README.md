# Documentation

프로젝트 문서 모음

## 폴더 구조

### [1-persona-integration/](1-persona-integration/)
**페르소나 데이터 통합 가이드**

- `PERSONA_INTEGRATION_GUIDE.md` - 완벽한 통합 가이드 (메인)
- `PERSONA_SYNC_QUICKSTART.md` - 5분 빠른 시작

**용도**: 페르소나 데이터/이미지 수정 시 참조

```bash
./scripts/sync-personas.sh  # 데이터 동기화
./scripts/sync-images.sh    # 이미지 동기화
```

---

### [2-deployment/](2-deployment/)
**배포 및 인프라 가이드**

- `DEPLOYMENT_GUIDE.md` - 배포 가이드
- `PRODUCTION_DEPLOYMENT_PLAN.md` - 프로덕션 배포 계획
- `EXECUTIVE_SUMMARY.md` - 임원 요약
- 기타 배포 체크리스트 및 절차

**용도**: 프로덕션 배포 시 참조

---

### [3-workshop-demo/](3-workshop-demo/)
**워크샵 및 데모 가이드**

- `WORKSHOP_USER_FLOW_COMPLETE.md` - 워크샵 사용자 플로우
- `DEMO_GUIDE.md` - 데모 가이드
- `DEMO.md` - 데모 개요

**용도**: 워크샵 진행 및 데모 시연 시 참조

---

### [4-testing/](4-testing/)
**테스팅 전략 및 가이드**

- `TESTING.md` - 테스팅 가이드
- `testing-strategy.md` - 테스팅 전략

**용도**: QA 및 테스트 작성 시 참조

---

### [archive/](archive/)
**오래된 문서 보관** (참고용)

- `deduplication/` - 중복 제거 작업 문서
- `todo.md` - 오래된 할일 목록

---

## 파일럿 테스팅 시스템

**별도 폴더**: [../workshop-pilot-system/](../workshop-pilot-system/)

30명 Synthetic Users를 활용한 파일럿 테스팅 시스템

- `README.md` - 시스템 개요 및 사용법
- `2-personas/personas-v3.ts` - 30명 페르소나 정의
- `run-real-pilot.ts` - 5명 샘플 테스트
- `run-real-pilot-parallel.ts` - 30명 병렬 테스트

**실행**:
```bash
npm run pilot:real           # 5명 샘플
npm run pilot:real:full      # 30명 전체
npm run pilot:report:uiux    # UI/UX 분석
```

---

## 빠른 링크

### 일상 작업
| 작업 | 문서 |
|------|------|
| 페르소나 수정 | [1-persona-integration/PERSONA_SYNC_QUICKSTART.md](1-persona-integration/PERSONA_SYNC_QUICKSTART.md) |
| 배포 | [2-deployment/DEPLOYMENT_GUIDE.md](2-deployment/DEPLOYMENT_GUIDE.md) |
| 테스팅 | [4-testing/TESTING.md](4-testing/TESTING.md) |
| 파일럿 테스트 | [../workshop-pilot-system/README.md](../workshop-pilot-system/README.md) |

### 상세 참조
| 주제 | 문서 |
|------|------|
| 통합 가이드 | [1-persona-integration/PERSONA_INTEGRATION_GUIDE.md](1-persona-integration/PERSONA_INTEGRATION_GUIDE.md) |
| 워크샵 플로우 | [3-workshop-demo/WORKSHOP_USER_FLOW_COMPLETE.md](3-workshop-demo/WORKSHOP_USER_FLOW_COMPLETE.md) |
| 시스템 아키텍처 | [AGENT_SYSTEM_ARCHITECTURE.md](AGENT_SYSTEM_ARCHITECTURE.md) |

---

**마지막 업데이트**: 2025-12-10

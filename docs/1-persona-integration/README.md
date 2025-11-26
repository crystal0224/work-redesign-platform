# 페르소나 통합 문서

**최신 작업**: 2025-11-26
**상태**: ✅ 완료

## 📄 문서 목록

### ⭐ PERSONA_INTEGRATION_GUIDE.md
**완벽한 통합 가이드 - 메인 문서**

내용:
- 현재 구조 설명
- Single Source of Truth 개념
- 사용 방법 (데이터/이미지 동기화)
- 문제 해결 가이드
- 개발 워크플로우
- 데이터 구조 설명

**용도**: 일상적인 개발/유지보수

---

### ⚡ PERSONA_SYNC_QUICKSTART.md
**5분 빠른 시작**

내용:
- 페르소나 수정 3단계
- 이미지 업데이트 2단계
- 한 줄 명령어
- 간단한 문제 해결

**용도**: 처음 사용하거나 빠르게 참조

---

### 📋 INTEGRATION_PLAN.md
**통합 방안 비교**

내용:
- 방안 1: Single Source of Truth (symlink)
- 방안 2: Build-time Sync (선택됨 ⭐)
- 방안 3: NPM Workspace
- 장단점 비교

**용도**: 통합 결정 과정 이해

---

### ✅ INTEGRATION_COMPLETE.md
**완료 보고서**

내용:
- 통합 정보
- 생성된 파일 목록
- 검증 결과
- 통합 전후 비교

**용도**: 통합 작업 완료 확인

---

## 🚀 빠른 시작

```bash
# 페르소나 수정
code workshop-pilot-system/2-personas/personas-v3.ts
./scripts/sync-personas.sh

# 이미지 수정
./scripts/sync-images.sh
```

---

**통합 기준**: workshop-pilot-system/2-personas/personas-v3.ts
**통합 방식**: Build-time Sync (자동 동기화)

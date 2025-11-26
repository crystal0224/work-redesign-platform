# 페르소나 데이터 통합 계획

## 현재 상황

### 데이터 소스
```
work-redesign-platform/
├── workshop-pilot-system/
│   └── 2-personas/
│       └── personas-v3.ts          ← 원본 (3,667줄, 최신)
│
└── profilecard/
    └── src/data/
        └── personas.ts              ← 복사본 (3,618줄)
```

### 이미지 소스
```
work-redesign-platform/
├── profile/                         ← 원본 이미지? (001.jpg ~ 030.jpg)
│   ├── 001.jpg
│   ├── 002.jpg
│   └── ...
│
└── profilecard/
    └── public/images/personas/      ← 웹앱용 복사본
        ├── P001.jpg
        ├── P002.jpg
        └── ...
```

---

## 🎯 제안하는 통합 방안

### 방안 1: Single Source of Truth (권장 ⭐)

**구조**:
```
work-redesign-platform/
├── shared/                          ← 새로 생성
│   ├── personas/
│   │   ├── personas-v3.ts          ← 유일한 원본
│   │   └── personas.json           ← 자동 생성
│   └── images/
│       └── personas/
│           ├── P001.jpg
│           ├── P002.jpg
│           └── ...
│
├── workshop-pilot-system/
│   └── 2-personas/
│       └── index.ts → symlink to ../../shared/personas/personas-v3.ts
│
└── profilecard/
    ├── src/data/
    │   └── personas.ts → symlink to ../../../shared/personas/personas-v3.ts
    └── public/images/
        └── personas/ → symlink to ../../../shared/images/personas/
```

**장점**:
- ✅ 데이터 단일 소스 (중복 없음)
- ✅ 한 곳만 수정하면 모든 곳에 반영
- ✅ 버전 관리 용이

**단점**:
- ⚠️ symlink 설정 필요
- ⚠️ Git에서 symlink 처리 필요

---

### 방안 2: Build-time Sync

**구조**:
```
work-redesign-platform/
├── workshop-pilot-system/
│   └── 2-personas/
│       └── personas-v3.ts          ← 원본 (Master)
│
├── profilecard/
│   └── src/data/
│       └── personas.ts              ← 자동 복사됨
│
└── scripts/
    └── sync-personas.sh             ← 동기화 스크립트
```

**동기화 스크립트**:
```bash
#!/bin/bash
# workshop-pilot-system → profilecard 동기화

cp workshop-pilot-system/2-personas/personas-v3.ts \
   profilecard/src/data/personas.ts

echo "✅ Personas synced!"
```

**장점**:
- ✅ 간단한 구조
- ✅ symlink 불필요

**단점**:
- ⚠️ 수동 동기화 필요
- ⚠️ 동기화 잊어버릴 위험

---

### 방안 3: NPM Workspace (고급)

**구조**:
```
work-redesign-platform/
├── package.json                     ← Workspace 루트
├── packages/
│   ├── personas-data/               ← NPM 패키지
│   │   ├── package.json
│   │   ├── src/
│   │   │   └── personas-v3.ts
│   │   └── images/
│   │       └── personas/
│   │
│   ├── workshop-pilot-system/       ← 의존성: @work/personas-data
│   └── profilecard/                 ← 의존성: @work/personas-data
```

**장점**:
- ✅ 전문적인 모노레포 구조
- ✅ 타입 안정성
- ✅ 버전 관리 강력함

**단점**:
- ⚠️ 복잡한 설정
- ⚠️ 빌드 시스템 재구성 필요

---

## 📸 이미지 관리

### 현재 이미지 위치 정리

1. **원본 이미지 확인**:
   ```bash
   ls -lh /Users/crystal/Desktop/work-redesign-platform/profile/
   ```
   → 001.jpg ~ 030.jpg (Git에서 untracked)

2. **profilecard 이미지**:
   ```bash
   ls -lh /Users/crystal/Desktop/work-redesign-platform/profilecard/public/images/personas/
   ```
   → P001.jpg ~ P030.jpg

### 이미지 명명 규칙 통일

**현재**:
- `/profile/`: 001.jpg, 002.jpg, ... (번호 앞에 0)
- `/profilecard/public/images/personas/`: P001.jpg, P002.jpg, ... (P 접두사)

**제안**:
- **표준 형식**: `P001.jpg` ~ `P030.jpg`
- **경로**: `shared/images/personas/P001.jpg`

---

## 🚀 실행 계획

### Phase 1: 즉시 실행 (권장)

**방안 2 (Build-time Sync) 적용**:

1. **동기화 스크립트 생성**:
   ```bash
   scripts/sync-personas.sh
   ```

2. **현재 상태 확인**:
   - workshop-pilot-system/personas-v3.ts가 최신인지 확인
   - profilecard/personas.ts와 비교

3. **동기화 실행**:
   ```bash
   ./scripts/sync-personas.sh
   ```

4. **package.json 스크립트 추가**:
   ```json
   {
     "scripts": {
       "sync": "bash scripts/sync-personas.sh",
       "presync": "echo '🔄 Syncing personas...'"
     }
   }
   ```

5. **이미지 정리**:
   - `/profile/` 이미지를 `/profilecard/public/images/personas/`로 복사
   - 명명 규칙 통일 (P001.jpg)

### Phase 2: 중장기 (선택)

**방안 1 (Symlink) 또는 방안 3 (NPM Workspace)로 전환**

---

## 📋 체크리스트

### 즉시 필요한 작업

- [ ] workshop-pilot-system/personas-v3.ts가 최신 버전인지 확인
- [ ] profilecard/personas.ts와 차이점 비교
- [ ] 동기화 스크립트 작성
- [ ] 이미지 파일 명명 규칙 통일
- [ ] 이미지 원본 위치 결정 (profile/ vs profilecard/)
- [ ] Git ignore 설정 (.gitignore에 중복 파일 제외)
- [ ] README 업데이트 (데이터 관리 방법 문서화)

### 선택 작업

- [ ] Symlink 방식으로 전환
- [ ] NPM Workspace 설정
- [ ] 자동 동기화 CI/CD 설정

---

## 🎯 권장 사항

**즉시**: 방안 2 (Build-time Sync) 적용
- 가장 간단하고 즉시 실행 가능
- 리스크 낮음

**향후**: 필요시 방안 1 (Symlink)로 전환
- 프로젝트가 성숙해지면 고려

---

**다음 단계**: 동기화 스크립트를 생성하시겠습니까?

# 페르소나 데이터 통합 가이드

## 📋 목차
- [개요](#개요)
- [현재 구조](#현재-구조)
- [통합 원칙](#통합-원칙)
- [사용 방법](#사용-방법)
- [문제 해결](#문제-해결)
- [개발 워크플로우](#개발-워크플로우)

---

## 개요

### 목적
30명의 신임 팀장 페르소나 데이터를 **단일 소스(Single Source of Truth)**로 관리하여 데이터 불일치를 방지합니다.

### 통합 완료 일시
**2025-11-26** - personas-v3.ts 기준으로 통합 완료 ✅

---

## 현재 구조

### 📁 디렉토리 구조

```
work-redesign-platform/
│
├── workshop-pilot-system/          # 워크샵 시뮬레이션 시스템
│   └── 2-personas/
│       └── personas-v3.ts          ⭐ 원본 (MASTER)
│
├── profilecard/                    # 페르소나 프로필 카드 웹앱
│   ├── src/data/
│   │   └── personas.ts             ← 동기화됨 (복사본)
│   └── public/images/personas/
│       ├── P001.jpg
│       ├── P002.jpg
│       └── ... (P030.jpg까지)
│
├── profile/                        # 원본 이미지 저장소
│   ├── 001.jpg
│   ├── 002.jpg
│   └── ... (030.jpg까지)
│
└── scripts/                        # 동기화 스크립트
    ├── sync-personas.sh            # 데이터 동기화
    └── sync-images.sh              # 이미지 동기화
```

---

## 통합 원칙

### 🎯 Single Source of Truth

**원본 (절대 직접 수정 금지)**
```
workshop-pilot-system/2-personas/personas-v3.ts
```

이 파일이 **유일한 원본**입니다. 모든 페르소나 데이터 수정은 이 파일에서만 이루어집니다.

### 🔄 자동 동기화

**동기화 대상**
```
profilecard/src/data/personas.ts  ← 자동 동기화됨
```

이 파일은 **절대 직접 수정하지 마세요**. 항상 `sync-personas.sh` 스크립트로 동기화합니다.

---

## 사용 방법

### 1️⃣ 페르소나 데이터 수정

#### 수정해야 할 파일
```bash
workshop-pilot-system/2-personas/personas-v3.ts
```

#### 수정 후 동기화
```bash
cd /Users/crystal/Desktop/work-redesign-platform
./scripts/sync-personas.sh
```

스크립트가 자동으로:
- ✅ 백업 생성
- ✅ profilecard로 복사
- ✅ 검증

---

### 2️⃣ 이미지 동기화

#### 이미지 추가/수정
```bash
# 1. profile/ 디렉토리에 이미지 추가
profile/001.jpg ~ 030.jpg

# 2. 동기화 실행
./scripts/sync-images.sh
```

스크립트가 자동으로:
- ✅ `001.jpg` → `P001.jpg` 형식 변환
- ✅ `profilecard/public/images/personas/`로 복사
- ✅ 30개 이미지 검증

---

### 3️⃣ 수동 동기화 (권장하지 않음)

**긴급 상황에만 사용:**
```bash
# 데이터 동기화
cp workshop-pilot-system/2-personas/personas-v3.ts \
   profilecard/src/data/personas.ts

# 이미지 동기화 (예: P001)
cp profile/001.jpg \
   profilecard/public/images/personas/P001.jpg
```

⚠️ **주의**: 가능하면 스크립트를 사용하세요!

---

## 문제 해결

### ❌ "Files differ" 오류

**증상**
```bash
❌ Files differ
```

**원인**: profilecard/personas.ts를 직접 수정했거나 동기화가 안 됨

**해결**:
```bash
# 1. 백업 확인
ls -lh profilecard/src/data/personas.ts.backup-*

# 2. 강제 동기화
cp workshop-pilot-system/2-personas/personas-v3.ts \
   profilecard/src/data/personas.ts

# 3. 검증
diff -q workshop-pilot-system/2-personas/personas-v3.ts \
        profilecard/src/data/personas.ts
```

---

### ❌ 이미지가 안 보임

**증상**: profilecard에서 페르소나 사진이 깨짐

**원인**: 이미지 파일명 불일치 또는 누락

**해결**:
```bash
# 1. 이미지 개수 확인
ls -1 profilecard/public/images/personas/P*.jpg | wc -l
# 예상: 30

# 2. 누락된 이미지 확인
for i in {1..30}; do
  FILE="profilecard/public/images/personas/P$(printf %03d $i).jpg"
  [ -f "$FILE" ] || echo "Missing: P$(printf %03d $i).jpg"
done

# 3. 이미지 재동기화
./scripts/sync-images.sh
```

---

### ❌ 백업 파일이 너무 많음

**증상**:
```bash
personas.ts.backup-20251126-080900
personas.ts.backup-20251126-081500
personas.ts.backup-20251126-082100
...
```

**해결**:
```bash
# 오래된 백업 삭제 (7일 이상)
find profilecard/src/data/ -name "personas.ts.backup-*" -mtime +7 -delete

# 또는 수동 삭제
rm profilecard/src/data/personas.ts.backup-20251125-*
```

---

## 개발 워크플로우

### 📝 페르소나 수정 시

```bash
# 1. personas-v3.ts 수정
code workshop-pilot-system/2-personas/personas-v3.ts

# 2. 동기화
./scripts/sync-personas.sh

# 3. profilecard에서 확인
cd profilecard
npm run dev

# 4. 문제 없으면 커밋
git add workshop-pilot-system/2-personas/personas-v3.ts
git add profilecard/src/data/personas.ts
git commit -m "feat(personas): Update persona data"
```

---

### 🖼️ 이미지 추가 시

```bash
# 1. profile/에 이미지 추가
# 파일명: 001.jpg ~ 030.jpg

# 2. 동기화
./scripts/sync-images.sh

# 3. profilecard에서 확인
cd profilecard
npm run dev

# 4. 문제 없으면 커밋
git add profilecard/public/images/personas/
git commit -m "feat(images): Add persona photos"
```

---

### 🚀 배포 전 체크리스트

- [ ] personas-v3.ts가 최신인가?
- [ ] profilecard/personas.ts와 동기화되었는가?
- [ ] 30개 이미지가 모두 있는가? (P001.jpg ~ P030.jpg)
- [ ] profilecard에서 모든 페르소나가 정상 표시되는가?
- [ ] workshop-pilot-system 시뮬레이션이 정상 작동하는가?

**검증 명령**:
```bash
# 데이터 동기화 확인
diff -q workshop-pilot-system/2-personas/personas-v3.ts \
        profilecard/src/data/personas.ts

# 이미지 개수 확인
ls -1 profilecard/public/images/personas/P*.jpg | wc -l
# 예상 출력: 30

# 페르소나 개수 확인
grep -c "id: 'P0" workshop-pilot-system/2-personas/personas-v3.ts
# 예상 출력: 30
```

---

## 스크립트 상세

### sync-personas.sh

**위치**: `scripts/sync-personas.sh`

**기능**:
- ✅ 원본 파일 존재 확인
- ✅ 자동 백업 생성
- ✅ 파일 복사
- ✅ 동기화 검증
- ✅ 페르소나 개수 카운트

**실행**:
```bash
./scripts/sync-personas.sh
```

**출력 예시**:
```
════════════════════════════════════════
  Persona Data Synchronization
════════════════════════════════════════

📄 Source (Master):
   File: workshop-pilot-system/2-personas/personas-v3.ts
   Size: 295K, Modified: Nov 25 21:50

📄 Target (will be replaced):
   File: profilecard/src/data/personas.ts
   Size: 262K, Modified: Nov 26 08:09

💾 Creating backup...
   Backup: personas.ts.backup-20251126-090530

Proceed with sync? [y/N]: y

🔄 Syncing...
✅ Sync completed successfully!

📊 Result:
   Size: 295K, Modified: Nov 26 09:05
   Total personas: 30

════════════════════════════════════════
  Sync Complete!
════════════════════════════════════════
```

---

### sync-images.sh

**위치**: `scripts/sync-images.sh`

**기능**:
- ✅ 이미지 개수 확인
- ✅ 파일명 변환 (001.jpg → P001.jpg)
- ✅ 일괄 복사
- ✅ 동기화 검증

**실행**:
```bash
./scripts/sync-images.sh
```

**출력 예시**:
```
════════════════════════════════════════
  Persona Images Synchronization
════════════════════════════════════════

📸 Source Images:
   Directory: profile/
   Format: 001.jpg ~ 030.jpg
   Count: 30 images

📸 Target Images:
   Directory: profilecard/public/images/personas/
   Format: P001.jpg ~ P030.jpg
   Current count: 30 images

Proceed with image sync? [y/N]: y

🔄 Syncing images...

   ✓ 001.jpg → P001.jpg
   ✓ 002.jpg → P002.jpg
   ...
   ✓ 030.jpg → P030.jpg

════════════════════════════════════════
  Sync Complete!
════════════════════════════════════════

📊 Summary:
   Synced: 30
   Total images in profilecard: 30
```

---

## 데이터 구조

### 페르소나 인터페이스

```typescript
interface Persona {
  // 기본 정보
  id: string;                    // P001 ~ P030
  name: string;                  // 이름
  age: number;                   // 나이 (35-43세)
  company: string;               // 회사
  department: string;            // 부서
  role: string;                  // 역할 (팀장)
  category: string;              // 카테고리 (IT, HR, Finance 등)

  // 리더십 프로필
  leaderProfile: {
    yearsInRole: number;         // 팀장 경력 (0.5-1.5년)
    previousRole: string;        // 이전 역할
    promotionReason: string;     // 승진 이유
    leadershipStyle: string;     // 리더십 스타일
    biggestChallenge: string;    // 가장 큰 도전
    hiddenStruggles: string[];   // 숨겨진 고충
  };

  // 팀 구성
  team: {
    size: number;                // 팀 크기
    digitalMaturity: string;     // 디지털 성숙도
    // ... 기타
  };

  // 업무
  work: {
    painPoints: string[];        // 어려움 (4-5문장, P001 기준)
    dailyWorkflow: string;       // 일일 업무
    weeklyRoutine: string;       // 주간 루틴
    // ... 기타
  };

  // 성격
  personality: {
    patience: number;            // 인내심 (1-10)
    techSavvy: number;           // 기술 친화도 (1-10)
    stressLevel: number;         // 스트레스 (1-10)
    confidenceLevel: number;     // 자신감 (1-10)
    // ... 기타
  };
}
```

---

## 이미지 규격

### 파일명 규칙

**원본 (profile/)**:
```
001.jpg, 002.jpg, 003.jpg, ..., 030.jpg
```

**웹앱 (profilecard/)**:
```
P001.jpg, P002.jpg, P003.jpg, ..., P030.jpg
```

### 사양
- **형식**: JPG
- **비율**: 3:4 (ID 카드용)
- **크기**: 약 100-150KB per image
- **해상도**: 최소 800x1067px 권장

---

## Git 관리

### .gitignore 설정

```gitignore
# 백업 파일 제외
*.backup-*

# 임시 이미지 제외 (선택)
profile/*.jpg
```

### 커밋 시 포함할 파일

**필수**:
- `workshop-pilot-system/2-personas/personas-v3.ts`
- `profilecard/src/data/personas.ts`
- `profilecard/public/images/personas/*.jpg`

**제외**:
- `*.backup-*` (백업 파일)
- `profile/*.jpg` (원본 이미지는 선택)

---

## 자주 묻는 질문

### Q1: profilecard/personas.ts를 직접 수정해도 되나요?

**A**: ❌ **절대 안 됩니다!**

항상 `workshop-pilot-system/2-personas/personas-v3.ts`를 수정하고 동기화하세요.

---

### Q2: 새 페르소나를 추가하려면?

**A**:
1. `personas-v3.ts`에 P031 추가
2. `profile/031.jpg` 이미지 추가
3. 동기화 실행:
   ```bash
   ./scripts/sync-personas.sh
   ./scripts/sync-images.sh
   ```

---

### Q3: 이미지만 변경하려면?

**A**:
```bash
# 1. profile/001.jpg 교체
# 2. 이미지 동기화
./scripts/sync-images.sh
```

---

### Q4: 특정 페르소나만 동기화할 수 있나요?

**A**: 스크립트는 전체 동기화만 지원합니다.

개별 동기화가 필요하면:
```bash
# 데이터는 전체만 가능
cp workshop-pilot-system/2-personas/personas-v3.ts \
   profilecard/src/data/personas.ts

# 이미지는 개별 가능
cp profile/001.jpg profilecard/public/images/personas/P001.jpg
```

---

## 연락처 및 지원

문제가 발생하면:
1. 이 문서의 [문제 해결](#문제-해결) 섹션 확인
2. 백업 파일 확인
3. 스크립트 재실행

---

**마지막 업데이트**: 2025-11-26
**통합 버전**: v1.0
**통합 기준**: workshop-pilot-system/2-personas/personas-v3.ts (2025-11-25 21:50)

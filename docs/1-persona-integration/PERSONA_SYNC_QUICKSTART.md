# 페르소나 동기화 빠른 시작 가이드

## 🎯 5분 안에 시작하기

### Step 1: 페르소나 데이터 수정

```bash
# 원본 파일 열기
code workshop-pilot-system/2-personas/personas-v3.ts
```

**중요**: 이 파일이 **유일한 원본**입니다!

---

### Step 2: 동기화 실행

```bash
# 데이터 동기화
./scripts/sync-personas.sh
```

**출력 예시**:
```
✅ Sync completed successfully!
📊 Result:
   Total personas: 30
```

---

### Step 3: 확인

```bash
# profilecard에서 확인
cd profilecard
npm run dev
# 브라우저: http://localhost:5173
```

---

## 📸 이미지 업데이트

### Step 1: 이미지 추가/교체

```bash
# profile/ 디렉토리에 이미지 배치
# 파일명: 001.jpg ~ 030.jpg
```

### Step 2: 동기화

```bash
./scripts/sync-images.sh
```

**출력 예시**:
```
✓ 001.jpg → P001.jpg
✓ 002.jpg → P002.jpg
...
✅ Synced: 30
```

---

## ⚡ 한 줄 명령어

### 데이터만 동기화
```bash
./scripts/sync-personas.sh
```

### 이미지만 동기화
```bash
./scripts/sync-images.sh
```

### 둘 다 동기화
```bash
./scripts/sync-personas.sh && ./scripts/sync-images.sh
```

---

## 🚨 문제 해결

### "Files differ" 오류

```bash
# 강제 동기화
cp workshop-pilot-system/2-personas/personas-v3.ts \
   profilecard/src/data/personas.ts
```

### 이미지가 안 보임

```bash
# 이미지 개수 확인
ls -1 profilecard/public/images/personas/P*.jpg | wc -l
# 출력: 30

# 재동기화
./scripts/sync-images.sh
```

---

## 📚 상세 문서

더 자세한 정보는 [PERSONA_INTEGRATION_GUIDE.md](PERSONA_INTEGRATION_GUIDE.md)를 참조하세요.

---

**통합 완료일**: 2025-11-26
**통합 기준**: personas-v3.ts

# 페르소나 이미지 생성기

30명의 신임 팀장 페르소나 프로필 사진을 자동 생성합니다.

## 준비사항

### 1. Gemini API 키 발급
1. [Google AI Studio](https://aistudio.google.com/app/apikey) 접속
2. "Create API Key" 클릭
3. API 키 복사 (안전하게 보관)

**무료 티어 제한**: 하루 10-30개 이미지

## 사용 방법

### 옵션 1: 안전한 스크립트 사용 (권장)

```bash
cd /Users/crystal/Desktop/work-redesign-platform/workshop-pilot-system/image-generator
./generate-images.sh
```

스크립트가 다음을 자동으로 처리합니다:
- ✅ API 키를 안전하게 입력받음 (화면에 표시 안 됨)
- ✅ 생성 모드 선택 (테스트 3명 / 배치 10명 / 전체 30명)
- ✅ 생성 후 API 키 자동 삭제

### 옵션 2: 직접 Python 실행

```bash
cd /Users/crystal/Desktop/work-redesign-platform/workshop-pilot-system/image-generator

# 테스트 (3명)
python3 gemini_api.py \
  --api-key YOUR_API_KEY \
  --personas personas-test.json \
  --output-dir generated_photos/test \
  --workers 2

# 전체 (30명)
python3 gemini_api.py \
  --api-key YOUR_API_KEY \
  --personas ../2-personas/personas.json \
  --output-dir generated_photos/full \
  --workers 3
```

## 생성 전략

### 무료 티어 (하루 10-30개)

**권장 방법**: 3일에 걸쳐 10명씩

```bash
# Day 1: P001-P010 (10명)
./generate-images.sh
→ 선택: 2. Batch 1

# Day 2: P011-P020 (10명)
./generate-images.sh
→ 선택: 3. Batch 2

# Day 3: P021-P030 (10명)
./generate-images.sh
→ 선택: 4. Batch 3
```

### 유료 티어
제한 없이 한 번에 30명 생성 가능:
```bash
./generate-images.sh
→ 선택: 5. Full (all 30 personas)
```

## 생성되는 이미지 사양

- **해상도**: 4K (Nano Banana Pro)
- **비율**: 3:4 (ID 카드, 프로필용)
- **형식**: PNG
- **크기**: 약 2-4MB per image
- **스타일**: 전문적인 기업 증명사진

## 자동 추론 기능

스크립트가 personas-v3.ts에서 자동으로 외모를 추론합니다:

```typescript
// 입력 데이터
{
  name: '김지훈',
  age: 37,
  personality: {
    techSavvy: 10,      // → 안경 착용
    stressLevel: 8,     // → 피로한 표정
    confidenceLevel: 7, // → 자신감 있는 자세
    patience: 9         // → 부드러운 미소
  }
}

// 자동 생성
→ "Short modern professional hair"
→ "Behind thin-framed glasses"
→ "Confident with balanced authority"
→ "Showing determination under pressure"
→ "Warm and approachable smile"
```

## 출력 디렉토리 구조

```
generated_photos/
├── test/                    # 테스트 (3명)
│   ├── 김지훈.png
│   ├── 박서연.png
│   └── 이현수.png
├── batch1/                  # P001-P010
├── batch2/                  # P011-P020
├── batch3/                  # P021-P030
└── full/                    # 전체 30명
```

## 문제 해결

### API 키 오류
```
Error: Invalid API key
```
→ API 키를 다시 확인하고 재입력하세요.

### Rate Limit 오류
```
Error 429: Resource exhausted
```
→ 무료 티어 일일 제한 초과. 다음날 다시 시도하세요.

### Content Policy 오류
```
Error: Content policy violation
```
→ 프롬프트가 자동 생성되므로 이 오류는 거의 발생하지 않습니다.
→ 발생 시 해당 페르소나를 건너뛰고 계속 진행됩니다.

## 배치 처리 팁

1. **테스트 먼저**: 3명으로 먼저 테스트해서 품질 확인
2. **결과 검토**: 각 배치 후 이미지 품질 확인
3. **재생성**: 마음에 안 드는 이미지는 개별 재생성 가능

## 보안 주의사항

⚠️ **절대 하지 말 것**:
- API 키를 코드에 하드코딩
- API 키를 Git에 커밋
- API 키를 공유

✅ **권장사항**:
- `generate-images.sh` 스크립트 사용 (API 키 자동 삭제)
- API 키는 실행 시에만 입력
- 사용 후 터미널 히스토리 정리: `history -c`

## 다음 단계

생성된 이미지를 사용하여:
1. 워크샵 ID 카드 제작
2. 페르소나 프로필 카드 업데이트
3. 시뮬레이션 UI에 통합

---

**마지막 업데이트**: 2025-11-25
**Python 스크립트 버전**: gemini_api.py (Gemini 3 Pro Image Preview)

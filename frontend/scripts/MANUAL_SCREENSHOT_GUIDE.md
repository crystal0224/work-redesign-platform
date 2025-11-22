# 전체 페이지 스크린샷 캡처 가이드 (스크롤 포함)

Puppeteer와 브라우저 자동화 도구가 WebSocket 오류로 작동하지 않아, Chrome DevTools를 사용한 수동 캡처 방법을 안내드립니다.

## 방법 1: Chrome DevTools 명령어 (가장 간단)

### 단계별 가이드:

1. **워크샵 페이지 열기**
   - Chrome에서 `http://localhost:3000/workshop` 접속

2. **Step 1 스크린샷 캡처**
   - `Cmd + Shift + P` (Mac) 또는 `Ctrl + Shift + P` (Windows) 누르기
   - 명령어 팔레트가 열리면 "**Capture full size screenshot**" 입력
   - Enter 키 누르면 자동으로 전체 페이지 스크린샷 다운로드
   - 파일 이름을 `step_1_fullpage.png`로 변경

3. **다음 단계로 이동**
   - 우측 상단의 "⚡ 빠른 테스트" 버튼 클릭
   - 페이지가 Step 2로 전환될 때까지 2-3초 대기

4. **Step 2-11 반복**
   - 각 단계마다 위의 2-3번 과정 반복
   - 스크린샷 파일명: `step_2_fullpage.png`, `step_3_fullpage.png`, ..., `step_11_fullpage.png`

### 💡 팁:
- 명령어 팔레트에서 "full size" 또는 "capture full"만 입력해도 자동완성됨
- 스크린샷은 기본적으로 다운로드 폴더에 저장됨
- **중요**: "Capture screenshot"이 아니라 "Capture **full size** screenshot"을 선택해야 스크롤 포함됨

---

## 방법 2: Chrome DevTools Console (프로그래밍 방식)

더 자동화된 방법을 원하시면 Console에서 JavaScript로 실행할 수 있습니다:

### 단계:

1. Chrome에서 `http://localhost:3000/workshop` 접속
2. `F12` 또는 `Cmd + Option + I` (Mac) / `Ctrl + Shift + I` (Windows)로 DevTools 열기
3. **Console** 탭 선택
4. 아래 코드 복사 후 붙여넣기:

```javascript
// 전체 페이지 스크린샷 캡처 함수
async function captureAllSteps() {
  for (let step = 1; step <= 11; step++) {
    console.log(`📸 Capturing Step ${step}...`);
    
    // 2초 대기 (페이지 로드)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // DevTools Protocol로 전체 페이지 스크린샷 캡처
    // (이 방법은 Chrome DevTools가 열려있을 때만 작동)
    console.log(`Step ${step} 준비 완료 - 수동으로 Cmd+Shift+P → "Capture full size screenshot" 실행하세요`);
    
    // 다음 단계로 이동 (Step 11이 아닌 경우)
    if (step < 11) {
      const button = document.evaluate(
        "//button[contains(text(), '빠른 테스트')]",
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      ).singleNodeValue;
      
      if (button) {
        button.click();
        console.log(`✅ Clicked Quick Test button`);
        await new Promise(resolve => setTimeout(resolve, 2500));
      }
    }
  }
  console.log('✨ All steps ready for screenshot!');
}

// 실행
captureAllSteps();
```

5. Enter 키를 누르면 자동으로 11단계를 순회하며 각 단계에서 멈춤
6. 각 단계에서 `Cmd + Shift + P` → "Capture full size screenshot" 실행

---

## 방법 3: 브라우저 확장 프로그램

### 추천 확장 프로그램:
- **GoFullPage** - Full Page Screen Capture
- **Awesome Screenshot**
- **Fireshot**

### 사용법:
1. Chrome 웹 스토어에서 확장 프로그램 설치
2. 워크샵 페이지에서 확장 프로그램 아이콘 클릭
3. "Capture entire page" 또는 "Full page" 옵션 선택
4. 빠른 테스트 버튼 클릭 → 다음 단계 캡처 반복

---

## 예상 결과

캡처 완료 후 다음 파일들이 생성됩니다:

```
step_1_fullpage.png   (Step 1: 워크샵 시작)
step_2_fullpage.png   (Step 2: 미션 작성)
step_3_fullpage.png   (Step 3: 팀 상황 확인)
step_4_fullpage.png   (Step 4: 업무영역 정의)
step_5_fullpage.png   (Step 5: 업무 정보 입력)
step_6_fullpage.png   (Step 6: 업무 추출 결과)
step_7_fullpage.png   (Step 7: 워크샵 요약)
step_8_fullpage.png   (Step 8: AI 자동화 교육)
step_9_fullpage.png   (Step 9: AI 컨설팅)
step_10_fullpage.png  (Step 10: 워크플로우 설계)
step_11_fullpage.png  (Step 11: 결과 확인)
```

---

## 문제 해결

### Q: "Capture full size screenshot" 옵션이 안 보여요
**A**: Chrome을 최신 버전으로 업데이트하거나, 명령어 팔레트에서 "screenshot"만 입력해보세요.

### Q: 스크린샷이 잘려요
**A**: "Capture screenshot" 대신 "Capture **full size** screenshot"을 선택했는지 확인하세요.

### Q: 빠른 테스트 버튼이 안 보여요
**A**: 페이지 우측 상단의 주황색/빨간색 그라데이션 버튼입니다. "⚡ 빠른 테스트 (Step X)" 형태로 표시됩니다.

---

## 자동화 스크립트 재시도

Puppeteer 오류가 해결되면 다음 명령어로 자동 캡처 가능합니다:

```bash
cd frontend
node scripts/capture-screenshots.js
```

현재는 WebSocket 연결 오류로 실패하고 있습니다.

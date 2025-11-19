# 🚀 데모 실행 가이드

## 빠른 시작

단 한 번의 명령으로 전체 플랫폼을 실행할 수 있습니다:

```bash
./demo-start.sh
```

## 무엇이 자동으로 실행되나요?

- ✅ API 키 자동 확인
- ✅ 기존 프로세스 자동 종료
- ✅ Workshop Server 자동 시작 (포트 3001)
- ✅ Frontend 자동 시작 (포트 3000)

## 접속 주소

- 🌐 **메인**: http://localhost:3000
- 🔧 **API**: http://localhost:3001

## 종료하기

```bash
./demo-stop.sh
```

## 로그 확인

실시간 로그를 보려면:

```bash
# Workshop Server 로그
tail -f workshop-server.log

# Frontend 로그
tail -f frontend.log
```

## 문제 해결

### API 키 오류가 발생하는 경우
`.env` 파일을 열어 `ANTHROPIC_API_KEY`가 올바르게 설정되어 있는지 확인하세요.

### 포트 충돌이 발생하는 경우
스크립트가 자동으로 기존 프로세스를 종료하지만, 수동으로 종료하려면:
```bash
lsof -ti:3001 | xargs kill
lsof -ti:3000 | xargs kill
```

## 특징

- 🎯 **원클릭 실행**: 모든 것이 자동으로 설정됩니다
- 🔄 **자동 정리**: 기존 프로세스를 자동으로 종료합니다
- 📝 **로그 저장**: 모든 출력이 로그 파일에 저장됩니다
- ✨ **상태 확인**: 각 서비스의 시작 상태를 확인합니다

## 시연 팁

1. 스크립트를 실행하기 전에 `.env` 파일의 API 키를 확인하세요
2. 브라우저를 미리 열어두고 http://localhost:3000 을 북마크하세요
3. 문제가 발생하면 로그 파일을 확인하세요
4. 시연이 끝나면 `./demo-stop.sh`로 깔끔하게 종료하세요

Happy Demo! 🎉

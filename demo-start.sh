#!/bin/bash

# Work Redesign Platform - Demo Start Script
# 11시 시연용 간편 실행 스크립트

echo "🚀 Work Redesign Platform 시연 모드 시작..."
echo ""

# 색상 정의
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. 환경 변수 확인
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env 파일이 없습니다. .env.example을 복사합니다...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✅ .env 파일 생성 완료${NC}"
else
    echo -e "${GREEN}✅ .env 파일 확인됨${NC}"
fi

echo ""

# 2. ANTHROPIC_API_KEY 확인
if ! grep -q "ANTHROPIC_API_KEY=sk-" .env 2>/dev/null; then
    echo -e "${YELLOW}⚠️  ANTHROPIC_API_KEY가 설정되지 않았습니다!${NC}"
    echo "   .env 파일을 열어 API 키를 입력해주세요."
    echo ""
    echo "   필수 설정:"
    echo "   ANTHROPIC_API_KEY=sk-ant-xxxxx"
    echo ""
    read -p "API 키를 지금 입력하시겠습니까? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "API 키를 입력하세요: " api_key
        # .env 파일의 ANTHROPIC_API_KEY 업데이트
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s/ANTHROPIC_API_KEY=.*/ANTHROPIC_API_KEY=$api_key/" .env
        else
            # Linux
            sed -i "s/ANTHROPIC_API_KEY=.*/ANTHROPIC_API_KEY=$api_key/" .env
        fi
        echo -e "${GREEN}✅ API 키 설정 완료${NC}"
    else
        echo -e "${YELLOW}나중에 .env 파일을 직접 수정해주세요.${NC}"
    fi
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎯 시연 준비 완료!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "다음 2개 명령어를 각각 다른 터미널에서 실행하세요:"
echo ""
echo -e "${YELLOW}[터미널 1] Workshop Server (핵심 API):${NC}"
echo "  PORT=3001 node workshop-server.js"
echo ""
echo -e "${YELLOW}[터미널 2] Frontend:${NC}"
echo "  cd frontend && npm run dev"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📱 접속 주소:"
echo "  🌐 메인: http://localhost:3000"
echo "  🔧 API:  http://localhost:3001"
echo ""
echo -e "${GREEN}Happy Demo! 🚀${NC}"
echo ""

# 자동 실행 옵션
read -p "지금 바로 실행하시겠습니까? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${GREEN}🚀 서버 시작 중...${NC}"
    echo ""

    # Workshop server 백그라운드 실행
    echo -e "${YELLOW}[1/2] Workshop Server 시작...${NC}"
    PORT=3001 node workshop-server.js > workshop-server.log 2>&1 &
    WORKSHOP_PID=$!
    echo "  PID: $WORKSHOP_PID"
    echo "  로그: workshop-server.log"
    sleep 3

    # Frontend 백그라운드 실행
    echo -e "${YELLOW}[2/2] Frontend 시작...${NC}"
    cd frontend && npm run dev > ../frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo "  PID: $FRONTEND_PID"
    echo "  로그: frontend.log"

    echo ""
    echo -e "${GREEN}✅ 모든 서버가 시작되었습니다!${NC}"
    echo ""
    echo "종료하려면:"
    echo "  kill $WORKSHOP_PID $FRONTEND_PID"
    echo ""
    echo "또는:"
    echo "  ./demo-stop.sh"
    echo ""

    # PID 저장
    echo "$WORKSHOP_PID" > .demo.pids
    echo "$FRONTEND_PID" >> .demo.pids
else
    echo ""
    echo "수동으로 위 명령어들을 실행해주세요."
fi

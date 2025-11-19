#!/bin/bash

# Work Redesign Platform - Demo Start Script
# 11시 시연용 간편 실행 스크립트

echo "🚀 Work Redesign Platform 시연 모드 시작..."
echo ""

# 색상 정의
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 스크립트 디렉토리로 이동
cd "$(dirname "$0")"

# 1. 환경 변수 확인
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env 파일이 없습니다!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ .env 파일 확인됨${NC}"

# 2. ANTHROPIC_API_KEY 확인 (실제 값이 있는지 확인)
API_KEY=$(grep "^ANTHROPIC_API_KEY=" .env | cut -d '=' -f2)
if [ -z "$API_KEY" ] || [ "$API_KEY" = "your-anthropic-api-key" ]; then
    echo -e "${RED}❌ ANTHROPIC_API_KEY가 설정되지 않았습니다!${NC}"
    echo "   .env 파일에서 API 키를 확인해주세요."
    exit 1
fi

echo -e "${GREEN}✅ API 키 확인됨${NC}"
echo ""

# 3. 이미 실행 중인 프로세스 확인 및 종료
if [ -f .demo.pids ]; then
    echo -e "${YELLOW}⚠️  이미 실행 중인 프로세스를 종료합니다...${NC}"
    ./demo-stop.sh
    sleep 2
fi

# 포트 사용 중인지 확인 및 종료
if lsof -ti:3001 > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  포트 3001 사용 중인 프로세스 종료...${NC}"
    lsof -ti:3001 | xargs kill -9 2>/dev/null
    sleep 1
fi

if lsof -ti:3000 > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  포트 3000 사용 중인 프로세스 종료...${NC}"
    lsof -ti:3000 | xargs kill -9 2>/dev/null
    sleep 1
fi

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎯 시연 시작!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Workshop server 백그라운드 실행
echo -e "${YELLOW}[1/2] Workshop Server 시작 중...${NC}"
PORT=3001 node workshop-server.js > workshop-server.log 2>&1 &
WORKSHOP_PID=$!
echo "  PID: $WORKSHOP_PID"
echo "  로그: workshop-server.log"
sleep 3

# Workshop server 시작 확인
if ! ps -p $WORKSHOP_PID > /dev/null 2>&1; then
    echo -e "${RED}❌ Workshop Server 시작 실패!${NC}"
    echo "   로그를 확인하세요: tail -f workshop-server.log"
    exit 1
fi

echo -e "${GREEN}✅ Workshop Server 실행 중 (http://localhost:3001)${NC}"
echo ""

# Frontend 백그라운드 실행
echo -e "${YELLOW}[2/2] Frontend 시작 중...${NC}"
cd frontend && npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..
echo "  PID: $FRONTEND_PID"
echo "  로그: frontend.log"
sleep 5

# Frontend 시작 확인
if ! ps -p $FRONTEND_PID > /dev/null 2>&1; then
    echo -e "${RED}❌ Frontend 시작 실패!${NC}"
    echo "   로그를 확인하세요: tail -f frontend.log"
    echo "   Workshop Server 종료 중..."
    kill $WORKSHOP_PID 2>/dev/null
    exit 1
fi

echo -e "${GREEN}✅ Frontend 실행 중 (http://localhost:3000)${NC}"
echo ""

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ 모든 서버가 시작되었습니다!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📱 접속 주소:"
echo "  🌐 메인: http://localhost:3000"
echo "  🔧 API:  http://localhost:3001"
echo ""
echo "🛑 종료하려면:"
echo "  ./demo-stop.sh"
echo ""
echo -e "${GREEN}Happy Demo! 🚀${NC}"
echo ""

# PID 저장
echo "$WORKSHOP_PID" > .demo.pids
echo "$FRONTEND_PID" >> .demo.pids

# 로그 모니터링 옵션
echo "💡 팁: 로그를 실시간으로 보려면:"
echo "  tail -f workshop-server.log"
echo "  tail -f frontend.log"
echo ""

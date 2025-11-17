#!/bin/bash

# Work Redesign Platform - Demo Stop Script
# 시연 종료 스크립트

echo "🛑 Work Redesign Platform 시연 모드 종료..."
echo ""

# PID 파일 확인
if [ -f .demo.pids ]; then
    while IFS= read -r pid; do
        if ps -p $pid > /dev/null 2>&1; then
            echo "  종료: PID $pid"
            kill $pid
        fi
    done < .demo.pids
    rm .demo.pids
    echo ""
    echo "✅ 모든 서버가 종료되었습니다."
else
    echo "⚠️  실행 중인 프로세스를 찾을 수 없습니다."
    echo ""
    echo "수동으로 종료하려면:"
    echo "  lsof -ti:3001 | xargs kill"
    echo "  lsof -ti:3000 | xargs kill"
fi

echo ""

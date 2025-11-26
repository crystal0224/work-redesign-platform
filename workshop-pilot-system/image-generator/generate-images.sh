#!/bin/bash

# 페르소나 이미지 생성 스크립트 (API 키 안전 입력)

echo "🎨 Persona Photo Generator"
echo "=========================="
echo ""

# API 키 입력 (숨김 처리)
echo "Please enter your Gemini API key:"
read -s API_KEY
echo ""

if [ -z "$API_KEY" ]; then
    echo "❌ Error: API key is required"
    exit 1
fi

# 생성 모드 선택
echo "Select generation mode:"
echo "1. Test (3 personas: P001-P003)"
echo "2. Batch 1 (P001-P010)"
echo "3. Batch 2 (P011-P020)"
echo "4. Batch 3 (P021-P030)"
echo "5. Full (all 30 personas)"
echo ""
read -p "Enter choice (1-5): " CHOICE

case $CHOICE in
    1)
        PERSONAS_FILE="personas-test.json"
        OUTPUT_DIR="generated_photos/test"
        WORKERS=2
        echo "📊 Mode: Test (3 personas)"
        ;;
    2)
        PERSONAS_FILE="../2-personas/personas.json"
        OUTPUT_DIR="generated_photos/batch1"
        WORKERS=3
        echo "📊 Mode: Batch 1 (P001-P010)"
        echo "⚠️  Note: Will generate first 10 personas only"
        # TODO: 10명만 추출하는 로직 필요
        ;;
    3)
        PERSONAS_FILE="../2-personas/personas.json"
        OUTPUT_DIR="generated_photos/batch2"
        WORKERS=3
        echo "📊 Mode: Batch 2 (P011-P020)"
        echo "⚠️  Note: Will generate personas 11-20 only"
        # TODO: 11-20번 추출하는 로직 필요
        ;;
    4)
        PERSONAS_FILE="../2-personas/personas.json"
        OUTPUT_DIR="generated_photos/batch3"
        WORKERS=3
        echo "📊 Mode: Batch 3 (P021-P030)"
        echo "⚠️  Note: Will generate personas 21-30 only"
        # TODO: 21-30번 추출하는 로직 필요
        ;;
    5)
        PERSONAS_FILE="../2-personas/personas.json"
        OUTPUT_DIR="generated_photos/full"
        WORKERS=3
        echo "📊 Mode: Full (all 30 personas)"
        echo "⚠️  Warning: This may hit rate limits on free tier!"
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
read -p "Proceed with generation? (y/n): " CONFIRM

if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    echo "❌ Cancelled"
    exit 0
fi

echo ""
echo "🚀 Starting generation..."
echo ""

# 실행
python3 gemini_api.py \
    --api-key "$API_KEY" \
    --personas "$PERSONAS_FILE" \
    --output-dir "$OUTPUT_DIR" \
    --workers $WORKERS

# API 키 변수 정리
unset API_KEY

echo ""
echo "✅ Generation complete!"
echo "📂 Output directory: $OUTPUT_DIR"

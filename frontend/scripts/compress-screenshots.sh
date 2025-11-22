#!/bin/bash

# 이미지 압축 스크립트
# PNG를 JPEG로 변환하고 품질 85%로 압축하여 1MB 이하로 만듭니다

INPUT_DIR="/Users/crystal/Desktop/work-redesign-platform/frontend/workshop-screenshots-full"
OUTPUT_DIR="/Users/crystal/Desktop/work-redesign-platform/frontend/workshop-screenshots-compressed"

# 출력 디렉토리 생성
mkdir -p "$OUTPUT_DIR"

echo "🖼️  Starting image compression..."
echo "📁 Input: $INPUT_DIR"
echo "📁 Output: $OUTPUT_DIR"
echo ""

# 모든 PNG 파일 처리
for file in "$INPUT_DIR"/*.png; do
    if [ -f "$file" ]; then
        filename=$(basename "$file" .png)
        output_file="$OUTPUT_DIR/${filename}.jpg"
        
        echo "📸 Processing: $filename"
        
        # PNG를 JPEG로 변환 (품질 85%)
        sips -s format jpeg -s formatOptions 85 "$file" --out "$output_file" > /dev/null 2>&1
        
        # 파일 크기 확인
        original_size=$(ls -lh "$file" | awk '{print $5}')
        compressed_size=$(ls -lh "$output_file" | awk '{print $5}')
        
        echo "   ✅ $original_size → $compressed_size"
    fi
done

echo ""
echo "✨ Compression complete!"
echo "📊 Results:"
ls -lh "$OUTPUT_DIR"

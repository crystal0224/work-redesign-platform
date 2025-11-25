from google import genai
from google.genai import types
import os
import time
import json
import re

# ==========================================
# 설정
# ==========================================
# API 키는 환경 변수 'GOOGLE_API_KEY'에서 자동으로 읽어옵니다.
# 만약 직접 입력하려면 아래 주석을 해제하고 입력하세요.
# os.environ["GOOGLE_API_KEY"] = "YOUR_API_KEY_HERE"

client = genai.Client()

MODEL_BRAIN = "gemini-2.5-flash-lite"      # 뇌: 최신 Flash Lite 모델
MODEL_PAINTER = "gemini-3-pro-image-preview" # 손: Gemini 3 Pro 이미지 모델

PERSONAS_FILE_PATH = "../src/data/personas.ts"
SAVE_DIR = "../public/images/personas"

# ==========================================
# 1. 페르소나 데이터 읽기
# ==========================================
def read_personas_file():
    print(f"📂 '{PERSONAS_FILE_PATH}' 파일을 읽는 중...")
    try:
        with open(PERSONAS_FILE_PATH, 'r', encoding='utf-8') as f:
            content = f.read()
        return content
    except FileNotFoundError:
        print("❌ 파일을 찾을 수 없습니다. 경로를 확인해주세요.")
        return None

# ==========================================
# 2. 프롬프트 기획 (Gemini)
# ==========================================
def plan_photos(persona_data):
    # 이미 생성된 프롬프트가 있는지 확인
    prompts_file = os.path.join(SAVE_DIR, "prompts.json")
    if os.path.exists(prompts_file):
        print(f"📂 기존 프롬프트 파일 발견: {prompts_file}")
        try:
            with open(prompts_file, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"⚠️ 기존 파일 읽기 실패, 새로 기획합니다: {e}")

    print(f"🚀 1단계: {MODEL_BRAIN}이(가) 페르소나별 사진 컨셉을 기획합니다...")

    prompt = f"""
    You are an expert photographer and creative director.
    Based on the following TypeScript code containing persona data, create a specific image generation prompt for EACH persona (P001 to P030).

    Context (Personas Data):
    {persona_data}

    ---
    **Task:**
    1. Identify the gender and approximate age for each persona based on their name and age.
    2. Determine the appropriate professional attire based on their job role and industry (e.g., Factory worker -> Safety vest/Uniform, CEO -> Suit, Developer -> Smart Casual).
    3. Create a photorealistic image prompt using the REQUIRED KEYWORDS.

    **Required Keywords (Must be included):**
    "Shot on 85mm lens, f/1.8, bokeh, Soft studio lighting, Rembrandt lighting, Detailed skin texture, skin pores, hyper-realistic, 4k, 8k, UHD, raw photo"

    **Output Format:**
    Return ONLY a raw JSON list of objects. No markdown formatting.
    [
        {{
            "id": "P001",
            "name": "Name",
            "desc": "Short description in Korean",
            "image_prompt": "Photorealistic ID photo of a [Age] year old Korean [Gender], [Job Role], wearing [Clothing], [Facial Expression]. [Required Keywords]."
        }},
        ...
    ]
    """

    max_retries = 3
    for attempt in range(max_retries):
        try:
            response = client.models.generate_content(
                model=MODEL_BRAIN,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json"
                )
            )
            
            # 응답 텍스트에서 JSON 부분만 추출
            text = response.text.strip()
            if text.startswith("```json"):
                text = text[7:]
            if text.endswith("```"):
                text = text[:-3]
                
            personas_plan = json.loads(text)
            print(f"✅ 총 {len(personas_plan)}명의 촬영 계획이 수립되었습니다.")
            
            # 프롬프트 저장
            if not os.path.exists(SAVE_DIR):
                os.makedirs(SAVE_DIR)
            with open(prompts_file, "w", encoding="utf-8") as f:
                json.dump(personas_plan, f, indent=2, ensure_ascii=False)
                
            return personas_plan

        except Exception as e:
            print(f"⚠️ 기획 단계 에러 (시도 {attempt+1}/{max_retries}): {e}")
            if "429" in str(e):
                wait_time = (attempt + 1) * 10
                print(f"   -> ⏳ 쿼터 초과. {wait_time}초 대기 후 재시도합니다...")
                time.sleep(wait_time)
            else:
                break
    
    print("❌ 최종 실패: 기획 단계를 완료하지 못했습니다.")
    return []

# ==========================================
# 3. 사진 촬영 (Imagen 4)
# ==========================================
def shoot_photos(personas_plan):
    print(f"🚀 2단계: {MODEL_PAINTER} (Imagen 4)가 고화질 촬영을 시작합니다...")

    if not os.path.exists(SAVE_DIR):
        os.makedirs(SAVE_DIR)

    for i, p in enumerate(personas_plan):
        pid = p.get('id')
        name = p.get('name')
        prompt = p.get('image_prompt')
        
        filename = f"{pid}.png"
        filepath = os.path.join(SAVE_DIR, filename)

        print(f"[{i+1}/{len(personas_plan)}] 📸 촬영 시도: {pid} {name}...")

        try:
            # 1. Imagen 시도
            image_response = client.models.generate_images(
                model=MODEL_PAINTER,
                prompt=prompt,
                config=types.GenerateImagesConfig(
                    number_of_images=1,
                    aspect_ratio="3:4",
                    person_generation="allow_adult",
                )
            )

            for img in image_response.generated_images:
                with open(filepath, "wb") as f:
                    f.write(img.image.image_bytes)
                print(f"   -> ✨ 생성 성공 (High Quality): {filepath}")

        except Exception as e:
            # 2. 실패 시 Fallback (Pravatar)
            # print(f"   -> ⚠️ 생성 실패 (과금/권한 문제): {e}")
            print(f"   -> 🔄 대체 이미지 다운로드 중 (Pravatar)...")
            try:
                # 성별에 따라 다른 이미지 소스 사용 가능하지만, pravatar는 랜덤
                # u={pid}를 사용하여 고정된 랜덤 이미지 확보
                url = f"https://i.pravatar.cc/500?u={pid}"
                urllib.request.urlretrieve(url, filepath)
                print(f"   -> 💾 대체 이미지 저장 완료: {filepath}")
            except Exception as e2:
                print(f"   -> ❌ 다운로드 실패: {e2}")

        # API 쿨타임
        time.sleep(1)


# ==========================================
# 메인 실행
# ==========================================
if __name__ == "__main__":
    # 1. 파일 읽기
    data = read_personas_file()
    if data:
        # 2. 기획
        plan = plan_photos(data)
        if plan:
            # 3. 촬영
            shoot_photos(plan)
            print("\n🎉 모든 작업이 완료되었습니다! public/images/personas 폴더를 확인하세요.")

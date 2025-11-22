#!/usr/bin/env python3
"""
Workshop Screenshot Capture Script using Selenium
More stable alternative to Puppeteer/Playwright
"""

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
import time
import os

# 스크린샷 저장 디렉토리
SCREENSHOT_DIR = os.path.join(os.path.dirname(__file__), '..', 'screenshots')
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

def capture_workshop_screenshots():
    print('🚀 Starting workshop screenshot capture with Selenium...\n')
    
    # Chrome 옵션 설정
    chrome_options = Options()
    chrome_options.add_argument('--headless=new')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--window-size=1920,1080')
    
    driver = None
    try:
        # Chrome 드라이버 시작
        driver = webdriver.Chrome(options=chrome_options)
        
        # 워크샵 페이지로 이동
        print('📍 Navigating to workshop page...')
        driver.get('http://localhost:3000/workshop')
        time.sleep(3)  # 페이지 로드 대기
        
        # Step 1-11까지 반복
        for step in range(1, 12):
            print(f'\n📸 Capturing Step {step}...')
            
            # 페이지가 완전히 로드될 때까지 대기
            time.sleep(2)
            
            # 전체 페이지 높이 계산
            total_height = driver.execute_script("return document.body.scrollHeight")
            viewport_height = driver.execute_script("return window.innerHeight")
            
            # 뷰포트 크기 조정 (전체 페이지 캡처를 위해)
            driver.set_window_size(1920, total_height)
            time.sleep(1)
            
            # 스크린샷 캡처
            screenshot_path = os.path.join(SCREENSHOT_DIR, f'step_{step}_fullpage.png')
            driver.save_screenshot(screenshot_path)
            print(f'   ✅ Saved: {screenshot_path}')
            
            # 원래 뷰포트 크기로 복원
            driver.set_window_size(1920, 1080)
            
            # 마지막 단계가 아니면 "빠른 테스트" 버튼 클릭
            if step < 11:
                try:
                    # XPath로 버튼 찾기
                    button = WebDriverWait(driver, 5).until(
                        EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), '빠른 테스트')]"))
                    )
                    button.click()
                    print(f'   🖱️  Clicked Quick Test button')
                    time.sleep(2)  # 다음 단계로 전환 대기
                except Exception as e:
                    print(f'   ⚠️  Error clicking button: {str(e)}')
        
        print('\n✨ All screenshots captured successfully!')
        print(f'📁 Screenshots saved to: {SCREENSHOT_DIR}')
        
    except Exception as error:
        print(f'\n❌ Error during screenshot capture: {str(error)}')
        raise
    finally:
        if driver:
            driver.quit()
            print('Browser closed')

if __name__ == '__main__':
    try:
        capture_workshop_screenshots()
        print('\n🎉 Screenshot capture completed!')
    except Exception as error:
        print(f'\n💥 Fatal error: {str(error)}')
        exit(1)

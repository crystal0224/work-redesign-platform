from google import genai
import os

client = genai.Client(api_key=os.environ.get("GOOGLE_API_KEY"))

print("Listing available models...")
try:
    for m in client.models.list():
        print(f"Model: {m.name}")
except Exception as e:
    print(f"Error listing models: {e}")

#!/usr/bin/env python3
"""
Gemini Persona Photo Generator
Generates realistic 3:4 portrait photos for personas using Gemini API

Usage:
    python gemini_api.py --api-key YOUR_KEY --personas personas.json
    python gemini_api.py --api-key YOUR_KEY --interactive
"""

import os
import json
import base64
import requests
import argparse
import time
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Dict, List, Optional, Tuple

class GeminiPhotoGenerator:
    """Generate persona photos using Gemini 3 Pro Image Preview API"""
    
    # API endpoints
    PRO_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent"
    FLASH_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent"
    
    def __init__(self, api_key: str, output_dir: str = "generated_photos", use_pro: bool = True):
        """
        Initialize generator
        
        Args:
            api_key: Gemini API key
            output_dir: Directory to save generated photos
            use_pro: Use Pro model (4K) vs Flash (1024px)
        """
        self.api_key = api_key
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        self.endpoint = self.PRO_ENDPOINT if use_pro else self.FLASH_ENDPOINT
        self.model_name = "Nano Banana Pro" if use_pro else "Nano Banana Flash"
        
    def infer_appearance_from_ts(self, persona: Dict) -> Dict:
        """
        Infer appearance details from TS persona data (for new team leaders)
        
        Args:
            persona: TS persona dictionary
            
        Returns:
            Dictionary with inferred appearance details
        """
        age = persona.get('age', 35)
        category = persona.get('category', '')
        department = persona.get('department', '')
        
        # Get personality traits
        personality = persona.get('personality', {})
        tech_savvy = personality.get('techSavvy', 5)
        stress = personality.get('stressLevel', 5)
        confidence = personality.get('confidenceLevel', 5)
        patience = personality.get('patience', 5)
        
        # Infer gender from name (simple heuristic - can be improved)
        name = persona.get('name', '')
        # Common endings: 남성 suffixes, 여성 suffixes
        female_endings = ['진', '영', '희', '미', '선', '아', '연']
        is_female = any(name.endswith(e) for e in female_endings)
        gender = 'woman' if is_female else 'man'
        
        # Hair style based on age and gender
        if gender == 'man':
            if age <= 35:
                hair = "short, modern professional style with slight texture"
            elif age <= 40:
                hair = "short, neatly styled with conservative professionalism"
            else:
                hair = "short, refined style with distinguished gray streaks"
        else:
            if age <= 35:
                hair = "shoulder-length modern professional styling"
            elif age <= 40:
                hair = "neat, sophisticated styling at shoulder length"
            else:
                hair = "elegant, mature styling reflecting leadership presence"
        
        # Glasses determination
        glasses_prob = 0.5
        if category == 'IT' or 'IT' in department:
            glasses_prob += 0.2
        if tech_savvy >= 9:
            glasses_prob += 0.3
        elif tech_savvy >= 7:
            glasses_prob += 0.2
        if age >= 40:
            glasses_prob += 0.2
        
        has_glasses = glasses_prob > 0.6
        glasses_desc = "behind modern thin-framed glasses" if has_glasses else ""
        
        # Attire based on category/department
        if category == 'IT' or 'IT' in department or '개발' in department:
            attire = "Navy blue or charcoal gray collared shirt, smart casual professional style"
        else:
            attire = "Business professional attire with blazer"
        
        # Expression based on personality
        expression = "Professional"
        if confidence >= 8:
            expression += " and confident"
        elif confidence >= 6:
            expression += " with balanced authority"
        else:
            expression += " with humble approachability"
        
        if stress >= 8:
            expression += ", showing determination under pressure"
        elif stress >= 6:
            expression += ", composed despite challenges"
        
        if patience >= 8:
            expression += ", warm and approachable smile"
        elif patience >= 6:
            expression += ", pleasant professional demeanor"
        
        return {
            'gender': gender,
            'hair': hair,
            'glasses': glasses_desc,
            'attire': attire,
            'expression': expression
        }
    
    def create_portrait_prompt(self, persona: Dict) -> str:
        """
        Create professional portrait prompt from persona data
        
        Args:
            persona: Dictionary with persona details
            
        Returns:
            Formatted prompt string
        """
        # Extract persona details
        age = persona.get('age', 30)
        name = persona.get('name', '')
        role = persona.get('role', '')
        company = persona.get('company', '')
        department = persona.get('department', '')
        
        # Check if this is a TS persona (has leaderProfile)
        is_ts_persona = 'leaderProfile' in persona
        
        if is_ts_persona:
            # Auto-infer appearance for new team leaders
            appearance_data = self.infer_appearance_from_ts(persona)
            gender = appearance_data['gender']
            hair = appearance_data['hair']
            glasses = appearance_data['glasses']
            attire = appearance_data['attire']
            expression = appearance_data['expression']
            
            # Get leadership context
            leader_profile = persona.get('leaderProfile', {})
            years_in_role = leader_profile.get('yearsInRole', 1.0)
            previous_role = leader_profile.get('previousRole', 'senior professional')
            leadership_style = leader_profile.get('leadershipStyle', 'balanced leadership')
            
            # Get personality for additional context
            personality = persona.get('personality', {})
            stress = personality.get('stressLevel', 5)
            confidence = personality.get('confidenceLevel', 5)
            
            # Build comprehensive prompt for new team leader
            prompt = f"""Professional portrait photograph of a {age}-year-old Korean {gender},
newly promoted {role} at {company} (promoted {years_in_role} years ago).

Leadership background: Recently promoted from {previous_role}.
Leadership approach: {leadership_style}

Physical appearance:
- Hair: {hair}, black hair styled professionally
- Face: Mature yet approachable features showing {age} years of professional experience
- Eyes: {expression.split(',')[0] if ',' in expression else expression} gaze {glasses}
- Skin: Fair to medium Korean skin tone appropriate for age {age}
- Overall: Professional demeanor of a new team leader

Attire: {attire}

Expression: {expression}

Context: New team leader workshop participant, ID card photo
Demeanor: Balancing confidence (level {confidence}/10) with workplace demands (stress {stress}/10)

Photography specs:
- 3:4 portrait aspect ratio for workshop ID card
- Professional corporate lighting with soft shadows
- Shallow depth of field, f/2.8
- Corporate headshot composition, shoulders visible
- Sharp focus on eyes and facial expression
- Neutral background (light gray gradient)
- High resolution, photorealistic style
- Natural skin texture showing authenticity, no AI smoothing
- Professional workshop participant quality

Camera: Shot with Canon EOS R5, 85mm f/1.8 portrait lens
Style: Contemporary Korean corporate leadership portrait
"""
        else:
            # Original logic for manually specified personas
            gender = persona.get('gender', 'person')
            occupation = persona.get('occupation', 'professional')
            
            # Appearance details
            appearance = persona.get('appearance', {})
            hair = appearance.get('hair', 'neat hairstyle')
            face = appearance.get('face', 'friendly features')
            eyes = appearance.get('eyes', 'expressive eyes')
            skin = appearance.get('skin', 'healthy skin tone')
            features = appearance.get('features', '')
            
            # Style details
            clothing = persona.get('clothing', 'professional attire')
            expression = persona.get('expression', 'confident professional smile')
            background = persona.get('background', 'neutral gray background')
            
            # Build prompt
            prompt = f"""Professional portrait photograph of a {age}-year-old Korean {gender}, {occupation}.

Physical appearance: {hair}, {face}, {eyes}, {skin}{', ' + features if features else ''}.

Attire: {clothing}.

Expression: {expression}.

Photography specs:
- 3:4 portrait aspect ratio
- Professional studio lighting with soft shadows
- Shallow depth of field, f/2.8
- Professional headshot composition
- Sharp focus on eyes and face
- {background}
- High resolution, photorealistic style
- Natural skin texture with visible pores, no AI smoothing
- Professional ID photo quality

Camera: Shot with Canon EOS R5, 85mm f/1.8 portrait lens
Style: Modern corporate headshot photography, natural and authentic"""
        
        return prompt
    
    def generate_image(self, persona: Dict) -> Tuple[Optional[str], bool, Optional[str]]:
        """
        Generate a single persona photo
        
        Args:
            persona: Persona dictionary with 'name' and other details
            
        Returns:
            Tuple of (filename, success, error_message)
        """
        persona_name = persona.get('name', 'unknown')
        
        try:
            # Create prompt
            prompt = self.create_portrait_prompt(persona)
            
            # Prepare request
            headers = {
                "x-goog-api-key": self.api_key,
                "Content-Type": "application/json"
            }
            
            payload = {
                "contents": [{
                    "parts": [{"text": prompt}]
                }],
                "generationConfig": {
                    "responseModalities": ["IMAGE"],
                    "imageConfig": {
                        "aspectRatio": "3:4",
                        "imageSize": "4K"
                    }
                },
                "tools": [{"google_search": {}}]  # Enable real-world grounding
            }
            
            # Make request
            response = requests.post(
                self.endpoint,
                headers=headers,
                json=payload,
                timeout=60
            )
            
            # Handle response
            if response.status_code == 200:
                data = response.json()
                
                # Extract image
                if 'candidates' in data and len(data['candidates']) > 0:
                    parts = data['candidates'][0].get('content', {}).get('parts', [])
                    
                    for part in parts:
                        if 'inlineData' in part:
                            image_data = part['inlineData']['data']
                            
                            # Save image
                            filename = f"{persona_name.replace(' ', '_')}.png"
                            filepath = self.output_dir / filename
                            
                            with open(filepath, 'wb') as f:
                                f.write(base64.b64decode(image_data))
                            
                            return str(filepath), True, None
                
                return None, False, "No image data in response"
            
            else:
                error_msg = f"API error {response.status_code}: {response.text[:200]}"
                return None, False, error_msg
                
        except Exception as e:
            return None, False, str(e)
    
    def generate_batch(self, personas: List[Dict], max_workers: int = 3) -> Dict:
        """
        Generate photos for multiple personas in parallel
        
        Args:
            personas: List of persona dictionaries
            max_workers: Max concurrent requests (default 3 for rate limiting)
            
        Returns:
            Dictionary with results for each persona
        """
        results = {}
        total = len(personas)
        
        print(f"\n🎨 Generating {total} persona photos using {self.model_name}...")
        print(f"⚡ Parallel workers: {max_workers}\n")
        
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            # Submit all tasks
            future_to_persona = {
                executor.submit(self.generate_image, persona): persona['name']
                for persona in personas
            }
            
            # Collect results
            completed = 0
            for future in as_completed(future_to_persona):
                persona_name = future_to_persona[future]
                completed += 1
                
                try:
                    filename, success, error = future.result()
                    
                    results[persona_name] = {
                        'success': success,
                        'filename': filename,
                        'error': error
                    }
                    
                    if success:
                        print(f"✓ [{completed}/{total}] {persona_name}: {filename}")
                    else:
                        print(f"✗ [{completed}/{total}] {persona_name}: {error}")
                        
                except Exception as e:
                    results[persona_name] = {
                        'success': False,
                        'filename': None,
                        'error': str(e)
                    }
                    print(f"✗ [{completed}/{total}] {persona_name}: Exception - {e}")
                
                # Small delay to respect rate limits
                time.sleep(0.5)
        
        # Print summary
        successful = sum(1 for r in results.values() if r['success'])
        print(f"\n📊 Summary: {successful}/{total} photos generated successfully")
        
        if successful < total:
            print(f"⚠️  {total - successful} failed - check error messages above")
        
        return results


def load_personas_from_file(filepath: str) -> List[Dict]:
    """Load personas from JSON file"""
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Handle both direct list and {"personas": [...]} format
    if isinstance(data, list):
        return data
    elif 'personas' in data:
        return data['personas']
    else:
        raise ValueError("JSON must be a list or contain 'personas' key")


def interactive_mode(generator: GeminiPhotoGenerator):
    """Interactive mode for single persona generation"""
    print("\n🎨 Interactive Persona Photo Generator")
    print("=" * 50)
    
    persona = {}
    persona['name'] = input("Persona name: ")
    persona['age'] = int(input("Age: "))
    persona['gender'] = input("Gender (e.g., male/female/person): ")
    persona['occupation'] = input("Occupation: ")
    
    print("\nAppearance details:")
    appearance = {}
    appearance['hair'] = input("  Hair (style, color): ")
    appearance['face'] = input("  Face (shape, features): ")
    appearance['eyes'] = input("  Eyes (color, details): ")
    appearance['skin'] = input("  Skin tone: ")
    appearance['features'] = input("  Other features (optional): ")
    persona['appearance'] = appearance
    
    persona['clothing'] = input("\nClothing/attire: ")
    persona['expression'] = input("Expression/mood: ")
    persona['background'] = input("Background (default: light gray): ") or "light gray gradient background"
    
    print("\n⏳ Generating photo...")
    filename, success, error = generator.generate_image(persona)
    
    if success:
        print(f"\n✓ Success! Photo saved to: {filename}")
    else:
        print(f"\n✗ Failed: {error}")


def main():
    parser = argparse.ArgumentParser(description="Generate persona photos with Gemini API")
    parser.add_argument('--api-key', required=True, help="Gemini API key")
    parser.add_argument('--personas', help="JSON file with persona data")
    parser.add_argument('--interactive', action='store_true', help="Interactive mode for single persona")
    parser.add_argument('--output-dir', default="generated_photos", help="Output directory")
    parser.add_argument('--workers', type=int, default=3, help="Max parallel workers (default: 3)")
    parser.add_argument('--flash', action='store_true', help="Use Flash model (faster, 1024px)")
    
    args = parser.parse_args()
    
    # Initialize generator
    generator = GeminiPhotoGenerator(
        api_key=args.api_key,
        output_dir=args.output_dir,
        use_pro=not args.flash
    )
    
    # Run in appropriate mode
    if args.interactive:
        interactive_mode(generator)
    elif args.personas:
        personas = load_personas_from_file(args.personas)
        generator.generate_batch(personas, max_workers=args.workers)
    else:
        parser.error("Either --personas or --interactive must be specified")


if __name__ == "__main__":
    main()

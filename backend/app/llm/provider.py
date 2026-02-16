"""
Gemini API Provider
Handles communication with Google Gemini API
"""

import google.generativeai as genai
from app.core.config import settings


def configure_gemini():
    """Configure Gemini API with key from settings"""
    genai.configure(api_key=settings.gemini_api_key)


def get_gemini_model(model_name: str = None):
    """Get configured Gemini model instance"""
    if not model_name:
        model_name = settings.gemini_model
    
    return genai.GenerativeModel(model_name)


async def generate_text(prompt: str, model_name: str = None) -> dict:
    """
    Generate text using Gemini API
    
    Args:
        prompt: The prompt to send to Geminine
        model_name: Optional model override
        
    Returns:
        dict with 'text', 'prompt_tokens', 'completion_tokens'
    """
    try:
        model = get_gemini_model(model_name)
        
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.7,
                top_p=0.9,
                top_k=40,
                max_output_tokens=4096,
            ),
        )
        
        # Extract token counts
        prompt_tokens = response.usage_metadata.prompt_token_count if hasattr(response, 'usage_metadata') else 0
        completion_tokens = response.usage_metadata.candidates_token_count if hasattr(response, 'usage_metadata') else 0
        
        return {
            "text": response.text,
            "prompt_tokens": prompt_tokens,
            "completion_tokens": completion_tokens,
        }
        
    except Exception as e:
        raise Exception(f"Gemini API error: {str(e)}")

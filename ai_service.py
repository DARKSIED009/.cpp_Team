import os
import json
import time
import threading
from dotenv import load_dotenv

# Disk-backed cache and lock to prevent rate limits
CACHE_FILE = ".ai_cache.json"
_ai_lock = threading.Lock()

try:
    if os.path.exists(CACHE_FILE):
        with open(CACHE_FILE, "r", encoding="utf-8") as f:
            _AI_CACHE = json.load(f)
    else:
        _AI_CACHE = {}
except:
    _AI_CACHE = {}

def _save_cache():
    try:
        with open(CACHE_FILE, "w", encoding="utf-8") as f:
            json.dump(_AI_CACHE, f)
    except:
        pass

# Try to load google-genai, gracefully fallback if not installed or missing key
try:
    from google import genai
    from google.genai import types
    has_genai = True
except ImportError:
    has_genai = False

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY and has_genai:
    # Initialize the Gemini GenAI client
    client = genai.Client(api_key=GEMINI_API_KEY)
    MODEL_ID = "gemini-2.0-flash"
else:
    client = None
    MODEL_ID = None

# --- Prompt Templates ---
SYSTEM_INSTRUCTION = """
You are an AI decision-support assistant for ShadowCredit, a behavioral credit scoring platform for gig workers.
Your role is to explain rule-based credit scores, identify strengths and weak areas, and advise workers on improving their standing.
You must NOT invent scores, pretend you calculated the score, or override the provided deterministic numerical data.
Communicate clearly, empathetically, and strictly base your insights on the provided worker JSON payload.
Use a professional, financial-advisory tone. Do not use overly enthusiastic or informal language.
"""

EXPLAIN_SCORE_PROMPT = """
Explain the following worker's credit report in plain language. 
Structure the response with:
1. A brief summary of their overall standing.
2. 2-3 specific strengths pulling their score up.
3. 1-2 weak areas pulling their score down.

Keep the response under 150 words.
Worker Profile & Report:
{worker_data}
"""

CRITIQUE_PROMPT = """
Provide 3 actionable tips the worker can take to improve their credit score and reduce their risk band.
Format as a direct, numbered list. Be specific based on their data.
Worker Profile & Report:
{worker_data}
"""

LENDER_SUMMARY_PROMPT = """
Provide a brief 3-bullet executive profile summary of this gig worker.
Highlight consistency, risks, and earnings trend. Keep it strictly objective and data-focused.
Worker Profile & Report:
{worker_data}
"""

SIMULATE_ADVICE_PROMPT = """
The user is testing a hypothetical data adjustment in the dashboard:
{adjustments}

This shifted their current numerical tier metric from {old_score} to {new_score}.
Explain structurally why changing these specific inputs logically impacts the overall aggregate metric this way. Keep it educational, encouraging, and under 50 words.
"""

COACH_PROMPT = """
Act as an improvement coach. Provide a structured action plan to optimize this worker's metrics over time.
Format your response exactly as three distinct sections:
**7-Day Plan:** Immediate quick wins (1-2 points).
**30-Day Plan:** Medium-term habit building (1-2 points).
**90-Day Plan:** Long-term strategic targets (1-2 points).

Worker Profile & Report:
{worker_data}
"""

ANOMALY_PROMPT = """
Analyze the income volatility, rating history, and cancellation rate for this worker.
Point out 1 to 2 "anomalies" or risky earning patterns that deviate from healthy gig behaviors.
If they are exceptionally stable, state that no risky anomalies are present. Keep the response under 60 words.

Worker Profile & Report:
{worker_data}
"""

LENDER_NARRATIVE_PROMPT = """
Generate a comprehensive, formal financial dossier narrative for this gig worker's profile.
This will be used by an underwriter to understand the worker's reliability. Include sections for:
*   **Income Stability Analysis**
*   **Platform Engagement & Consistency**
*   **Risk Profile & Mitigating Factors**
*   **Final Decision Support Summary**

Keep the tone highly objective, data-dense, and professional.

Worker Profile & Report:
{worker_data}
"""

def generate_ai_response(prompt: str) -> str:
    """Helper to call Gemini API, returning text."""
    if prompt in _AI_CACHE:
        return _AI_CACHE[prompt]
        
    if not client:
        return "AI Service is unavailable. Please check your GEMINI_API_KEY or install google-genai."
        
    with _ai_lock:
        # Check cache again inside lock just in case another thread populated it
        if prompt in _AI_CACHE:
            return _AI_CACHE[prompt]
            
        try:
            # Sleep 4.2s to enforce a maximum of 14 Requests Per Minute
            # Mathematically preventing the Gemini Free Tier 15 RPM limit
            time.sleep(4.2) 
            
            response = client.models.generate_content(
                model=MODEL_ID,
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_INSTRUCTION,
                )
            )
            text = response.text
            _AI_CACHE[prompt] = text
            _save_cache()
            return text
        except Exception as e:
            error_msg = str(e)
            print(f"AI Generation Error: {error_msg}")
            
            if '429' in error_msg or 'Quota' in error_msg or 'Resource has been exhausted' in error_msg:
                return "Google Free Tier Quota Exhausted. (To fix: either wait 60s, or you have hit your daily Free Tier allowance)."
            
            return f"AI Service encountered an issue. ({error_msg})"

def explain_score(worker_data: dict) -> str:
    prompt = EXPLAIN_SCORE_PROMPT.format(worker_data=json.dumps(worker_data, indent=2))
    return generate_ai_response(prompt)

def critique_worker(worker_data: dict) -> str:
    prompt = CRITIQUE_PROMPT.format(worker_data=json.dumps(worker_data, indent=2))
    return generate_ai_response(prompt)

def get_lender_summary(worker_data: dict) -> str:
    prompt = LENDER_SUMMARY_PROMPT.format(worker_data=json.dumps(worker_data, indent=2))
    return generate_ai_response(prompt)

def get_simulate_advice(old_score: int, new_score: int, adjustments: dict) -> str:
    prompt = SIMULATE_ADVICE_PROMPT.format(
        old_score=old_score,
        new_score=new_score,
        adjustments=json.dumps(adjustments, indent=2)
    )
    return generate_ai_response(prompt)

def chat_with_bot(worker_data: dict, history: list, message: str) -> str:
    """
    history: list of dicts [{"role": "user"|"model", "parts": [{"text": "message"}]}]
    """
    if not client:
        return "AI Chat is unavailable. Check API key."
    try:
        # Build contents array
        contents = []
        # Inject system context as the first user interaction if history is empty
        context_msg = f"Context payload:\n{json.dumps(worker_data, indent=2)}\n\nPlease answer my next questions based on this profile."
        if not history:
             contents.append(types.Content(role="user", parts=[types.Part.from_text(text=context_msg)]))
             contents.append(types.Content(role="model", parts=[types.Part.from_text(text="I understand. How can I help you today?")]))
        else:
             # Just append history
             for h in history:
                 parts = [types.Part.from_text(text=p["text"]) for p in h["parts"]]
                 contents.append(types.Content(role=h["role"], parts=parts))

        # Append new message
        contents.append(types.Content(role="user", parts=[types.Part.from_text(text=message)]))
        
        response = client.models.generate_content(
            model=MODEL_ID,
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_INSTRUCTION,
            )
        )
        return response.text
    except Exception as e:
        print(f"AI Chat Error: {e}")
        return "AI Service encountered an error."

def get_coach_plan(worker_data: dict) -> str:
    prompt = COACH_PROMPT.format(worker_data=json.dumps(worker_data, indent=2))
    return generate_ai_response(prompt)

def get_anomaly_report(worker_data: dict) -> str:
    prompt = ANOMALY_PROMPT.format(worker_data=json.dumps(worker_data, indent=2))
    return generate_ai_response(prompt)

def get_narrative(worker_data: dict) -> str:
    prompt = LENDER_NARRATIVE_PROMPT.format(worker_data=json.dumps(worker_data, indent=2))
    return generate_ai_response(prompt)

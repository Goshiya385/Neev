"""
Streaming Groq LLM response for Saarthi AI.
"""
import os

try:
    from groq import Groq
    HAS_GROQ = True
except ImportError:
    HAS_GROQ = False


def stream_saarthi_response(message: str, student_context: str, history: list):
    """Stream Groq response token by token (generator)"""
    if not HAS_GROQ or not os.getenv("GROQ_API_KEY"):
        yield f"Hey! Saarthi streaming is setting up. Your question: '{message}' — I'll help once GROQ_API_KEY is configured! 🔧"
        return

    client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    messages = [
        {"role": "system", "content": f"""You are Saarthi, NEEV ka AI mentor.
Student context: {student_context}
Communicate in Hinglish (mix of Hindi and English). Be supportive, realistic, slightly funny, GenZ-friendly.
Always end with one specific actionable step. Keep responses under 200 words."""},
    ]
    for h in history[-8:]:
        messages.append({"role": h.get("role", "user"), "content": h.get("content", "")})
    messages.append({"role": "user", "content": message})

    try:
        stream = client.chat.completions.create(
            model="llama-3.3-70b-versatile", messages=messages, max_tokens=500, stream=True
        )
        for chunk in stream:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content
    except Exception as e:
        yield f"Saarthi thoda busy hai bhai 😅 Error: {str(e)[:50]}"

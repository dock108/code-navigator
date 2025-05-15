import os
from openai import AsyncOpenAI
from app.services.github_service import get_file_content

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
print("OPENAI_API_KEY loaded:", bool(OPENAI_API_KEY))

client = AsyncOpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None

async def gpt4_summarize(prompt: str) -> str:
    if not OPENAI_API_KEY or not client:
        raise RuntimeError("OpenAI API key not configured.")
    try:
        response = await client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=128,
            temperature=0.7,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        raise RuntimeError(f"OpenAI API error: {str(e)}")

async def summarize_file(owner: str, repo: str, path: str) -> str:
    try:
        file_content = get_file_content(owner, repo, path)
    except Exception as e:
        raise RuntimeError(f"File not found or could not be fetched: {str(e)}")
    prompt = f"Summarize the functionality and purpose of the following file clearly and concisely:\n\n{file_content}"
    return await gpt4_summarize(prompt) 
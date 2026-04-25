import os
from dotenv import load_dotenv
from openai import OpenAI, AuthenticationError

load_dotenv()

def Chat_Refine(prompt: str) -> str:

    # print(prompt)

    client = OpenAI(api_key=os.getenv("OPENROUTER_API_KEY"),base_url="https://openrouter.ai/api/v1")

    try:
        response = client.chat.completions.create(
            model="anthropic/claude-haiku-4.5",
            messages=[{"role": "system", "content": prompt}],
        )
    except AuthenticationError as exc:
        raise RuntimeError(
            "OpenRouter authentication failed (401). "
            "Your OPENROUTER_API_KEY is invalid, revoked, or for a different account."
        ) from exc

    content = response.choices[0].message.content or ""
    return content

def chat_dataset(prompt: str, model: str, count: int) -> str:
    """Chat with the dataset model"""
    client = OpenAI(api_key=os.getenv("OPENROUTER_API_KEY"),base_url="https://openrouter.ai/api/v1")
    try:
        response = client.chat.completions.create(
        model=model,
        messages=[{"role": "system", "content": prompt},
        {"role": "user", "content": f"Generate {count} objects for the dataset."}],
    )
    except AuthenticationError as exc:
        raise RuntimeError(
            "OpenRouter authentication failed (401). "
            "Your OPENROUTER_API_KEY is invalid, revoked, or for a different account."
        ) from exc
    content = response.choices[0].message.content or ""
    return content
import os
from openai import OpenAI


def _ollama_client() -> OpenAI:
    base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434/v1")
    # Ollama's OpenAI-compatible endpoint accepts any non-empty API key.
    api_key = os.getenv("OLLAMA_API_KEY", "ollama")
    return OpenAI(api_key=api_key, base_url=base_url)
ollama_model = os.getenv("OLLAMA_REFINE_MODEL", "gemma4:31b-cloud")

def Chat_Refine(prompt: str) -> str:
    
    client = _ollama_client()

    try:
        response = client.chat.completions.create(
            # model=model,
            model=ollama_model,
            messages=[{"role": "system", "content": prompt}],
        )
    except Exception as exc:
        raise RuntimeError(
            "Ollama request failed in Chat_Refine. "
            "Ensure Ollama is running locally and the model is pulled."
        ) from exc

    content = response.choices[0].message.content or ""
    return content


def chat_dataset(prompt: str, model: str, count: int) -> str:
    client = _ollama_client()

    try:
        response = client.chat.completions.create(
            model=ollama_model,
            # model=model,
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": f"Generate {count} objects for the dataset."},
            ],
        )
    except Exception as exc:
        raise RuntimeError(
            "Ollama request failed in chat_dataset. "
            "Ensure Ollama is running locally and the model is pulled."
        ) from exc

    content = response.choices[0].message.content or ""
    return content

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


def execute_testcase(main_prompt: str, user_input: str, main_model: str) -> str:
    client = _ollama_client()
    try:
        print(f"Executing testcase with main_prompt: {main_prompt[:30]} | User_input: {user_input[:30]} |  Main_model: {main_model}")
        response = client.chat.completions.create(
            # model=main_model,
            model=ollama_model,
            messages=[{"role": "system", "content": main_prompt}, 
            {"role": "user", "content": user_input}],
        )
    except Exception as exc:
        raise RuntimeError(
            "Ollama request failed in execute_testcase. "
            "Ensure Ollama is running locally and the model is pulled."
        ) from exc
    content = response.choices[0].message.content or ""
    return content

def run_grader(llmJudge_prompt: str, testcaseResponse: str, target_model: str) -> str:
    client = _ollama_client()
    try:
        response = client.chat.completions.create(
            # model=target_model,
            model=ollama_model,
            messages=[{"role": "system", "content": llmJudge_prompt}, 
            {"role": "user", "content": testcaseResponse}],
        )
    except Exception as exc:
        raise RuntimeError(
            "Ollama request failed in evaluate_testcase. "
            "Ensure Ollama is running locally and the model is pulled."
        ) from exc
    content = response.choices[0].message.content or ""
    return content
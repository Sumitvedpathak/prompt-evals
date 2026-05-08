import json
from pathlib import Path
from prompts.refine import user_refine_prompt, default_dataset_prompt
# from integration.openrouter import Chat_Refine, chat_dataset
from integration.ollamarouter import Chat_Refine, chat_dataset

_API_DIR = Path(__file__).resolve().parents[1]
_RESOURCES_DIR = _API_DIR / "resources"
_LLMS_PATH = _RESOURCES_DIR / "llms.json"
_DATASET_PATH = _RESOURCES_DIR / "dataset.json"

def _strip_markdown_fence(text: str) -> str:
    text = text.strip()
    if not text.startswith("```"):
        return text
    lines = text.splitlines()
    if lines and lines[0].startswith("```"):
        lines = lines[1:]
    if lines and lines[-1].strip() == "```":
        lines = lines[:-1]
    return "\n".join(lines).strip()

def refine_user_prompt(type: str, user_prompt: str, target_model: str):
    """Refine the main prompt for the evaluation"""

    if type == "main":
        prompt = user_refine_prompt.format(user_prompt=user_prompt, target_model=target_model)
    elif type == "default_ds_prompt":
        prompt = default_dataset_prompt.format(user_prompt=user_prompt, dataset_target_model=target_model)
    else:
        raise ValueError(f"Invalid type: {type}")

    response_prompt = Chat_Refine(prompt)
    return response_prompt

def get_dataset_LLMs(type: str):
    """Get the list of dataset LLMs"""
    with _LLMS_PATH.open("r", encoding="utf-8") as file:
        llms = json.load(file)
    if type == "target":
        return llms['target_llms']
    elif type == "dataset":
        return llms['dataset_llms']
    elif type == "evaluation":
        return llms['evaluation_llms']
    else:
        raise ValueError(f"Invalid type: {type}")

# def generate_dataset_prompt(prompt: str):
#     """Generate a dataset prompt for the evaluation from the Main prompt"""
#     userprompt = dataset_refine_prompt.format(user_prompt=prompt)
#     prompt = Chat_Refine(userprompt)
#     return prompt

def create_dataset(dataset_prompt: str, dataset_model: str, count: int):
    """Create a dataset for the evaluation"""
    prompt = chat_dataset(dataset_prompt, dataset_model, count)
    prompt = _strip_markdown_fence(prompt)
    # print(prompt)
    dataset =json.loads(prompt)
    if dataset is None:
        raise ValueError("No dataset found")
    _RESOURCES_DIR.mkdir(parents=True, exist_ok=True)
    with _DATASET_PATH.open("w", encoding="utf-8") as f:
        json.dump(dataset, f, indent=2)
    return dataset
    # return prompt

def get_dataset():
    """Get the dataset from the file"""
    with _DATASET_PATH.open("r", encoding="utf-8") as f:
        dataset = json.load(f)
    return dataset

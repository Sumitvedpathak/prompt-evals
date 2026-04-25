import json
from prompts.refine import user_refine_prompt
from integration.openrouter import Chat_Refine, chat_dataset

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

def refine_user_prompt(type: str, prompt: str, target_model: str):
    """Refine the main prompt for the evaluation"""
    if type == "main":
        userprompt = user_refine_prompt.format(user_prompt=prompt, target_model=target_model)
    # elif type == "dataset":
    #     userprompt = dataset_refine_prompt.format(user_prompt=prompt, target_model=target_model)
    else:
        raise ValueError(f"Invalid type: {type}")
    prompt = Chat_Refine(userprompt)
    return prompt

def get_dataset_LLMs(type: str):
    """Get the list of dataset LLMs"""
    with open('resources/llms.json', 'r') as file:
        llms = json.load(file)
    if type == "dataset":
        return llms['dataset_llms']
    elif type == "target":
        return llms['target_llms']
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
    with open("resources/dataset.json", "w") as f:
        json.dump(dataset, f, indent=2)
    return dataset
    # return prompt

def get_dataset():
    """Get the dataset from the file"""
    with open("resources/dataset.json", "r") as f:
        dataset = json.load(f)
    return dataset

from service.service import refine_user_prompt, get_dataset_LLMs, create_dataset, get_dataset
from prompts.refine import default_dataset_prompt

def refine_prompt(type: str, prompt: str, target_model: str):
    """Refine the main prompt for the evaluation"""
    prompt = refine_user_prompt(type, prompt, target_model)
    return prompt

def get_LLMs(type: str):
    """Get the list of dataset LLMs"""
    dataset_LLMs = get_dataset_LLMs(type)
    return dataset_LLMs

# def get_dataset_prompt(main_prompt: str):
#     """Get the dataset prompt for the evaluation from the Main prompt"""
#     dataset_prompt = generate_dataset_prompt(main_prompt)
#     return dataset_prompt

def generate_dataset(dataset_prompt: str, dataset_model: str, count: int):
    """Generate a dataset of test cases for evaluation"""
    dataset = create_dataset(dataset_prompt, dataset_model, count)
    return dataset

def read_dataset():
    """Read the dataset from the file"""
    dataset = get_dataset()
    return dataset

def run_eval(eval_prompt: str, eval_model: str): 
    """Run the evaluation on the dataset"""
    return None

# refine_prompt("main","Generate an whats app message for invitation to a party", "gemini/gemini-2.5-flash")
# refine_prompt("dataset","Generate an whats app message for invitation to a party", "openai/gpt-4o")
# print(get_LLMs("dataset"))
# generate_dataset(default_dataset_prompt, "anthropic/claude-haiku-4.5", 4)
# print(read_dataset())
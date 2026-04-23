from src.api.prompts.refine import user_refine_prompt

def refine_prompt(prompt: str, target_model: str):
    """Refine the main prompt for the evaluation"""
    user_refine_prompt = user_refine_prompt.format(user_prompt=prompt, target_model=target_model)

    return None

def generate_dataset_prompt(prompt: str):
    """Generate a dataset prompt for the evaluation"""
    return None

def generate_dataset(dataset_prompt: str, dataset_model: str):
    """Generate a dataset of test cases for evaluation"""
    return None

def run_eval(eval_prompt: str, eval_model: str): 
    """Run the evaluation on the dataset"""
    return None


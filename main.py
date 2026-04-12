import os
import json
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
load_dotenv()


def strip_markdown_fence(text: str) -> str:
    text = text.strip()
    if not text.startswith("```"):
        return text
    lines = text.splitlines()
    if lines and lines[0].startswith("```"):
        lines = lines[1:]
    if lines and lines[-1].strip() == "```":
        lines = lines[:-1]
    return "\n".join(lines).strip()

def chat(message:str):
    """Chat with the model and return the result"""
    model = ChatGoogleGenerativeAI(model="gemini-2.5-flash", api_key=os.getenv("GOOGLE_API_KEY"))
    response = model.invoke(message)
    return response.content

def generate_dataset():
    prompt = """
    Generate an evaluation dataset for a prompt evaluation. The dataset will be used to evaluate prompts that generate Python, JSON, or Regex specifically for AWS-related tasks. Generate an array of JSON objects, each representing task that requires Python, JSON, or a Regex to complete.

    Example output:
    [
    {
        "task": "Description of task",
    },
    ...additional
    ]
    * Focus on tasks that can be solved by writing a single Python function, a single JSON object, or a single regex
    * Focus on tasks that do not require writing much code

    Please generate 3 objects for the dataset.
    """
    response = chat(prompt)
    dataset = strip_markdown_fence(response)
    with open("dataset.json", "w") as f:
        json.dump(json.loads(dataset), f, indent=2)
    return dataset

def run_prompt(test_case:str):
    """Merge the test case in the prompt and return the result"""
    prompt = f"""
    Please solve the following task:

    {test_case["task"]}
    """
    response = chat(prompt)
    return response

def run_test_case(test_case:str):
    """Run the test case and return the result"""
    output = run_prompt(test_case)
    #TODO: Grade the output
    score = 10

    return {
        "test_case": test_case,
        "output": output,
        "score": score
    }

def run_eval(dataset:str):
    """Run the evaluation on the dataset"""
    for test_case in dataset:
        result = run_test_case(test_case)
        print(result)

def main():
    dataset = generate_dataset()
    print(dataset)


if __name__ == "__main__":
    main()

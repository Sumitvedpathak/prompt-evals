import os
import json
from statistics import mean
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, AIMessage
from langchain_openai import ChatOpenAI
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

def chat(model:str, message:str):
    """Chat with the model and return the result"""
    if model == "gemini-2.5-flash":
        model = ChatGoogleGenerativeAI(model=model, api_key=os.getenv("GOOGLE_API_KEY"))
    else:
        model = ChatOpenAI(model=model, api_key=os.getenv("OPENAI_API_KEY"))
    response = model.invoke(message)
    return response.content

def add_user_message(messages,message):
    messages.append(HumanMessage(content=message))

def add_assistant_message(messages,message):
    messages.append(AIMessage(content=message))

def generate_dataset():
    prompt = """
    Generate an evaluation dataset for a prompt evaluation. The dataset will be used to evaluate prompts that generate Python, JSON, or Regex specifically for AWS-related tasks. Generate an array of JSON objects, each representing task that requires Python, JSON, or a Regex to complete.

    Example output:
    [
    {
        "task": "Description of task",
        "solution_criteria": "Must include runtime, memory size, optimization, performance, security, etc."
    },
    ...additional
    ]
    * Focus on tasks that can be solved by writing a single Python function, a single JSON object, or a single regex
    * Focus on tasks that do not require writing much code

    Please generate 2 objects for the dataset.
    """
    response = chat("gemini-2.5-flash", prompt)
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
    response = chat("gemini-2.5-flash", prompt)
    return response

def grade_by_model(test_case:str, output:str):
    """Grade the output by the model"""
    prompt = f"""
    You are an expert code reviewer. Evaluate this AI-generated solution.
    Original Task:
    <task>{test_case["task"]}</task>
    Solution to be evaluated:
    <solution>{output}</solution>
    Solution Criteria:
    <solution_criteria>{test_case["solution_criteria"]}</solution_criteria>
    
    Solution Criteria:
    Use solution criteria defined in the task to evaluate the solution.

    Provide your evaluation as a structured JSON object with:
    - "strengths": An array of 1-3 key strengths
    - "weaknesses": An array of 1-3 key areas for improvement  
    - "reasoning": A concise explanation of your assessment
    - "score": A number between 1-10:

    Respond in JSON format. Keep your response concise and direct.
    Example output:
    {{
        "strengths": string[],
        "weaknesses": string[],
        "reasoning": string,
        "score": number
    }}
    """

    print("Grader Prompt: ", prompt)
    response = chat("gpt-4o", prompt)
    return json.loads(strip_markdown_fence(response))


def run_test_case(test_case:str):
    """Run the test case and return the result"""
    output = strip_markdown_fence(run_prompt(test_case))
    #TODO: Grade the output
    grade = grade_by_model(test_case, output)
    score = grade["score"]
    reasoning = grade["reasoning"]

    return {
        "test_case": test_case,
        "output": output,
        "score": score,
        "reasoning": reasoning
    }

def run_eval(dataset:str):
    """Run the evaluation on the dataset"""
    results = []
    for test_case in dataset:
        result = run_test_case(test_case)
        results.append(result)
    average_score = mean(result["score"] for result in results)
    print(f"Average Score: {average_score}")
    return results

def main():
    dataset = generate_dataset()
    print("Dataset Generated")
    with open("dataset.json", "r") as f:
        dataset = json.load(f)
    print("Running Evaluations")
    results = run_eval(dataset)
    print(results)


if __name__ == "__main__":
    main()

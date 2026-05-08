from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Any
from service.service import refine_user_prompt, get_dataset_LLMs, create_dataset, get_dataset
from prompts.refine import default_dataset_prompt

app = FastAPI(
    title="Prompt Evals",
    description="API for prompt evaluations",
    version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PromptRequest(BaseModel):
    type: str
    prompt: str
    target_model: str

class PromptResponse(BaseModel):
    refined_prompt: str

class DatasetRequest(BaseModel):
    dataset_prompt: str
    dataset_model: str
    count: int

class DatasetResponse(BaseModel):
    dataset: Any


@app.get("/")
def read_root():
    return {"message": "Eval application API is running"}

@app.get("/llm")
def get_LLMs(type: str):
    """Get the list of dataset LLMs"""
    dataset_LLMs = get_dataset_LLMs(type)
    return dataset_LLMs

@app.post("/refine")
def refine_prompt(request: PromptRequest) -> PromptResponse:
    """Refine the main prompt for the evaluation"""
    prompt = refine_user_prompt(request.type, request.prompt, request.target_model)
    return PromptResponse(refined_prompt=prompt)


# def get_dataset_prompt(main_prompt: str):
#     """Get the dataset prompt for the evaluation from the Main prompt"""
#     dataset_prompt = generate_dataset_prompt(main_prompt)
#     return dataset_prompt


@app.post("/dataset/create")
def generate_dataset(request: DatasetRequest) -> DatasetResponse:
    """Generate a dataset of test cases for evaluation"""
    dataset = create_dataset(request.dataset_prompt, request.dataset_model, request.count)
    return DatasetResponse(dataset=dataset)


# # Backward-compatible alias (deprecated in UI)
# @app.post("/dataset/create")
# def generate_dataset_legacy(request: DatasetRequest) -> DatasetResponse:
#     return generate_dataset(request)

@app.get("/dataset/read")
def read_dataset():
    """Read the dataset from the file"""
    dataset = get_dataset()
    return DatasetResponse(dataset=dataset)

def run_eval(eval_prompt: str, eval_model: str): 
    """Run the evaluation on the dataset"""
    return None

# refine_prompt("main","Generate an whats app message for invitation to a party", "gemini/gemini-2.5-flash")
# refine_prompt("dataset","Generate an whats app message for invitation to a party", "openai/gpt-4o")
# print(get_LLMs("dataset"))
# generate_dataset(default_dataset_prompt, "anthropic/claude-haiku-4.5", 4)
# print(read_dataset())
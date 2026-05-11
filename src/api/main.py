from unittest import result
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Any
from service.service import refine_user_prompt, get_dataset_LLMs, create_dataset, get_dataset, run_evaluation, get_evaluation_results

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

class EvaluateRequest(BaseModel):
    main_prompt: str
    main_model: str
    evaluate_model:str

class EvaluationResultsResponse(BaseModel):
    results: Any


@app.get("/")
def read_root():
    return {"message": "Eval application API is running"}

@app.get("/llm")
def get_LLMs(type: str):
    """Get the list of dataset LLMs"""
    dataset_LLMs = get_dataset_LLMs(type)
    print(f"LLMs returned for type: {type} successfully!")
    return dataset_LLMs

@app.post("/refine")
def refine_prompt(request: PromptRequest) -> PromptResponse:
    """Refine the main prompt for the evaluation"""
    print("Prompt refineing started...")
    prompt = refine_user_prompt(request.type, request.prompt, request.target_model)
    print("Prompt refineing completed successfully!")
    return PromptResponse(refined_prompt=prompt)


# def get_dataset_prompt(main_prompt: str):
#     """Get the dataset prompt for the evaluation from the Main prompt"""
#     dataset_prompt = generate_dataset_prompt(main_prompt)
#     return dataset_prompt


@app.post("/dataset/create")
def generate_dataset(request: DatasetRequest) -> DatasetResponse:
    """Generate a dataset of test cases for evaluation"""
    print("Generating dataset started...")
    dataset = create_dataset(request.dataset_prompt, request.dataset_model, request.count)
    print("Dataset generated successfully!")
    return DatasetResponse(dataset=dataset)


# # Backward-compatible alias (deprecated in UI)
# @app.post("/dataset/create")
# def generate_dataset_legacy(request: DatasetRequest) -> DatasetResponse:
#     return generate_dataset(request)

@app.get("/dataset/read")
def read_dataset():
    """Read the dataset from the file"""
    print("Reading dataset started...")
    dataset = get_dataset()
    print("Dataset read successfully!")
    return DatasetResponse(dataset=dataset)

@app.post("/testcase/evaluate")
def evaluate(request: EvaluateRequest):
    """Evaluate the dataset"""
    try:
        print("Evaluating with main model: ", request.main_model, "and evaluate model: ", request.evaluate_model)
        dataset = run_evaluation(request.main_prompt, request.main_model, request.evaluate_model)
        print("Evaluation completed successfully!")
        return "Success"
    except Exception as e:
        return {"error": str(e)}

@app.post("/eval/results")
def get_eval_results():
    """Get the evaluation results"""
    print("Getting evaluation results started...")
    results = get_evaluation_results()
    print("Evaluation results returned successfully!")
    return EvaluationResultsResponse(results=results)


if __name__ == "__main__":
    result = get_eval_results()
    print(result)
    

from dotenv import load_dotenv
import os
from langchain.chat_models import init_chat_model

load_dotenv()

def get_chat_model(model: str):
    return init_chat_model(
        model=model, 
        model_provider="openai",
        base_url="https://openrouter.ai/api/v1",
        api_key=os.getenv("OPENROUTER_API_KEY"))


def refine_prompt(model: str, message: str):
    model = get_chat_model(model)
    return model.invoke(message)

# def create_dataset(model: str, message: str):


# print(refine_prompt("deepseek/deepseek-r1", "Hello, how are you?"))

from langchain_ollama import OllamaLLM
from langsmith import Client

langsmith_api_key = os.getenv("LANGSMITH_API_KEY")
os.environ["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY")
os.environ["LANGCHAIN_TRACING_V2"] = "true"
# Client() does not accept a project argument; tracing uses LANGSMITH_PROJECT / LANGCHAIN_PROJECT.
os.environ.setdefault("LANGSMITH_PROJECT", "Dev-Evals-system")

client = Client(
    api_key=langsmith_api_key,
    api_url="https://api.smith.langchain.com",
)
llm = OllamaLLM(model="gemma4:31b-cloud")
print(llm.invoke("Hello World?"))



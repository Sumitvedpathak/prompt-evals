import openai
import os




def Chat(prompt: str, ):

    client = openai.Client(api_key=os.getenv("OPENROUTER_API_KEY"), base_url="https://openrouter.ai/api/v1")

    response = client.chat.completions.create(
    model="anthropic/claude-sonnet-4",
    messages=[
        {"role": "system", "content": user_refine_prompt},
        {"role": "user", "content": prompt}
    ]
    )

    print(response.choices[0].message.content)

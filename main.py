import os
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from huggingface_hub import InferenceClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize FastAPI
app = FastAPI(title="AI Chat API")

# Configure Hugging Face API
API_KEY = os.getenv("HF_API_TOKEN")
if not API_KEY or API_KEY == "your_huggingface_api_token_here":
    print("Warning: HF_API_TOKEN not properly set in .env")

# Hugging Face model to use
HF_MODEL = "meta-llama/Meta-Llama-3-8B-Instruct"

# Initialize the Inference Client
client = InferenceClient(api_key=API_KEY) if API_KEY else None

# In-memory dictionary for conversation history
# Structure: { "session_id": [{"role": "user", "content": "hello"}, ...] }
session_history = {}

class ChatRequest(BaseModel):
    session_id: str
    prompt: str

class ChatResponse(BaseModel):
    response: str

def get_chat_history(session_id: str):
    if session_id not in session_history:
        session_history[session_id] = [
            {
                "role": "system",
                "content": "You are a helpful, friendly AI assistant. Provide clear and concise answers."
            }
        ]
    return session_history[session_id]

def save_message(session_id: str, role: str, content: str):
    if session_id not in session_history:
        get_chat_history(session_id)
    session_history[session_id].append({"role": role, "content": content})

def map_hf_exception_to_http(e: Exception):
    error_str = str(e)
    if "401" in error_str or "Unauthorized" in error_str:
        return HTTPException(status_code=401, detail="Authentication failed. Check your HF_API_TOKEN.")
    elif "429" in error_str or "Rate limit" in error_str.lower():
        return HTTPException(status_code=429, detail="Rate limit exceeded. Please try again later.")
    elif "400" in error_str or "Invalid" in error_str:
        return HTTPException(status_code=400, detail=f"Invalid request: {error_str}")
    else:
        return HTTPException(status_code=500, detail=f"Internal Server Error: {error_str}")

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    if not API_KEY or API_KEY == "your_huggingface_api_token_here":
        raise HTTPException(status_code=500, detail="LLM API key not configured.")
        
    try:
        history = get_chat_history(request.session_id)
        save_message(request.session_id, "user", request.prompt)
        
        response = client.chat_completion(
            model=HF_MODEL,
            messages=session_history[request.session_id],
            max_tokens=1024,
        )
        
        assistant_message = response.choices[0].message.content
        save_message(request.session_id, "assistant", assistant_message)
        
        return ChatResponse(response=assistant_message)
    except Exception as e:
        # Remove the last user message if the request failed
        if request.session_id in session_history and session_history[request.session_id]:
            session_history[request.session_id].pop()
        raise map_hf_exception_to_http(e)

@app.post("/chat/stream")
async def chat_stream_endpoint(request: ChatRequest):
    if not API_KEY or API_KEY == "your_huggingface_api_token_here":
        raise HTTPException(status_code=500, detail="LLM API key not configured.")

    try:
        history = get_chat_history(request.session_id)
        save_message(request.session_id, "user", request.prompt)
        
        # Async generator for streaming
        async def event_generator():
            full_response = ""
            try:
                stream = client.chat_completion(
                    model=HF_MODEL,
                    messages=session_history[request.session_id],
                    max_tokens=1024,
                    stream=True,
                )
                for chunk in stream:
                    if chunk.choices and chunk.choices[0].delta and chunk.choices[0].delta.content:
                        text = chunk.choices[0].delta.content
                        full_response += text
                        yield text
                
                # Save the full response to history after streaming completes
                save_message(request.session_id, "assistant", full_response)
            except Exception as e:
                # Remove the last user message on error
                if request.session_id in session_history and session_history[request.session_id]:
                    session_history[request.session_id].pop()
                yield f"\n\n[Error: {str(e)}]"
                
        return StreamingResponse(event_generator(), media_type="text/plain")
        
    except Exception as e:
        raise map_hf_exception_to_http(e)

# Serve the frontend from the "static" directory
# Mount it at root, but ensure it runs after the API routes
import os.path
if not os.path.exists("static"):
    os.makedirs("static")
app.mount("/", StaticFiles(directory="static", html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

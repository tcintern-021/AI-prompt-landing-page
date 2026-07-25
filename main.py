import os
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from google import genai
from google.genai import types, errors as google_exceptions
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize FastAPI
app = FastAPI(title="AI Chat API")

# Configure Gemini API
API_KEY = os.getenv("GEMINI_API_KEY")
client = None
if not API_KEY or API_KEY == "your_gemini_api_key_here":
    print("Warning: GEMINI_API_KEY not properly set in .env")
else:
    client = genai.Client(api_key=API_KEY)

# In-memory dictionary for conversation history
# Structure: { "session_id": [...] }
session_history = {}

class ChatRequest(BaseModel):
    session_id: str
    prompt: str

class ChatResponse(BaseModel):
    response: str

def get_chat_session(session_id: str):
    if not client:
        raise HTTPException(status_code=500, detail="LLM API key not configured.")
    if session_id not in session_history:
        session_history[session_id] = []
    
    # Initialize a Chat object with the history using the new SDK
    chat = client.chats.create(model='gemini-flash-latest', history=session_history[session_id])
    return chat

def save_chat_history(session_id: str, chat_session):
    # Update the stored history with the new messages
    session_history[session_id] = chat_session.get_history()

def map_google_exception_to_http(e: Exception):
    if isinstance(e, google_exceptions.APIError):
        status = getattr(e, 'code', None) or getattr(e, 'status_code', None) or 500
        return HTTPException(status_code=status, detail=f"Gemini API Error: {str(e)}")
    else:
        return HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    if not client:
        raise HTTPException(status_code=500, detail="LLM API key not configured.")
        
    try:
        chat = get_chat_session(request.session_id)
        response = chat.send_message(request.prompt)
        save_chat_history(request.session_id, chat)
        return ChatResponse(response=response.text)
    except Exception as e:
        raise map_google_exception_to_http(e)

@app.post("/chat/stream")
async def chat_stream_endpoint(request: ChatRequest):
    if not client:
        raise HTTPException(status_code=500, detail="LLM API key not configured.")

    try:
        chat = get_chat_session(request.session_id)
        
        # Async generator for streaming
        async def event_generator():
            try:
                response = chat.send_message_stream(request.prompt)
                for chunk in response:
                    # Yielding text directly as plain text for simplicity
                    yield chunk.text
                save_chat_history(request.session_id, chat)
            except Exception as e:
                # Need to yield the error or log it since we are already streaming
                yield f"\n\n[Error: {str(e)}]"
                
        return StreamingResponse(event_generator(), media_type="text/plain")
        
    except Exception as e:
        raise map_google_exception_to_http(e)

# Serve the frontend from the "static" directory
# Mount it at root, but ensure it runs after the API routes
import os.path
if not os.path.exists("static"):
    os.makedirs("static")
app.mount("/", StaticFiles(directory="static", html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

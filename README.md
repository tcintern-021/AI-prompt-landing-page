# 🤖 AI Chat API

A sleek, real-time AI chat application powered by **Google Gemini** and **FastAPI**. AI Chat API delivers a premium conversational experience with streaming responses, Markdown rendering, and a modern dark-themed UI.

![Python](https://img.shields.io/badge/Python-3.12+-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?logo=fastapi&logoColor=white)
![Gemini](https://img.shields.io/badge/Google%20Gemini-Flash-4285F4?logo=google&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 📖 Overview

AI Chat API is a full-stack chat application that connects a beautifully crafted frontend to Google's Gemini large language model. It supports multi-turn conversations with persistent session history, real-time token streaming, and rich Markdown output — all wrapped in a polished, responsive interface.

---

## 🚀 Features

| Feature | Description |
| --- | --- |
| **Streaming Responses** | Token-by-token streaming via `StreamingResponse` for an instant, typewriter-style experience. |
| **Multi-Turn Memory** | In-memory session history enables context-aware, multi-turn conversations. |
| **Markdown Rendering** | AI responses are rendered with full Markdown support — headings, lists, bold, links, and more. |
| **Syntax-Highlighted Code Blocks** | Code blocks include one-click copy buttons for seamless developer workflows. |
| **Suggestion Chips** | Pre-defined prompt chips to help users get started quickly. |
| **Auto-Resizing Input** | Textarea dynamically expands as users type longer prompts. |
| **Dark Theme UI** | A refined, dark color palette with glassmorphism accents and smooth animations. |
| **Clear Chat** | Instantly reset the conversation and start fresh. |

---

## 🛠️ Tech Stack

### Backend
- **[FastAPI](https://fastapi.tiangolo.com/)** — High-performance async web framework
- **[Uvicorn](https://www.uvicorn.org/)** — Lightning-fast ASGI server
- **[Google GenAI SDK](https://ai.google.dev/)** — Official Gemini API client (`google-genai`)
- **[Pydantic](https://docs.pydantic.dev/)** — Data validation and serialization
- **[python-dotenv](https://github.com/theskumar/python-dotenv)** — Environment variable management

### Frontend
- **HTML5 / CSS3 / Vanilla JavaScript** — No framework overhead
- **[Inter](https://fonts.google.com/specimen/Inter)** — Modern sans-serif typography via Google Fonts
- **[Marked.js](https://marked.js.org/)** — Fast Markdown parser and renderer (CDN)

---

## 📦 Prerequisites

- **Python 3.12+** (3.13 also supported; avoid 3.14+ due to dependency compatibility issues)
- **Google Gemini API Key** — Obtain one from the [Google AI Studio](https://aistudio.google.com/apikey)
- **pip** — Python package manager

---

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/AI-prompt-landing-page.git
cd AI-prompt-landing-page
```

### 2. Create a Virtual Environment

```bash
python -m venv .venv
```

Activate the environment:

- **Windows (PowerShell):**
  ```powershell
  .\.venv\Scripts\Activate.ps1
  ```
- **macOS / Linux:**
  ```bash
  source .venv/bin/activate
  ```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Create a `.env` file in the project root:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

> ⚠️ **Important:** Never commit your `.env` file. It is already included in `.gitignore`.

### 5. Start the Development Server

```bash
uvicorn main:app --env-file .env --reload
```

The application will be available at **[http://127.0.0.1:8000](http://127.0.0.1:8000)**.

---

## 📁 Project Structure

```
AI-prompt-landing-page/
├── main.py               # FastAPI application — API routes, Gemini integration
├── requirements.txt      # Python dependencies
├── .env                  # Environment variables (not tracked by Git)
├── .gitignore            # Git ignore rules
├── README.md             # Project documentation
└── static/               # Frontend assets (served at root)
    ├── index.html        # Main HTML page
    ├── style.css         # Stylesheet — dark theme, animations, layout
    └── app.js            # Client-side logic — streaming, Markdown, UI
```

---

## 🔌 API Reference

### `POST /chat`

Standard (non-streaming) chat endpoint.

**Request Body:**
```json
{
  "session_id": "unique-session-id",
  "prompt": "Your message here"
}
```

**Response:**
```json
{
  "response": "AI-generated reply"
}
```

---

### `POST /chat/stream`

Streaming chat endpoint — returns tokens incrementally as `text/plain`.

**Request Body:**
```json
{
  "session_id": "unique-session-id",
  "prompt": "Your message here"
}
```

**Response:** Chunked `text/plain` stream.

---

## 🧩 Usage

1. Open the app in your browser at `http://127.0.0.1:8000`.
2. Type a message or click one of the **suggestion chips** to get started.
3. Responses stream in real-time with full Markdown formatting.
4. Use the **trash icon** to clear the conversation history.

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature`.
3. Commit your changes: `git commit -m "Add your feature"`.
4. Push to the branch: `git push origin feature/your-feature`.
5. Open a Pull Request.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<p align="center">
  Built with ❤️ using FastAPI & Google Gemini
</p>

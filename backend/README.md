# Backend – FastAPI

## Setup

```bash
python -m venv .venv
.venv\Scripts\activate          # Windows
pip install -r requirements.txt
```

## Run dev server

```bash
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

## Environment

Set `GROQ_API_KEY` in your local `.env` or Container App environment before using the AI-powered task parser and daily briefing endpoints.

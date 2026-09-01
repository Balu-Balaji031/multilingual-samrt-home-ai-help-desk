# SmartAssist Backend

This backend is a clean FastAPI foundation for the SmartAssist project.

## Python version

This project uses Python 3.14.5.

## Create virtual environment

Windows PowerShell:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

## Install dependencies

```powershell
pip install -r requirements.txt
```

## Start the application

```powershell
uvicorn app.main:app --reload
```

The API will be available at:

- http://127.0.0.1:8000/health
- http://127.0.0.1:8000/docs

## Health endpoint

GET /health

Response:

```json
{
  "status": "ok"
}
```

## Swagger documentation

FastAPI provides interactive API documentation at:

- http://127.0.0.1:8000/docs
- http://127.0.0.1:8000/openapi.json

## Project structure

```text
backend/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── api/
│   ├── services/
│   ├── models/
│   ├── schemas/
│   ├── core/
│   ├── db/
│   └── utils/
├── .env.example
├── .gitignore
├── README.md
├── requirements.txt
└── .venv/
```

## Notes

This Phase 1 setup is intentionally minimal and does not yet connect the frontend, database, AI services, or business logic. Those integrations belong to later phases.

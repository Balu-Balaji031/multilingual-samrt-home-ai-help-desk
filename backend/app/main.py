from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from app.core.performance import begin_request, record_timing, reset_request, start_timer

load_dotenv()

app = FastAPI(title="Multilingual Smart Home AI Helpdesk API")

# Configure CORS
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url, "http://127.0.0.1:5173", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def measure_ai_request_time(request: Request, call_next):
    flow_by_path = {
        "/api/ai/sessions": "initial",
        "/api/ai/chat": "follow_up",
    }
    flow = flow_by_path.get(request.url.path) if request.method == "POST" else None
    if flow is None:
        return await call_next(request)

    request_id, context_token = begin_request(flow)
    request.state.ai_performance_request_id = request_id
    started_at = start_timer()
    outcome = "error"
    try:
        response = await call_next(request)
        outcome = "success" if response.status_code < 400 else "error"
        return response
    finally:
        record_timing(
            "total_api_response",
            (start_timer() - started_at) * 1000,
            outcome=outcome,
            flow=flow,
            language=getattr(request.state, "ai_performance_language", "unknown"),
        )
        reset_request(context_token)


@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Backend is running"}

from app.api.routes.ai import router as ai_router
from app.api.routes.tickets import router as tickets_router
from app.api.routes.account import router as account_router
from app.api.routes.admin_notifications import router as admin_notifications_router

app.include_router(ai_router, prefix="/api/ai", tags=["AI"])
app.include_router(tickets_router, prefix="/api/tickets", tags=["Tickets"])
app.include_router(account_router, prefix="/api/account", tags=["Account"])
app.include_router(admin_notifications_router, prefix="/api/admin-notifications", tags=["Admin Notifications"])

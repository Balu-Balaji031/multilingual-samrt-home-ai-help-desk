from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException

from app.core.auth import get_current_technician_id
from app.core.firebase import get_firestore
from app.services.notification_service import create_admin_notifications

router = APIRouter()


@router.post("/application-submitted", status_code=204)
async def technician_application_submitted(
    technician_id: str = Depends(get_current_technician_id),
):
    db = get_firestore()
    if db is None:
        raise HTTPException(status_code=503, detail="Firestore is unavailable.")

    profile_snapshot = db.collection("users").document(technician_id).get()
    profile = profile_snapshot.to_dict() if profile_snapshot.exists else None
    application = (profile or {}).get("application") or {}
    if application.get("status") != "UNDER_REVIEW":
        raise HTTPException(status_code=409, detail="No submitted technician application was found.")

    submitted_at = application.get("submittedAt")
    if not isinstance(submitted_at, datetime):
        raise HTTPException(status_code=409, detail="Application submission timestamp is unavailable.")

    event_id = f"{technician_id}:{submitted_at.isoformat()}"
    create_admin_notifications(
        db,
        "NEW_TECHNICIAN_APPLICATION",
        event_id,
        "New Technician Application",
        "A technician application has been submitted for review.",
        technician_id,
    )
    return None

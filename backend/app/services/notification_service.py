from datetime import datetime
from hashlib import sha256

from google.api_core.exceptions import AlreadyExists


SERVICE_NOTIFICATIONS = {
    "CREATED": ("Service Request Created", "Your service request has been created successfully."),
    "ACCEPTED": ("Technician Accepted", "Your technician has accepted your service request."),
    "ON_THE_WAY": ("Technician On the Way", "Your technician is travelling to your location."),
    "ARRIVED": ("Technician Arrived", "Your technician has arrived at your location."),
    "REPAIR_STARTED": (
        "Repair Started",
        "The technician has verified your service request and started the repair.",
    ),
    "COMPLETED": ("Repair Completed", "Your repair has been completed successfully."),
}

NOTIFICATION_PREFERENCE_KEYS = {
    "SERVICE": "serviceUpdates",
    "AI": "aiUpdates",
    "ACCOUNT": "accountSecurityAlerts",
}

ADMIN_NOTIFICATION_PREFERENCE_KEYS = {
    "NEW_TECHNICIAN_APPLICATION": "newTechnicianApplication",
    "ASSESSMENT_UPDATE": "assessmentUpdates",
    "FINAL_APPROVAL_REQUIRED": "finalApprovalRequired",
    "NEW_SERVICE_REQUEST": "newServiceRequest",
}


def create_notification(
    db,
    notification_id: str,
    user_id: str,
    notification_type: str,
    title: str,
    message: str,
    ticket_id: str | None = None,
) -> None:
    preference_key = NOTIFICATION_PREFERENCE_KEYS.get(notification_type)
    if preference_key:
        profile = db.collection("users").document(user_id).get()
        profile_data = profile.to_dict() if profile.exists else {}
        profile_data = profile_data or {}
        settings = profile_data.get("settings") or {}
        preferences = settings.get("notificationPreferences") or {}
        if preferences.get(preference_key) is False:
            return

    data = {
        "notificationId": notification_id,
        "userId": user_id,
        "type": notification_type,
        "title": title,
        "message": message,
        "isRead": False,
        "createdAt": datetime.utcnow(),
    }
    if ticket_id:
        data["ticketId"] = ticket_id
    db.collection("notifications").document(notification_id).set(data, merge=False)


def create_service_notification(db, ticket: dict, transition: str) -> None:
    details = SERVICE_NOTIFICATIONS.get(transition)
    if not details:
        return
    ticket_id = ticket["ticketId"]
    create_notification(
        db,
        f"service_{ticket_id}_{transition.lower()}",
        ticket["userId"],
        "SERVICE",
        details[0],
        details[1],
        ticket_id,
    )


def create_ai_notification(db, session: dict, status: str) -> None:
    if status == "NEEDS_TECHNICIAN":
        title = "Technician Support Required"
        message = "Your issue requires technician assistance. A service ticket has been created."
    elif status in {"RESOLVED", "UNSAFE"}:
        title = "AI Troubleshooting Completed"
        message = "Your AI troubleshooting session has been completed."
    else:
        return
    create_notification(
        db,
        f"ai_{session['sessionId']}_{status.lower()}",
        session["userId"],
        "AI",
        title,
        message,
    )


def create_admin_notifications(
    db,
    category: str,
    event_id: str,
    title: str,
    message: str,
    source_id: str | None = None,
) -> None:
    preference_key = ADMIN_NOTIFICATION_PREFERENCE_KEYS.get(category)
    if not preference_key:
        raise ValueError(f"Unsupported admin notification category: {category}")

    for admin in db.collection("users").where("role", "==", "admin").stream():
        admin_data = admin.to_dict() or {}
        settings = admin_data.get("settings") or {}
        preferences = settings.get("notificationPreferences") or {}
        if preferences.get(preference_key) is False:
            continue

        stable_key = f"{category}:{event_id}:{admin.id}"
        notification_id = f"admin_{sha256(stable_key.encode('utf-8')).hexdigest()}"
        data = {
            "notificationId": notification_id,
            "userId": admin.id,
            "type": "ADMIN",
            "category": category,
            "title": title,
            "message": message,
            "isRead": False,
            "createdAt": datetime.utcnow(),
        }
        if source_id:
            data["sourceId"] = source_id
        try:
            db.collection("notifications").document(notification_id).create(data)
        except AlreadyExists:
            continue


def create_admin_service_request_notification(db, ticket: dict) -> None:
    create_admin_notifications(
        db,
        "NEW_SERVICE_REQUEST",
        ticket["ticketId"],
        "New Service Request",
        "A customer submitted a new service request requiring review.",
        ticket["ticketId"],
    )

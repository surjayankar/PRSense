from fastapi import APIRouter

from app.handlers.installation import handle_installation
from app.handlers.issue import handle_issue
from app.handlers.issue_comment import handle_issue_comment
from app.handlers.pull_request import handle_pull_request
from app.models.schemas import WebhookPayload, WebhookResponse

router = APIRouter()


@router.post("/webhook", response_model=WebhookResponse)
async def handle_webhook(data: WebhookPayload):
    event = data.event
    payload = data.payload

    if event == "installation":
        await handle_installation(payload)
    elif event == "pull_request":
        await handle_pull_request(payload)
    elif event == "issues":
        await handle_issue(payload)
    elif event == "issue_comment":
        await handle_issue_comment(payload)

    return WebhookResponse(status="success")
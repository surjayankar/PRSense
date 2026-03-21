import inngest

from app.inngest import inngest_client

TRIGGER_COMMANDS = ["/fix", "/prsense fix"]


async def handle_issue_comment(payload):
    """Triggered when a user comments /fix on an issue to auto-generate a PR."""
    comment_body = payload.get("comment", {}).get("body", "").strip().lower()

    if not any(cmd in comment_body for cmd in TRIGGER_COMMANDS):
        return

    # Only trigger on issues, not PR comments
    if "pull_request" in payload.get("issue", {}):
        return

    installation_id = str(payload["installation"]["id"])
    issue = payload["issue"]
    repo = payload["repository"]

    await inngest_client.send(
        inngest.Event(
            name="issue/auto-pr",
            data={
                "installation_id": installation_id,
                "owner": repo["owner"]["login"],
                "repo_name": repo["name"],
                "issue_number": issue["number"],
                "issue_title": issue["title"],
                "issue_body": issue.get("body", "") or "",
            },
        )
    )
from fastapi import FastAPI
from app.routers import webhooks, chat
from app.inngest.client import inngest_client
from app.inngest import auto_pr, indexing
import inngest.fast_api

app = FastAPI()
app.include_router(webhooks.router)
app.include_router(chat.router)

inngest.fast_api.serve(
    app,
    inngest_client,
    [auto_pr.handle_auto_pr, indexing.handle_installation]
)
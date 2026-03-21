from openai import AsyncOpenAI

from app.core.config import settings

client = AsyncOpenAI(api_key=settings.openai_api_key)


async def create_embedding(text):
    response = await client.embeddings.create(
        input=text, model="text-embedding-3-small"
    )
    return response.data[0].embedding
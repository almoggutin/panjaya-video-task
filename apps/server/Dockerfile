FROM python:3.12-slim AS deps

RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY pyproject.toml poetry.lock ./
RUN pip install poetry && poetry install --no-root --only main

FROM deps AS runtime

COPY video_audio_server/ ./video_audio_server/

RUN addgroup --system app && adduser --system --ingroup app app
USER app

CMD ["poetry", "run", "uvicorn", "video_audio_server.main:app", "--host", "0.0.0.0", "--port", "8000", "--limit-concurrency", "100", "--no-access-log"]

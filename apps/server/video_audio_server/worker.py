from arq import func
from arq.connections import RedisSettings
from video_audio_server.core.config import settings
from video_audio_server.core.db.all_models import (
    Asset,
    RefreshToken,
    User,
)  # registers all ORM mappers
from video_audio_server.modules.assets.jobs.process_asset_job import process_asset_job

__all__ = ["Asset", "RefreshToken", "User"]  # re-export to satisfy linter


class WorkerSettings:
    functions = [func(process_asset_job, max_tries=settings.worker_max_tries)]
    redis_settings = RedisSettings.from_dsn(settings.redis_url)
    job_timeout = settings.worker_job_timeout
    retry_jobs = True

from pydantic import BaseModel
from video_audio_server.modules.assets.models.processing_status_model import (
    ProcessingStatus,
)


class AssetCreateData(BaseModel):
    user_id: str
    title: str
    description: str | None = None
    original_filename: str
    format: str
    size_bytes: int
    video_key: str = ""
    status: str = ProcessingStatus.PENDING_UPLOAD

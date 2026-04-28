from typing import Any

from video_audio_server.modules.assets.entities.asset_entity import Asset
from video_audio_server.modules.assets.models.processing_status_model import (
    ProcessingStatus,
)

SUPPORTED_MIME_TYPES: frozenset[str] = frozenset(
    {
        "video/mp4",
        "video/quicktime",
        "video/x-msvideo",
        "video/x-matroska",
        "video/webm",
    }
)

DEFAULT_PAGE_LIMIT: int = 15
MAX_PAGE_LIMIT: int = 100

RESUMABLE_STATUSES: frozenset[str] = frozenset(
    {
        ProcessingStatus.QUEUED,
        ProcessingStatus.EXTRACTING,
        ProcessingStatus.TRANSFORMING,
        ProcessingStatus.FINALIZING,
    }
)

SORT_COLUMNS: dict[str, Any] = {
    "title": Asset.title,
    "originalExtension": Asset.format,
    "createdAt": Asset.created_at,
    "updatedAt": Asset.updated_at,
}

from video_audio_server.core.storage.presign_service import PresignService
from video_audio_server.core.storage.storage_client import StorageClient


def get_s3_client() -> StorageClient:
    return StorageClient()


def get_presign_service() -> PresignService:
    return PresignService()

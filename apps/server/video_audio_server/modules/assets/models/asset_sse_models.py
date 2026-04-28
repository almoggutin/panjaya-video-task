from pydantic import BaseModel


class StatusEventData(BaseModel):
    asset_id: str
    state: str
    progress: float
    message: str | None = None


class StatusEvent(BaseModel):
    event: str = "status"
    data: StatusEventData


class ReadyEventData(BaseModel):
    asset_id: str
    audio_url: str
    modified_audio_url: str
    modified_video_url: str
    peaks_url: str
    thumbnail_url: str
    duration_sec: float


class ReadyEvent(BaseModel):
    event: str = "ready"
    data: ReadyEventData


class ErrorEventData(BaseModel):
    asset_id: str
    code: str
    message: str


class ErrorEvent(BaseModel):
    event: str = "error"
    data: ErrorEventData

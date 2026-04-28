from enum import StrEnum


class ProcessingStatus(StrEnum):
    PENDING_UPLOAD = "pending_upload"
    QUEUED = "queued"
    EXTRACTING = "extracting"
    TRANSFORMING = "transforming"
    FINALIZING = "finalizing"
    READY = "ready"
    FAILED = "failed"

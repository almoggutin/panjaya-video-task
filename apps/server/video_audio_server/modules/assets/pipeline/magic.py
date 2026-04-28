from pathlib import Path

from video_audio_server.core.models.error_models import UnprocessableError

_RECOGNIZED_HEADERS: list[tuple[int, bytes]] = [
    (0, b"\x1a\x45\xdf\xa3"),  # MKV / WebM
    (0, b"RIFF"),  # AVI
    (4, b"ftyp"),  # MP4 / QuickTime / MOV
]


def validate_magic_bytes(path: Path) -> None:
    with open(path, "rb") as f:
        header = f.read(12)
    for offset, magic in _RECOGNIZED_HEADERS:
        if header[offset : offset + len(magic)] == magic:
            return

    raise UnprocessableError("File content does not match a supported video format")

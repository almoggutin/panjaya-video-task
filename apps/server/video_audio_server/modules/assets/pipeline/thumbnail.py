import subprocess
from pathlib import Path


def extract_thumbnail(video_path: Path) -> Path:
    output_path = video_path.parent / "thumbnail.jpg"
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-i",
            str(video_path),
            "-vframes",
            "1",
            "-q:v",
            "2",
            str(output_path),
        ],
        check=True,
        capture_output=True,
    )

    return output_path

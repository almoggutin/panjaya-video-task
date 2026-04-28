import subprocess
from pathlib import Path


def extract_audio(video_path: Path) -> Path:
    output_path = video_path.parent / "audio.m4a"
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-i",
            str(video_path),
            "-vn",
            "-c:a",
            "aac",
            "-ar",
            "44100",
            "-af",
            "aresample=async=1:min_hard_comp=0.100000:first_pts=0",
            str(output_path),
        ],
        check=True,
        capture_output=True,
    )
    return output_path

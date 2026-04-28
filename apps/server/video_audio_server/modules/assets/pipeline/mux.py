import subprocess
from pathlib import Path


def mux_video(video_path: Path, audio_path: Path) -> Path:
    output_path = video_path.parent / f"modified_video{video_path.suffix}"
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-i",
            str(video_path),
            "-i",
            str(audio_path),
            "-c:v",
            "copy",
            "-c:a",
            "aac",
            "-map",
            "0:v:0",
            "-map",
            "1:a:0",
            "-shortest",
            str(output_path),
        ],
        check=True,
        capture_output=True,
    )
    return output_path

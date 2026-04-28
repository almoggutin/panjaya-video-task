import subprocess
from pathlib import Path


def transform_audio(audio_path: Path) -> Path:
    output_path = audio_path.parent / "modified.m4a"
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-i",
            str(audio_path),
            "-af",
            "asetrate=55125,atempo=0.8,aresample=44100:async=1:min_hard_comp=0.100000:first_pts=0",
            str(output_path),
        ],
        check=True,
        capture_output=True,
    )

    return output_path

import subprocess
from pathlib import Path

import numpy as np


def compute_peaks(audio_path: Path, num_peaks: int = 1000) -> list[float]:
    result = subprocess.run(
        [
            "ffmpeg",
            "-i",
            str(audio_path),
            "-f",
            "f32le",
            "-acodec",
            "pcm_f32le",
            "-ac",
            "1",
            "pipe:1",
        ],
        check=True,
        capture_output=True,
    )
    samples = np.frombuffer(result.stdout, dtype=np.float32)
    if samples.size == 0:
        return [0.0] * num_peaks

    chunks = np.array_split(samples, num_peaks)
    return [float(np.max(np.abs(chunk))) if chunk.size > 0 else 0.0 for chunk in chunks]

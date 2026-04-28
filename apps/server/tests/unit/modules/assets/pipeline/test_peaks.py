from pathlib import Path

from video_audio_server.modules.assets.pipeline.peaks import compute_peaks


def test_compute_peaks_returns_correct_length(audio_path: Path) -> None:
    peaks = compute_peaks(audio_path)

    assert len(peaks) == 1000


def test_compute_peaks_custom_num_peaks(audio_path: Path) -> None:
    peaks = compute_peaks(audio_path, num_peaks=200)

    assert len(peaks) == 200


def test_compute_peaks_values_are_normalized(audio_path: Path) -> None:
    peaks = compute_peaks(audio_path)

    assert all(0.0 <= p <= 1.0 for p in peaks)

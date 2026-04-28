from pathlib import Path

from video_audio_server.modules.assets.pipeline.extract import extract_audio


def test_extract_audio_returns_m4a(video_path: Path, tmp_path: Path) -> None:
    import shutil

    video = shutil.copy(video_path, tmp_path / "test.mp4")
    result = extract_audio(Path(video))

    assert result.exists()
    assert result.suffix == ".m4a"
    assert result.stat().st_size > 0


def test_extract_audio_output_is_in_same_dir(video_path: Path, tmp_path: Path) -> None:
    import shutil

    video = shutil.copy(video_path, tmp_path / "test.mp4")
    result = extract_audio(Path(video))

    assert result.parent == tmp_path

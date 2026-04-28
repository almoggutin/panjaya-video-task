from pathlib import Path

from video_audio_server.modules.assets.pipeline.thumbnail import extract_thumbnail


def test_extract_thumbnail_returns_jpg(video_path: Path, tmp_path: Path) -> None:
    import shutil

    video = shutil.copy(video_path, tmp_path / "test.mp4")
    result = extract_thumbnail(Path(video))

    assert result.exists()
    assert result.suffix == ".jpg"
    assert result.stat().st_size > 0


def test_extract_thumbnail_output_is_in_same_dir(
    video_path: Path, tmp_path: Path
) -> None:
    import shutil

    video = shutil.copy(video_path, tmp_path / "test.mp4")
    result = extract_thumbnail(Path(video))

    assert result.parent == tmp_path

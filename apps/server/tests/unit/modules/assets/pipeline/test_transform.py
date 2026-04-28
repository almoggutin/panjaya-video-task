from pathlib import Path

from video_audio_server.modules.assets.pipeline.transform import transform_audio


def test_transform_audio_returns_m4a(audio_path: Path, tmp_path: Path) -> None:
    import shutil

    audio = shutil.copy(audio_path, tmp_path / "test.m4a")
    result = transform_audio(Path(audio))

    assert result.exists()
    assert result.suffix == ".m4a"
    assert result.stat().st_size > 0


def test_transform_audio_output_is_in_same_dir(
    audio_path: Path, tmp_path: Path
) -> None:
    import shutil

    audio = shutil.copy(audio_path, tmp_path / "test.m4a")
    result = transform_audio(Path(audio))

    assert result.parent == tmp_path

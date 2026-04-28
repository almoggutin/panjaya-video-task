from video_audio_server.modules.assets.dtos.asset_create_dto import AssetCreateData
from video_audio_server.shared.utils.partial import make_partial

_AssetPatchBase = make_partial(AssetCreateData, name="_AssetPatchBase")


class AssetPatchData(_AssetPatchBase):
    pass

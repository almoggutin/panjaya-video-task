from video_audio_server.modules.assets.dtos.asset_create_dto import AssetCreateData
from video_audio_server.modules.assets.dtos.asset_patch_dto import AssetPatchData
from video_audio_server.modules.assets.entities.asset_entity import Asset
from video_audio_server.shared.repositories.crud_repository import CrudRepository


class AssetRepository(
    CrudRepository[Asset, AssetCreateData, AssetCreateData, AssetPatchData]
):
    _entity_class = Asset

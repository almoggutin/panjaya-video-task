from typing import Any, ClassVar, Generic, TypeVar, cast

from pydantic import BaseModel
from sqlalchemy import ColumnElement, func, select
from sqlalchemy.ext.asyncio import AsyncSession

TEntity = TypeVar("TEntity")
TCreate = TypeVar("TCreate", bound=BaseModel)
TUpdate = TypeVar("TUpdate", bound=BaseModel)
TPatch = TypeVar("TPatch", bound=BaseModel)


class CrudRepository(Generic[TEntity, TCreate, TUpdate, TPatch]):
    _entity_class: ClassVar[type[Any]]

    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def find_by_id(self, id: str) -> TEntity | None:
        return cast("TEntity | None", await self._db.get(self._entity_class, id))

    async def get_all(
        self,
        offset: int,
        limit: int,
        *filters: ColumnElement[bool],
        order_by: Any = None,
    ) -> tuple[list[TEntity], int]:
        total: int = (
            await self._db.scalar(
                select(func.count()).select_from(self._entity_class).where(*filters)
            )
            or 0
        )
        query = select(self._entity_class).where(*filters)
        if order_by is not None:
            query = query.order_by(order_by)
        query = query.offset(offset).limit(limit)
        items = list((await self._db.execute(query)).scalars())
        return cast("list[TEntity]", items), total

    async def create(self, data: TCreate) -> TEntity:
        entity = self._entity_class(**data.model_dump())
        self._db.add(entity)
        await self._db.flush()
        return cast("TEntity", entity)

    async def update(self, entity: TEntity, data: TUpdate) -> TEntity:
        for key, value in data.model_dump().items():
            setattr(entity, key, value)
        return entity

    async def patch(self, entity: TEntity, data: TPatch) -> TEntity:
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(entity, key, value)
        return entity

    async def delete(self, entity: TEntity) -> None:
        await self._db.delete(entity)

    async def commit(self) -> None:
        await self._db.commit()

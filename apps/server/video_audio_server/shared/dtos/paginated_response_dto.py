import math
from typing import Generic, Self, TypeVar

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel

T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    items: list[T]
    total: int
    page: int
    limit: int
    total_pages: int

    @classmethod
    def from_page(
        cls,
        items: list[T],
        total: int,
        page: int,
        limit: int,
    ) -> Self:
        return cls(
            items=items,
            total=total,
            page=page,
            limit=limit,
            total_pages=math.ceil(total / limit) if limit > 0 else 0,
        )

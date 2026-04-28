from typing import Any, Optional

from pydantic import BaseModel, create_model
from pydantic.fields import FieldInfo


def make_partial(
    model: type[BaseModel],
    name: str | None = None,
    exclude: set[str] | None = None,
) -> type[BaseModel]:
    fields: dict[str, Any] = {}
    for field_name, field_info in model.model_fields.items():
        if exclude and field_name in exclude:
            continue
        fields[field_name] = (Optional[field_info.annotation], FieldInfo(default=None))
    return create_model(
        name or f"Partial{model.__name__}",
        __config__=model.model_config,
        **fields,
    )

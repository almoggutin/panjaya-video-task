from collections.abc import Callable
from typing import Any, TypeVar

F = TypeVar("F", bound=Callable[..., Any])

SKIP_IDEMPOTENCY_ATTR = "_skip_idempotency"


def skip_idempotency(func: F) -> F:
    any_func: Any = func
    any_func._skip_idempotency = True
    return func

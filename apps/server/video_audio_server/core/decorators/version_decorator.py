from typing import Any, Callable, TypeVar

from fastapi import APIRouter
from fastapi.routing import APIRoute

_T = TypeVar("_T")
_VERSIONS_ATTR = "_api_versions"


def version(*versions: int) -> Callable[[_T], _T]:
    def decorator(target: _T) -> _T:
        setattr(target, _VERSIONS_ATTR, set(versions))
        return target

    return decorator


def _get_versions(obj: Any) -> set[int] | None:
    return getattr(obj, _VERSIONS_ATTR, None)


def build_versioned_router(routers: list[APIRouter], v: int) -> APIRouter:
    out: APIRouter = APIRouter(prefix=f"/v{v}")
    for router in routers:
        router_versions: set[int] | None = _get_versions(router)
        if router_versions is not None and v not in router_versions:
            continue

        sub: APIRouter = APIRouter(prefix=router.prefix, tags=router.tags)
        for route in router.routes:
            if not isinstance(route, APIRoute):
                continue

            endpoint_versions: set[int] | None = _get_versions(route.endpoint)
            if endpoint_versions is None or v in endpoint_versions:
                sub.routes.append(route)

        out.include_router(sub)
    return out

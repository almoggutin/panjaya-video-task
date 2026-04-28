from fastapi import Request
from fastapi.responses import Response
from starlette.middleware.base import RequestResponseEndpoint


async def strip_server_header(
    request: Request, call_next: RequestResponseEndpoint
) -> Response:
    response = await call_next(request)
    if "server" in response.headers:
        del response.headers["server"]
    return response

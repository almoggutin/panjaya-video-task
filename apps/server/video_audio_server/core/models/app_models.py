from pydantic import BaseModel


class RootResponse(BaseModel):
    message: str


class LivenessResponse(BaseModel):
    status: str


class ReadinessResponse(BaseModel):
    status: str
    failing: list[str] | None = None


class AppStatusResponse(BaseModel):
    name: str
    description: str
    environment: str
    os: str
    free_ram_mb: int

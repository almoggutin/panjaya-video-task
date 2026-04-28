from dataclasses import dataclass


@dataclass
class TokenPairModel:
    access_token: str
    raw_refresh_token: str

from video_audio_server.core.models.error_models import ConflictError, UnauthorizedError
from video_audio_server.core.security import hash_password, verify_password
from video_audio_server.modules.auth.dtos.login_request_dto import LoginRequest
from video_audio_server.modules.auth.dtos.signup_request_dto import SignupRequest
from video_audio_server.modules.auth.models.token_model import TokenPairModel
from video_audio_server.modules.auth.services.token_service import TokenService
from video_audio_server.modules.users.dtos.user_create_dto import UserCreateData
from video_audio_server.modules.users.repositories.user_repository import UserRepository


class AuthService:
    def __init__(
        self,
        user_repo: UserRepository,
        token_service: TokenService,
    ) -> None:
        self._user_repo = user_repo
        self._token_service = token_service

    async def signup(self, request: SignupRequest) -> TokenPairModel:
        existing = await self._user_repo.find_by_email(request.email)
        if existing is not None:
            raise ConflictError("Email already registered")

        user = await self._user_repo.create(
            UserCreateData(
                email=request.email,
                first_name=request.first_name,
                last_name=request.last_name,
                hashed_password=hash_password(request.password),
            )
        )
        await self._user_repo.commit()

        return await self._token_service.issue_token_pair(user.id)

    async def login(self, request: LoginRequest) -> TokenPairModel:
        user = await self._user_repo.find_by_email(request.email)
        if user is None or not verify_password(request.password, user.hashed_password):
            raise UnauthorizedError("Invalid credentials")

        return await self._token_service.issue_token_pair(user.id)

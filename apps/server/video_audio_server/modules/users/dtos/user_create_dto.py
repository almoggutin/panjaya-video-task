from pydantic import BaseModel, EmailStr


class UserCreateData(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    hashed_password: str

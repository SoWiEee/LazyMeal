from pydantic import BaseModel, Field


class AuthRegisterRequest(BaseModel):
    username: str = Field(min_length=3, max_length=64, pattern=r"^[a-zA-Z0-9_.-]+$")
    password: str = Field(min_length=8, max_length=128)


class AuthLoginRequest(BaseModel):
    username: str
    password: str


class TokenRefreshRequest(BaseModel):
    refreshToken: str


class TokenPairResponse(BaseModel):
    accessToken: str
    refreshToken: str
    tokenType: str = "bearer"


class CurrentUserResponse(BaseModel):
    id: str
    username: str
    role: str


from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Literal
from datetime import datetime


class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8)
    # PII note: role is set to 'patient' by default; admin/professional assigned separately
    role: Literal["patient", "professional"] = "patient"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    name: str
    email: str
    role: str
    plan: str
    status: str
    createdAt: datetime


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class UserUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[Literal["patient", "professional", "admin"]] = None
    plan: Optional[Literal["free", "premium"]] = None
    status: Optional[Literal["active", "suspended"]] = None


class UpgradePremiumRequest(BaseModel):
    # Mock payment — in production replace with Stripe token
    payment_token: str = "mock_payment_token"

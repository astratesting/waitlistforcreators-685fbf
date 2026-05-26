from datetime import datetime
from pydantic import BaseModel, EmailStr, Field
from uuid import UUID, uuid4


class UserCreate(BaseModel):
    email: EmailStr
    referral_code: str | None = Field(default=None, max_length=64)


class UserLogin(BaseModel):
    email: EmailStr


class User(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    email: EmailStr
    referral_code: str
    waitlist_position: int
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ReferralCreate(BaseModel):
    referrer_id: UUID
    referred_email: EmailStr
    reward_tier: str = Field(default="starter", max_length=64)


class Referral(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    referrer_id: UUID
    referred_email: EmailStr
    reward_tier: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Analytics(BaseModel):
    total_signups: int
    referral_conversions: int
    growth_rate: float

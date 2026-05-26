from datetime import datetime, timedelta
from uuid import UUID
from models import Analytics, Referral, ReferralCreate, User, UserCreate

users: list[User] = []
referrals: list[Referral] = []


def _make_referral_code(email: str) -> str:
    prefix = ''.join(char for char in email.split('@')[0].upper() if char.isalnum())[:8] or 'CREATOR'
    return f'{prefix}-{len(users) + 1:04d}'


def create_user(payload: UserCreate) -> User:
    existing = get_user_by_email(payload.email)
    if existing:
        return existing

    user = User(
        email=payload.email,
        referral_code=payload.referral_code or _make_referral_code(payload.email),
        waitlist_position=len(users) + 1,
    )
    users.append(user)
    return user


def get_user_by_email(email: str) -> User | None:
    normalized = email.lower()
    return next((user for user in users if user.email.lower() == normalized), None)


def get_user(user_id: UUID) -> User | None:
    return next((user for user in users if user.id == user_id), None)


def get_user_by_referral_code(code: str) -> User | None:
    normalized = code.upper()
    return next((user for user in users if user.referral_code.upper() == normalized), None)


def list_users() -> list[User]:
    return sorted(users, key=lambda user: user.waitlist_position)


def create_referral(payload: ReferralCreate) -> Referral:
    referral = Referral(**payload.model_dump())
    referrals.append(referral)
    return referral


def list_referrals() -> list[Referral]:
    return referrals


def analytics() -> Analytics:
    now = datetime.utcnow()
    recent = [user for user in users if user.created_at >= now - timedelta(days=7)]
    previous = [user for user in users if now - timedelta(days=14) <= user.created_at < now - timedelta(days=7)]
    if not previous:
        growth = 100.0 if recent else 0.0
    else:
        growth = round(((len(recent) - len(previous)) / len(previous)) * 100, 2)
    return Analytics(total_signups=len(users), referral_conversions=len(referrals), growth_rate=growth)

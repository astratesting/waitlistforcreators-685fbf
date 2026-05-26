from fastapi import APIRouter, HTTPException
from database import analytics, create_referral, create_user, get_user_by_referral_code, list_referrals, list_users
from models import Analytics, Referral, ReferralCreate, User, UserCreate

router = APIRouter(prefix='/api', tags=['waitlist'])


@router.post('/waitlist', response_model=User)
def join_waitlist(payload: UserCreate, ref: str | None = None) -> User:
    user = create_user(payload)
    if ref:
        referrer = get_user_by_referral_code(ref)
        if referrer and referrer.email.lower() != user.email.lower():
            create_referral(ReferralCreate(referrer_id=referrer.id, referred_email=user.email, reward_tier='vip-launch-brief'))
    return user


@router.get('/waitlist', response_model=list[User])
def get_waitlist() -> list[User]:
    return list_users()


@router.get('/referrals', response_model=list[Referral])
def get_referrals() -> list[Referral]:
    return list_referrals()


@router.post('/referrals', response_model=Referral)
def add_referral(payload: ReferralCreate) -> Referral:
    return create_referral(payload)


@router.get('/referrals/{code}', response_model=User)
def get_referrer(code: str) -> User:
    user = get_user_by_referral_code(code)
    if not user:
        raise HTTPException(status_code=404, detail='Referral code not found')
    return user


@router.get('/analytics', response_model=Analytics)
def get_analytics() -> Analytics:
    return analytics()

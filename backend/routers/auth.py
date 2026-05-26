from fastapi import APIRouter, HTTPException
from database import create_user, get_user, get_user_by_email
from models import User, UserCreate, UserLogin

router = APIRouter(prefix='/auth', tags=['auth'])


@router.post('/register', response_model=User)
def register(payload: UserCreate) -> User:
    return create_user(payload)


@router.post('/login', response_model=User)
def login(payload: UserLogin) -> User:
    user = get_user_by_email(payload.email)
    if not user:
        raise HTTPException(status_code=404, detail='User not found')
    return user


@router.get('/me/{user_id}', response_model=User)
def me(user_id: str) -> User:
    user = get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail='User not found')
    return user

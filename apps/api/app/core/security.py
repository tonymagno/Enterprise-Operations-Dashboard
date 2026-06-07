from datetime import datetime, timedelta, timezone
from jose import jwt
from passlib.context import CryptContext

SECRET_KEY = "development-secret-key"
ALGORITHM = "HS256"

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


def hash_password(password: str):
    return pwd_context.hash(password)


def verify_password(
    plain_password: str,
    hashed_password: str
):
    return pwd_context.verify(
        plain_password,
        hashed_password
    )


def create_access_token(
    subject: str,
    expires_minutes: int = 30
):
    expire = datetime.now(
        timezone.utc
    ) + timedelta(
        minutes=expires_minutes
    )

    payload = {
        "sub": subject,
        "exp": expire,
        "type": "access"
    }

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


def create_refresh_token(
    subject: str
):
    expire = datetime.now(
        timezone.utc
    ) + timedelta(
        days=7
    )

    payload = {
        "sub": subject,
        "exp": expire,
        "type": "refresh"
    }

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )
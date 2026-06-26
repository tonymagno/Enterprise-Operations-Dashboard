from typing import TYPE_CHECKING

from app.core.security import hash_password
from app.models.user import User

if TYPE_CHECKING:
    # avoid runtime import errors with type checkers/linters when SQLAlchemy
    # isn't available in the environment; use a forward reference in annotations
    from sqlalchemy.orm import Session


def get_user_by_email(db: "Session", email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()


def get_user_by_id(db: "Session", user_id: int) -> User | None:
    return db.query(User).filter(User.id == user_id).first()


def get_users(
    db: "Session",
    skip: int = 0,
    limit: int = 20,
) -> list[User]:

    return (
        db.query(User)
        .order_by(User.id.asc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def create_user(
    db: "Session",
    name: str,
    email: str,
    password: str,
    role_id: int | None = None,
    is_active: bool = True,
) -> User:
    user = User(
        name=name,
        email=email,
        password_hash=hash_password(password),
        role_id=role_id,
        is_active=is_active,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def update_user(
    db: "Session",
    user: User,
    **kwargs,
) -> User:

    for key, value in kwargs.items():

        if value is None:
            continue

        if key == "password":
            user.password_hash = hash_password(value)
            continue

        setattr(user, key, value)

    db.commit()
    db.refresh(user)

    return user


def delete_user(
    db: "Session",
    user: User,
) -> None:

    db.delete(user)
    db.commit()
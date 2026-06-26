from sqlalchemy.orm import Session

from app.models.role import Role
from app.schemas.role import RoleCreate, RoleUpdate


def get_roles(db: Session):
    return db.query(Role).all()


def get_role(db: Session, role_id: int):
    return db.query(Role).filter(Role.id == role_id).first()


def create_role(db: Session, role: RoleCreate):
    db_role = Role(
        name=role.name,
        description=role.description
    )

    db.add(db_role)
    db.commit()
    db.refresh(db_role)

    return db_role


def update_role(
    db: Session,
    role_id: int,
    role_data: RoleUpdate
):
    role = get_role(db, role_id)

    if not role:
        return None

    update_data = role_data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(role, key, value)

    db.commit()
    db.refresh(role)

    return role


def delete_role(db: Session, role_id: int):
    role = get_role(db, role_id)

    if not role:
        return False

    db.delete(role)
    db.commit()

    return True
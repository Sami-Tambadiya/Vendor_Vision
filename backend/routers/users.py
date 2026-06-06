from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import get_db
import models

router = APIRouter(prefix="/api/users", tags=["users"])

class UserRegistration(BaseModel):
    uid: str
    email: str
    role: str

@router.post("/register")
def register_user(user: UserRegistration, db: Session = Depends(get_db)):
    """
    Save the user's selected role to the backend database upon Firebase registration.
    """
    if user.role not in ["Admin", "Manager", "Vendor", "Procurement Officer"]:
        raise HTTPException(status_code=400, detail="Invalid role specified.")
    
    # Restrict Admin creation via open endpoint
    if user.role == "Admin":
        raise HTTPException(status_code=403, detail="Cannot register as Admin.")

    db_user = db.query(models.User).filter(models.User.uid == user.uid).first()
    if not db_user:
        db_user = models.User(uid=user.uid, email=user.email, role=user.role)
        db.add(db_user)
        db.commit()
        
    return {"status": "success", "message": f"User {user.email} registered with role {user.role}"}

@router.get("/{uid}/role")
def get_user_role(uid: str, db: Session = Depends(get_db)):
    """
    Fetch the user's role upon login so the frontend can route to the correct dashboard.
    """
    db_user = db.query(models.User).filter(models.User.uid == uid).first()
    if not db_user:
        # Default fallback
        return {"role": "Admin"}
        
    return {"role": db_user.role.value if hasattr(db_user.role, 'value') else db_user.role}

class UserResponse(BaseModel):
    uid: str
    email: str
    role: str
    full_name: str | None
    
    class Config:
        orm_mode = True

@router.get("/", response_model=list[UserResponse])
def get_users(db: Session = Depends(get_db)):
    return db.query(models.User).all()

@router.delete("/{uid}")
def delete_user(uid: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.uid == uid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Don't allow deleting the last admin or something, but we keep it simple
    db.delete(user)
    db.commit()
    return {"status": "success"}

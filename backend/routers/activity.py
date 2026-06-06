from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from database import get_db
import models

router = APIRouter(prefix="/api/activity", tags=["activity"])

class ActivityLogResponse(BaseModel):
    id: int
    user_uid: str
    user_name: str
    action: str
    module: str
    details: str
    created_at: datetime
    
    class Config:
        orm_mode = True

@router.get("/", response_model=List[ActivityLogResponse])
def get_activity_logs(module: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(models.ActivityLog).order_by(models.ActivityLog.created_at.desc())
    if module:
        query = query.filter(models.ActivityLog.module == module)
        
    logs = query.all()
    result = []
    
    for log in logs:
        user = db.query(models.User).filter(models.User.uid == log.user_uid).first()
        u_name = log.user_uid
        if user:
            profile = db.query(models.VendorProfile).filter(models.VendorProfile.user_uid == user.uid).first()
            if profile and profile.company_name:
                u_name = profile.company_name
            elif user.full_name:
                u_name = user.full_name
        
        result.append({
            "id": log.id,
            "user_uid": log.user_uid,
            "user_name": u_name,
            "action": log.action,
            "module": log.module,
            "details": log.details,
            "created_at": log.created_at
        })
        
    return result

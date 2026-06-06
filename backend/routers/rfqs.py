from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from database import get_db
import models

router = APIRouter(prefix="/api/rfqs", tags=["rfqs"])

class RFQCreate(BaseModel):
    title: str
    category: str
    deadline: datetime
    description: Optional[str] = None
    budget: Optional[float] = None
    creator_id: Optional[str] = "admin_user_id" # hardcoded for testing if not auth

class RFQResponse(BaseModel):
    id: int
    rfq_number: str
    title: str
    category: str
    deadline: datetime
    status: str
    responses: int = 0
    
    class Config:
        orm_mode = True

@router.get("/", response_model=List[RFQResponse])
def get_rfqs(db: Session = Depends(get_db)):
    rfqs = db.query(models.RFQ).order_by(models.RFQ.created_at.desc()).all()
    result = []
    for rfq in rfqs:
        count = db.query(models.Quotation).filter(models.Quotation.rfq_id == rfq.id).count()
        r_dict = {
            "id": rfq.id,
            "rfq_number": rfq.rfq_number,
            "title": rfq.title,
            "category": rfq.category,
            "deadline": rfq.deadline,
            "status": rfq.status,
            "responses": count
        }
        result.append(r_dict)
    return result

@router.post("/", response_model=RFQResponse)
def create_rfq(rfq: RFQCreate, db: Session = Depends(get_db)):
    # Generate an RFQ number
    count = db.query(models.RFQ).count()
    rfq_number = f"RFQ-{datetime.now().year}-{str(count + 1).zfill(3)}"
    
    db_rfq = models.RFQ(
        rfq_number=rfq_number,
        title=rfq.title,
        category=rfq.category,
        deadline=rfq.deadline,
        description=rfq.description,
        budget=rfq.budget,
        status=models.RFQStatus.Sent, # Immediately visible to vendors
        creator_id=rfq.creator_id
    )
    db.add(db_rfq)
    db.commit()
    db.refresh(db_rfq)
    
    # Log the activity
    log = models.ActivityLog(
        user_uid=rfq.creator_id,
        action="Created RFQ",
        module="RFQ",
        details=f"Created {rfq_number}"
    )
    db.add(log)
    
    # Simulate vendor quotations so the Admin can test the workflow immediately
    vendors = ["vendor_techcorp_id", "vendor_technova_id"]
    prices = [rfq.budget * 0.95 if rfq.budget else 12000, rfq.budget * 0.98 if rfq.budget else 14500]
    days = [14, 10]
    
    for i in range(2):
        q = models.Quotation(
            rfq_id=db_rfq.id,
            vendor_id=vendors[i],
            price=prices[i],
            quantity=1,
            delivery_time_days=days[i],
            status="Submitted"
        )
        db.add(q)
        
    db.commit()
    
    return db_rfq

@router.get("/{rfq_id}", response_model=RFQResponse)
def get_rfq(rfq_id: int, db: Session = Depends(get_db)):
    rfq = db.query(models.RFQ).filter(models.RFQ.id == rfq_id).first()
    if not rfq:
        raise HTTPException(status_code=404, detail="RFQ not found")
    return rfq

class AllocateRequest(BaseModel):
    vendor_uid: str

@router.post("/{rfq_id}/allocate")
def allocate_rfq(rfq_id: int, req: AllocateRequest, db: Session = Depends(get_db)):
    rfq = db.query(models.RFQ).filter(models.RFQ.id == rfq_id).first()
    if not rfq:
        raise HTTPException(status_code=404, detail="RFQ not found")
        
    vendor = db.query(models.User).filter(models.User.uid == req.vendor_uid).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
        
    # Check if already allocated
    existing = db.query(models.RFQAllocation).filter(
        models.RFQAllocation.rfq_id == rfq_id,
        models.RFQAllocation.vendor_uid == req.vendor_uid
    ).first()
    
    if existing:
        return {"status": "success", "message": "Already allocated"}
        
    allocation = models.RFQAllocation(rfq_id=rfq_id, vendor_uid=req.vendor_uid)
    db.add(allocation)
    db.commit()
    return {"status": "success", "message": f"RFQ {rfq_id} allocated to vendor {req.vendor_uid}"}

@router.get("/vendor/{vendor_uid}", response_model=List[RFQResponse])
def get_vendor_rfqs(vendor_uid: str, db: Session = Depends(get_db)):
    # Get RFQs allocated to this vendor
    allocations = db.query(models.RFQAllocation).filter(models.RFQAllocation.vendor_uid == vendor_uid).all()
    rfq_ids = [a.rfq_id for a in allocations]
    
    rfqs = db.query(models.RFQ).filter(models.RFQ.id.in_(rfq_ids)).order_by(models.RFQ.created_at.desc()).all()
    
    result = []
    for rfq in rfqs:
        count = db.query(models.Quotation).filter(models.Quotation.rfq_id == rfq.id).count()
        r_dict = {
            "id": rfq.id,
            "rfq_number": rfq.rfq_number,
            "title": rfq.title,
            "category": rfq.category,
            "deadline": rfq.deadline,
            "status": rfq.status,
            "responses": count
        }
        result.append(r_dict)
    return result

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from database import get_db
import models

router = APIRouter(prefix="/api/quotations", tags=["quotations"])

class QuotationCreate(BaseModel):
    rfq_id: int
    vendor_id: str
    price: float
    delivery_time_days: int
    remarks: Optional[str] = None

class QuotationResponse(BaseModel):
    id: int
    rfq_id: int
    vendor_id: str
    vendor_name: str = ""
    price: float
    delivery_time_days: int
    status: str
    
    class Config:
        orm_mode = True

@router.post("/", response_model=QuotationResponse)
def submit_quotation(quote: QuotationCreate, db: Session = Depends(get_db)):
    db_quote = models.Quotation(
        rfq_id=quote.rfq_id,
        vendor_id=quote.vendor_id,
        price=quote.price,
        delivery_time_days=quote.delivery_time_days,
        remarks=quote.remarks,
        status="Submitted"
    )
    db.add(db_quote)
    
    # Also log activity
    log = models.ActivityLog(
        user_uid=quote.vendor_id,
        action="Submitted Quotation",
        module="Quotation",
        details=f"Submitted quote for RFQ ID {quote.rfq_id} with price {quote.price}"
    )
    db.add(log)
    
    db.commit()
    db.refresh(db_quote)
    return db_quote

@router.get("/rfq/{rfq_id}", response_model=List[QuotationResponse])
def get_quotations_for_rfq(rfq_id: int, db: Session = Depends(get_db)):
    quotes = db.query(models.Quotation).filter(models.Quotation.rfq_id == rfq_id).all()
    result = []
    for q in quotes:
        user = db.query(models.User).filter(models.User.uid == q.vendor_id).first()
        v_name = q.vendor_id
        if user:
            profile = db.query(models.VendorProfile).filter(models.VendorProfile.user_uid == user.uid).first()
            if profile and profile.company_name:
                v_name = profile.company_name
            elif user.full_name:
                v_name = user.full_name
        
        result.append({
            "id": q.id,
            "rfq_id": q.rfq_id,
            "vendor_id": q.vendor_id,
            "vendor_name": v_name,
            "price": q.price,
            "delivery_time_days": q.delivery_time_days,
            "status": q.status
        })
    return result

@router.get("", response_model=List[QuotationResponse])
def get_all_quotations(db: Session = Depends(get_db)):
    quotes = db.query(models.Quotation).order_by(models.Quotation.created_at.desc()).all()
    result = []
    for q in quotes:
        result.append({
            "id": q.id,
            "rfq_id": q.rfq_id,
            "vendor_id": q.vendor_id,
            "vendor_name": "Vendor",
            "price": q.price,
            "delivery_time_days": q.delivery_time_days,
            "status": q.status
        })
    return result

@router.post("/{quote_id}/approve")
def select_quotation(quote_id: int, db: Session = Depends(get_db)):
    quote = db.query(models.Quotation).filter(models.Quotation.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quotation not found")
        
    rfq = db.query(models.RFQ).filter(models.RFQ.id == quote.rfq_id).first()
    
    # Update quote statuses
    db.query(models.Quotation).filter(models.Quotation.rfq_id == quote.rfq_id).update({"status": "Rejected"})
    quote.status = "Selected"
    
    # Update RFQ status
    rfq.status = models.RFQStatus.Approval_Pending
    
    # Create Approval record
    new_approval = models.Approval(
        rfq_id=rfq.id,
        manager_id="manager_user_id", # Hardcoded to the seeded manager for now
        status="Pending"
    )
    db.add(new_approval)
    
    # Activity Log
    log = models.ActivityLog(
        user_uid="admin_user_id",
        action="Selected Quotation",
        module="Approval",
        details=f"Selected quote {quote_id} for RFQ {rfq.rfq_number}, initiated approval workflow."
    )
    db.add(log)
    
    db.commit()
    
    return {"status": "success", "message": "Quotation selected. Approval workflow initiated."}

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from datetime import datetime

from database import get_db
import models

router = APIRouter(prefix="/api/procurement", tags=["procurement"])

class POResponse(BaseModel):
    id: int
    po_number: str
    rfq_id: int
    vendor_id: str
    vendor_name: str = ""
    total_amount: float
    status: str
    created_at: datetime
    
    class Config:
        orm_mode = True

class InvoiceResponse(BaseModel):
    id: int
    invoice_number: str
    po_id: int
    amount: float
    status: str
    vendor_name: str = ""
    created_at: datetime
    
    class Config:
        orm_mode = True

@router.get("/purchase-orders", response_model=List[POResponse])
def get_purchase_orders(db: Session = Depends(get_db)):
    pos = db.query(models.PurchaseOrder).order_by(models.PurchaseOrder.created_at.desc()).all()
    result = []
    for po in pos:
        user = db.query(models.User).filter(models.User.uid == po.vendor_id).first()
        v_name = po.vendor_id
        if user:
            profile = db.query(models.VendorProfile).filter(models.VendorProfile.user_uid == user.uid).first()
            if profile and profile.company_name:
                v_name = profile.company_name
            elif user.full_name:
                v_name = user.full_name
        
        result.append({
            "id": po.id,
            "po_number": po.po_number,
            "rfq_id": po.rfq_id,
            "vendor_id": po.vendor_id,
            "vendor_name": v_name,
            "total_amount": po.total_amount,
            "status": po.status,
            "created_at": po.created_at
        })
    return result

@router.get("/invoices", response_model=List[InvoiceResponse])
def get_invoices(db: Session = Depends(get_db)):
    invoices = db.query(models.Invoice).order_by(models.Invoice.created_at.desc()).all()
    result = []
    for inv in invoices:
        po = db.query(models.PurchaseOrder).filter(models.PurchaseOrder.id == inv.po_id).first()
        v_name = ""
        if po:
            user = db.query(models.User).filter(models.User.uid == po.vendor_id).first()
            v_name = po.vendor_id
            if user:
                profile = db.query(models.VendorProfile).filter(models.VendorProfile.user_uid == user.uid).first()
                if profile and profile.company_name:
                    v_name = profile.company_name
                elif user.full_name:
                    v_name = user.full_name
                    
        result.append({
            "id": inv.id,
            "invoice_number": inv.invoice_number,
            "po_id": inv.po_id,
            "amount": inv.amount,
            "status": inv.status,
            "vendor_name": v_name,
            "created_at": inv.created_at
        })
    return result

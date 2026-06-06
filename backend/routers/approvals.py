from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from datetime import datetime

from database import get_db
import models

router = APIRouter(prefix="/api/approvals", tags=["approvals"])

class ApprovalResponse(BaseModel):
    id: int
    rfq_id: int
    manager_id: str
    status: str
    remarks: str | None
    created_at: datetime
    rfq_number: str | None = None
    vendor_name: str | None = None
    amount: float | None = None

    class Config:
        orm_mode = True

@router.get("/", response_model=List[ApprovalResponse])
def get_approvals(db: Session = Depends(get_db)):
    approvals = db.query(models.Approval).order_by(models.Approval.created_at.desc()).all()
    result = []
    for app in approvals:
        rfq = db.query(models.RFQ).filter(models.RFQ.id == app.rfq_id).first()
        rfq_number = rfq.rfq_number if rfq else f"RFQ-{app.rfq_id}"
        
        # Get selected quotation for amount and vendor
        quote = db.query(models.Quotation).filter(models.Quotation.rfq_id == app.rfq_id, models.Quotation.status == "Selected").first()
        amount = quote.price if quote else 0.0
        
        vendor_name = "Unknown Vendor"
        if quote:
            vendor = db.query(models.User).filter(models.User.uid == quote.vendor_id).first()
            if vendor:
                vendor_name = vendor.full_name or vendor.email
                
        result.append({
            "id": app.id,
            "rfq_id": app.rfq_id,
            "manager_id": app.manager_id,
            "status": app.status,
            "remarks": app.remarks,
            "created_at": app.created_at,
            "rfq_number": rfq_number,
            "vendor_name": vendor_name,
            "amount": amount
        })
    return result

@router.post("/{approval_id}/approve")
def approve_request(approval_id: int, db: Session = Depends(get_db)):
    approval = db.query(models.Approval).filter(models.Approval.id == approval_id).first()
    if not approval:
        raise HTTPException(status_code=404, detail="Approval not found")
        
    approval.status = "Approved"
    
    rfq = db.query(models.RFQ).filter(models.RFQ.id == approval.rfq_id).first()
    rfq.status = models.RFQStatus.Approved
    
    # Get the selected quotation
    quote = db.query(models.Quotation).filter(models.Quotation.rfq_id == rfq.id, models.Quotation.status == "Selected").first()
    if not quote:
        raise HTTPException(status_code=400, detail="No selected quotation found for this RFQ")
        
    quote.status = "Approved"
    
    # Generate Purchase Order
    count_po = db.query(models.PurchaseOrder).count()
    po_number = f"PO-{datetime.now().year}-{str(count_po + 1).zfill(4)}"
    
    new_po = models.PurchaseOrder(
        po_number=po_number,
        rfq_id=rfq.id,
        vendor_id=quote.vendor_id,
        total_amount=quote.price,
        status="Generated"
    )
    db.add(new_po)
    db.commit()
    db.refresh(new_po)
    
    # Generate Invoice
    count_inv = db.query(models.Invoice).count()
    inv_number = f"INV-{str(count_inv + 1).zfill(4)}"
    
    new_inv = models.Invoice(
        invoice_number=inv_number,
        po_id=new_po.id,
        amount=quote.price,
        status="Pending"
    )
    db.add(new_inv)
    
    # Activity Log
    log = models.ActivityLog(
        user_uid="manager_user_id",
        action="Approved Request & Generated PO",
        module="Approval",
        details=f"Approved request {approval_id}, generated {po_number} and {inv_number}"
    )
    db.add(log)
    
    db.commit()
    
    return {"status": "success", "po_number": po_number, "invoice_number": inv_number}

@router.post("/{approval_id}/reject")
def reject_request(approval_id: int, db: Session = Depends(get_db)):
    approval = db.query(models.Approval).filter(models.Approval.id == approval_id).first()
    if not approval:
        raise HTTPException(status_code=404, detail="Approval not found")
        
    approval.status = "Rejected"
    
    rfq = db.query(models.RFQ).filter(models.RFQ.id == approval.rfq_id).first()
    rfq.status = models.RFQStatus.Comparison_Pending
    
    db.commit()
    return {"status": "success", "message": "Request rejected."}

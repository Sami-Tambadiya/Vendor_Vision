from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import datetime

from database import get_db
import models

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

class AdminMetrics(BaseModel):
    total_procurement_value: float
    active_vendors: int
    pending_approvals: int
    pos_generated: int
    chart_labels: List[str]
    chart_data: List[float]
    overdue_rfqs: int
    approval_bottlenecks: int
    high_priority: int

@router.get("/admin", response_model=AdminMetrics)
def get_admin_dashboard_metrics(db: Session = Depends(get_db)):
    # Calculate real total procurement value from POs
    total_value = db.query(func.sum(models.PurchaseOrder.total_amount)).scalar() or 0.0
    
    # Active vendors
    active_vendors = db.query(models.VendorProfile).filter(models.VendorProfile.status == "Active").count()
    
    # Pending approvals
    pending_approvals = db.query(models.Approval).filter(models.Approval.status == "Pending").count()
    
    # POs generated
    pos_generated = db.query(models.PurchaseOrder).count()
    
    # Calculate real spend per month from POs
    pos = db.query(models.PurchaseOrder).all()
    
    # Simple aggregation by month name
    month_map = {}
    for po in pos:
        month_name = po.created_at.strftime('%b') # e.g. 'Jan', 'Feb'
        if month_name not in month_map:
            month_map[month_name] = 0
        month_map[month_name] += po.total_amount
        
    # We want chronological order for the current year
    # Just creating a generic sorted array for demo
    sorted_months = sorted(month_map.keys(), key=lambda m: datetime.strptime(m, '%b').month)
    
    chart_labels = sorted_months if len(sorted_months) > 0 else ['Jan', 'Feb', 'Mar']
    chart_data = [month_map[m] for m in sorted_months] if len(sorted_months) > 0 else [0, 0, 0]
    
    return AdminMetrics(
        total_procurement_value=total_value,
        active_vendors=active_vendors,
        pending_approvals=pending_approvals,
        pos_generated=pos_generated,
        chart_labels=chart_labels,
        chart_data=chart_data,
        overdue_rfqs=0,
        approval_bottlenecks=0,
        high_priority=0
    )

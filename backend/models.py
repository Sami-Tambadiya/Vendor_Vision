from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text, Enum, Boolean
from sqlalchemy.orm import relationship
import enum
from database import Base
import datetime

class RoleEnum(str, enum.Enum):
    Admin = "Admin"
    Manager = "Manager"
    Vendor = "Vendor"
    Officer = "Procurement Officer"

class RFQStatus(str, enum.Enum):
    Draft = "Draft"
    Sent = "Sent"
    Comparison_Pending = "Comparison Pending"
    Approval_Pending = "Approval Pending"
    Approved = "Approved"

class User(Base):
    __tablename__ = "users"
    
    uid = Column(String, primary_key=True, index=True) # Firebase UID
    email = Column(String, unique=True, index=True)
    full_name = Column(String, nullable=True)
    role = Column(Enum(RoleEnum))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    # Relationships
    rfqs_created = relationship("RFQ", back_populates="creator")
    quotations = relationship("Quotation", back_populates="vendor")
    vendor_profile = relationship("VendorProfile", back_populates="user", uselist=False)

class VendorProfile(Base):
    __tablename__ = "vendor_profiles"
    id = Column(Integer, primary_key=True, index=True)
    user_uid = Column(String, ForeignKey("users.uid"))
    company_name = Column(String)
    category = Column(String)
    status = Column(String, default="Pending") # Pending, Active, Inactive
    contact_number = Column(String, nullable=True)
    address = Column(Text, nullable=True)
    
    user = relationship("User", back_populates="vendor_profile")

class RFQAllocation(Base):
    __tablename__ = "rfq_allocations"
    
    id = Column(Integer, primary_key=True, index=True)
    rfq_id = Column(Integer, ForeignKey("rfqs.id"))
    vendor_uid = Column(String, ForeignKey("users.uid"))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class RFQ(Base):
    __tablename__ = "rfqs"
    
    id = Column(Integer, primary_key=True, index=True)
    rfq_number = Column(String, unique=True, index=True)
    title = Column(String)
    category = Column(String)
    deadline = Column(DateTime)
    description = Column(Text, nullable=True)
    budget = Column(Float, nullable=True)
    status = Column(Enum(RFQStatus), default=RFQStatus.Draft)
    creator_id = Column(String, ForeignKey("users.uid"))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    creator = relationship("User", back_populates="rfqs_created")
    quotations = relationship("Quotation", back_populates="rfq")
    approvals = relationship("Approval", back_populates="rfq")
    purchase_orders = relationship("PurchaseOrder", back_populates="rfq")
    allocations = relationship("RFQAllocation", backref="rfq")

class Quotation(Base):
    __tablename__ = "quotations"
    
    id = Column(Integer, primary_key=True, index=True)
    rfq_id = Column(Integer, ForeignKey("rfqs.id"))
    vendor_id = Column(String, ForeignKey("users.uid"))
    price = Column(Float)
    quantity = Column(Integer, default=1)
    delivery_time_days = Column(Integer)
    remarks = Column(Text, nullable=True)
    status = Column(String, default="Submitted") # Submitted, Selected, Rejected
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    rfq = relationship("RFQ", back_populates="quotations")
    vendor = relationship("User", back_populates="quotations")

class Approval(Base):
    __tablename__ = "approvals"
    
    id = Column(Integer, primary_key=True, index=True)
    rfq_id = Column(Integer, ForeignKey("rfqs.id"))
    manager_id = Column(String, ForeignKey("users.uid"))
    status = Column(String, default="Pending") # Pending, Approved, Rejected
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    rfq = relationship("RFQ", back_populates="approvals")

class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"
    
    id = Column(Integer, primary_key=True, index=True)
    po_number = Column(String, unique=True, index=True)
    rfq_id = Column(Integer, ForeignKey("rfqs.id"))
    vendor_id = Column(String, ForeignKey("users.uid"))
    total_amount = Column(Float)
    status = Column(String, default="Generated") # Generated, Sent, Accepted
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    rfq = relationship("RFQ", back_populates="purchase_orders")
    invoice = relationship("Invoice", back_populates="purchase_order", uselist=False)

class Invoice(Base):
    __tablename__ = "invoices"
    
    id = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(String, unique=True, index=True)
    po_id = Column(Integer, ForeignKey("purchase_orders.id"))
    amount = Column(Float)
    status = Column(String, default="Pending") # Pending, Paid
    document_url = Column(String, nullable=True) # For Supabase Storage URL
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    purchase_order = relationship("PurchaseOrder", back_populates="invoice")

class ActivityLog(Base):
    __tablename__ = "activity_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_uid = Column(String, ForeignKey("users.uid"), nullable=True) # Null for System
    action = Column(String) # e.g., "Generated PO", "Approved Quotation"
    module = Column(String) # RFQ, PO, User
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_uid = Column(String, ForeignKey("users.uid"))
    message = Column(String)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

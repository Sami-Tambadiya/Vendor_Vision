import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base, User, RoleEnum, VendorProfile

from database import engine, SessionLocal

def seed_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # Check if we already seeded
    if db.query(User).count() > 0:
        print("Database already seeded.")
        return
        
    print("Seeding database...")
    
    # 1. Add Users
    admin = User(uid="admin_user_id", email="admin@vendorbridge.local", full_name="John Smith", role=RoleEnum.Admin)
    manager = User(uid="manager_user_id", email="manager@vendorbridge.local", full_name="Sarah Jenkins", role=RoleEnum.Manager)
    officer = User(uid="officer_user_id", email="officer@vendorbridge.local", full_name="Mike Procurement", role=RoleEnum.Officer)
    vendor1 = User(uid="vendor_techcorp_id", email="contact@techcorp.com", full_name="TechCorp Contact", role=RoleEnum.Vendor)
    vendor2 = User(uid="vendor_technova_id", email="orders@technova.example.com", full_name="TechNova Sales", role=RoleEnum.Vendor)
    
    db.add_all([admin, manager, officer, vendor1, vendor2])
    db.commit()
    
    # 2. Add Vendor Profiles
    vp1 = VendorProfile(user_uid="vendor_techcorp_id", company_name="TechCorp Ltd", category="IT Equipment", status="Active", contact_number="+1 555-0101")
    vp2 = VendorProfile(user_uid="vendor_technova_id", company_name="TechNova Solutions", category="Networking", status="Active", contact_number="+1 555-0199")
    
    db.add_all([vp1, vp2])
    db.commit()
    
    print("Database seeding completed.")

if __name__ == "__main__":
    seed_db()

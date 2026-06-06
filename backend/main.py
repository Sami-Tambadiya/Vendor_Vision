from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from database import engine, Base
import models

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="VendorBridge ERP API",
    description="Backend API for VendorBridge Procurement ERP",
    version="1.0.0"
)

# Enable CORS so the React frontend can communicate with this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from routers.users import router as users_router
from routers.dashboard import router as dashboard_router
from routers.rfqs import router as rfqs_router
from routers.quotations import router as quotations_router
from routers.procurement import router as procurement_router
from routers.approvals import router as approvals_router
from routers.activity import router as activity_router

class UserStatus(BaseModel):
    status: str
    message: str

app.include_router(users_router)
app.include_router(dashboard_router)
app.include_router(rfqs_router)
app.include_router(quotations_router)
app.include_router(procurement_router)
app.include_router(approvals_router)
app.include_router(activity_router)

@app.get("/")
def read_root():
    return {"message": "Welcome to VendorBridge ERP API"}

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "Odoo Integration Layer"}

# Example protected route structure that will later verify Firebase tokens
@app.get("/api/auth/status", response_model=UserStatus)
def get_auth_status():
    return {"status": "success", "message": "Backend is running and accessible."}

if __name__ == "__main__":
    import uvicorn
    # Run the server on port 8000
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

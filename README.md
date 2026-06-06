# VendorVision

<div align="center">
  <h3>Procurement & Vendor Management ERP </h3>
  <p>Digitize, Streamline, and Automate Your Enterprise Procurement Operations.</p>
</div>

---

## 📖 Project Overview

**VendorVision** is an enterprise-grade Procurement & Vendor Management ERP platform designed to modernize and streamline procurement operations for organizations of all sizes. 

Traditional procurement is often bogged down by manual tracking, scattered communications, and inefficient approval loops. VendorVision solves this by centralizing the entire lifecycle—from vendor onboarding and RFQ creation to quotation comparisons, multi-tier approvals, purchase orders, and invoicing—all within a single, transparent, and intelligent platform.

Our objective is to eliminate manual bottlenecks, providing a structured, automated enterprise workflow that enhances visibility, accelerates decision-making, and fosters stronger vendor relationships.

## 🎯 Problem Statement

Modern organizations face significant challenges in procurement:
- **Scattered Communication:** Managing RFQs and quotations via email leads to lost data and delayed responses.
- **Lack of Transparency:** Approvers lack real-time visibility into vendor selection and pricing logic.
- **Manual Bottlenecks:** Generating Purchase Orders and Invoices manually is error-prone and time-consuming.
- **Poor Vendor Management:** Tracking vendor performance and compliance is difficult without a centralized system.

**VendorVision** addresses these challenges by introducing a unified, real-time platform where stakeholders collaborate seamlessly, backed by robust analytics and automated document generation.

---

## ✨ Key Features

- **Vendor Registration & Management:** Seamless vendor onboarding and profile management.
- **RFQ Creation:** Effortlessly create, broadcast, and allocate Requests for Quotation.
- **Vendor Quotations:** A dedicated portal for vendors to submit and track their competitive bids.
- **Quotation Comparison:** Side-by-side comparison tools for Procurement Officers to select the best vendor.
- **Approval Workflow:** Streamlined, multi-role approval queues for Managers/Admins.
- **Purchase Orders:** Automated PO generation upon quotation approval.
- **Invoice Generation:** Automated invoice tracking synced with POs.
- **PDF Downloads:** Export POs and Invoices as professional PDF documents.
- **Email Notifications:** Keep all stakeholders informed with automated alerts.
- **Activity Logs:** Comprehensive audit trails for compliance and tracking.
- **Reports & Analytics:** Real-time dashboards visualizing spend analytics and procurement efficiency.

---

## 👥 User Roles & Permissions

VendorVision utilizes strict Role-Based Access Control (RBAC) to ensure security and operational integrity.

### 🛡️ Admin
- **Manage Users:** Complete control over system access and role assignments.
- **Manage Vendors:** Oversee vendor directories and compliance.
- **View Analytics:** Access enterprise-wide procurement analytics and spend reports.

### 🏢 Procurement Officer
- **Create RFQs:** Draft and publish requirements.
- **Compare Quotations:** Analyze vendor bids and recommend selections.
- **Generate Purchase Orders:** Process approved quotations into POs.
- **Generate Invoices:** Manage billing and invoice records.

### 🏪 Vendor
- **Submit Quotations:** Bid on allocated RFQs through a private portal.
- **Track RFQ Status:** Real-time updates on bid outcomes.
- **View Purchase Orders:** Access and fulfill approved orders.

### 💼 Manager / Approver
- **Approve Requests:** Review recommended quotations and budget allocations.
- **Reject Requests:** Send back quotations with remarks.
- **Monitor Workflow:** Oversee the procurement pipeline to ensure efficiency.

---

## 🔄 Procurement Workflow

The system enforces a strict, transparent enterprise pipeline:

```mermaid
graph TD
    A[RFQ Creation] --> B[Vendor Invitation / Allocation]
    B --> C[Quotation Submission]
    C --> D[Quotation Comparison]
    D --> E{Approval Workflow}
    E -- Approved --> F[Purchase Order Generation]
    E -- Rejected --> C
    F --> G[Invoice Generation]
    G --> H[Email & PDF Distribution]
    H --> I[Activity Tracking & Analytics]
```

---

## 💻 Technology Stack

VendorVision is built using modern, scalable, and secure technologies suitable for enterprise deployment.

### Frontend
- **React.js** - UI Library
- **TypeScript** - Type Safety
- **Tailwind CSS** - Styling & Responsive Design
- **React Router DOM** - Navigation
- **Axios** - API Client

### Backend
- **Python (FastAPI)** - High-performance asynchronous API framework
- **Odoo Framework** - Core ERP logic and structures
- **Odoo ORM** - Database mapping
- **REST APIs** - Client-server communication

### Database
- **Supabase (PostgreSQL)** - Scalable relational database

### Authentication & Security
- **Firebase Authentication** - Secure user identity management
- **Role-Based Access Control (RBAC)** - Custom claims and middleware

### Storage & Reporting
- **Firebase Storage** - Document and asset management
- **Chart.js** - Data visualization and analytics
- **Odoo QWeb Reports** - PDF document generation

### DevOps & Version Control
- **Git & GitHub** - Source code management
- **Firebase Cloud Messaging (FCM)** - Push notifications

---

## 🏗️ System Architecture

```text
User Device (Browser)
       │
       ▼
React Frontend (TS + Tailwind)
       │
       ▼
REST APIs (Axios)
       │
       ▼
Python + FastAPI / Odoo ERP Engine
       │
       ├──► Supabase PostgreSQL (Core Data)
       │
       ├──► Firebase Authentication (Identity)
       │
       ├──► Firebase Storage (Documents)
       │
       └──► Reporting Engine & Notifications (FCM)
```

---

## 🗄️ Database Modules

The relational schema is designed for data integrity and comprehensive auditing:
- **Users:** System identities and authentication links.
- **Roles:** RBAC definitions.
- **Vendors:** Extended business profiles.
- **RFQs:** Requirements and deadlines.
- **Quotations:** Bids, pricing, and delivery metrics.
- **Approvals:** Multi-tier authorization records.
- **Purchase Orders:** Financial commitments.
- **Invoices:** Billing and payment tracking.
- **Notifications:** System alerts.
- **Activity Logs:** Immutable audit trails.

---

## 📦 Core Modules

1. **Authentication Module:** Secure login, registration, and session handling.
2. **Vendor Management Module:** Directory, compliance, and onboarding.
3. **RFQ Management Module:** Drafting, publishing, and allocation logic.
4. **Quotation Management Module:** Bidding portal and comparison engine.
5. **Approval Workflow Module:** Hierarchical decision matrices.
6. **Purchase Order Module:** Automated financial document generation.
7. **Invoice Module:** Billing lifecycle management.
8. **Activity Logs Module:** System-wide action tracking.
9. **Reports & Analytics Module:** Spend analysis and operational metrics.

---

## 🔒 Security Features

- **Firebase Authentication:** Industry-standard secure login (Email/Password & Google OAuth).
- **Role-Based Access Control (RBAC):** UI and API-level endpoint protection ensuring users only access authorized data.
- **Protected Routes:** React router guards preventing unauthorized navigation.
- **Session Management:** Secure token handling and expiration.
- **Audit Logging:** Every critical action (RFQ creation, Approval, PO generation) is permanently logged with timestamps and user IDs.

---

## 🚀 Installation Guide

### Prerequisites
- Node.js (v18+)
- Python (3.9+)
- Firebase Account
- Supabase Account

### Environment Setup
Create a `.env` file in the `backend/` directory:
```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.supabase.co:5432/postgres
```

Create a `.env` file in the `frontend/` directory (or configure `firebase.ts`):
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
```

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```
*(Backend runs on http://localhost:8000)*

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*(Frontend runs on http://localhost:5173)*

### Build for Production
```bash
npm run build
```

---

## 🔮 Future Enhancements

We are continuously innovating. Our roadmap includes:
- **AI Vendor Recommendation:** Machine learning models to suggest the best vendor based on historical performance and RFQ requirements.
- **Smart Vendor Scoring:** Automated calculation of vendor reliability, pricing competitiveness, and delivery speed.
- **Predictive Procurement Analytics:** Forecasting material costs and predicting supply chain delays.
- **Automated Approval Suggestions:** AI-driven risk assessment for pending approvals.
- **AI Procurement Assistant:** An integrated chatbot to help officers draft RFQs and query spend data naturally.

---

## 👥 Team Information

- **[Team Leader]** - Trivedi Rutva 
- **[Team Member 1]** - Tambadiya Sami 
- **[Team Member 2]** - Patel Parth
- **[Team Member 3]** - lakhsinh asfak

---


---
<div align="center">
  <i>Built with ❤️ for the Hackathon</i>
</div>

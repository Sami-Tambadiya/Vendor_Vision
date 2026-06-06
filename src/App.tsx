import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Auth from './pages/auth/Auth';
import Dashboard from './pages/dashboard/Dashboard';
import PurchaseOrders from './pages/finance/PurchaseOrders';

// Mock ProtectedRoute component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { userRole, currentUser } = useAuth();
  
  // For demo: if no role is set or no user, redirect to login
  if (!userRole || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

import AdminVendors from './pages/admin/AdminVendors';
import AdminRFQs from './pages/admin/AdminRFQs';
import AdminQuotations from './pages/admin/AdminQuotations';
import AdminApprovals from './pages/admin/AdminApprovals';
import AdminActivity from './pages/admin/AdminActivity';
import AdminInvoices from './pages/admin/AdminInvoices';
import AdminReports from './pages/admin/AdminReports';

import AdminUsers from './pages/admin/AdminUsers';

import VendorRFQs from './pages/dashboard/VendorRFQs';
import VendorPOs from './pages/dashboard/VendorPOs';

import ManagerRequests from './pages/dashboard/ManagerRequests';
import ManagerVendorReview from './pages/dashboard/ManagerVendorReview';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Auth />} />
      <Route path="/register" element={<Auth />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      
      {/* Protected Routes inside Dashboard Layout */}
      <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="rfqs" element={<AdminRFQs />} />
        <Route path="vendors" element={<AdminVendors />} />
        <Route path="quotations" element={<AdminQuotations />} />
        <Route path="approvals" element={<AdminApprovals />} />
        <Route path="pos" element={<PurchaseOrders />} />
        <Route path="invoices" element={<AdminInvoices />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="activity" element={<AdminActivity />} />
        
        {/* Vendor Routes */}
        <Route path="vendor-rfqs" element={<VendorRFQs />} />
        <Route path="vendor-pos" element={<VendorPOs />} />

        {/* Manager Routes */}
        <Route path="requests" element={<ManagerRequests />} />
        <Route path="vendor-review" element={<ManagerVendorReview />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

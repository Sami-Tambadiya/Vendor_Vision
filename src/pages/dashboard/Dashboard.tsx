import { useAuth } from '../../contexts/AuthContext';
import AdminDashboard from './AdminDashboard';
import ProcurementDashboard from './ProcurementDashboard';
import ManagerDashboard from './ManagerDashboard';
import VendorDashboard from './VendorDashboard';

const Dashboard = () => {
  const { userRole } = useAuth();

  switch (userRole) {
    case 'Admin':
      return <AdminDashboard />;
    case 'Procurement Officer':
      return <ProcurementDashboard />;
    case 'Manager':
      return <ManagerDashboard />;
    case 'Vendor':
      return <VendorDashboard />;
    default:
      // Fallback or loading state
      return <AdminDashboard />;
  }
};

export default Dashboard;

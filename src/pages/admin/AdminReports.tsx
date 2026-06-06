import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import axios from 'axios';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminReports = () => {
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/dashboard/admin');
      setMetrics(response.data);
    } catch (error) {
      console.error("Error fetching admin metrics:", error);
    }
  };

  if (!metrics) {
    return <div className="p-8 text-on-surface-variant">Loading reports...</div>;
  }

  const data = {
    labels: metrics.chart_labels,
    datasets: [{
      label: 'Procurement Spend (₹)',
      data: metrics.chart_data,
      backgroundColor: '#004ac6',
      borderRadius: 4,
    }]
  };

  return (
    <div className="bg-background relative">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="font-display-lg text-[32px] font-bold text-on-surface">Reports & Analytics</h2>
          <p className="font-body-md text-on-surface-variant mt-1">Real-time spend and operations overview</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="glass-card rounded-2xl p-6 border border-outline-variant/30 text-center">
          <p className="font-label-mono text-[11px] text-outline uppercase tracking-wider mb-2">Total Spend</p>
          <p className="font-display-lg text-[32px] font-bold text-primary">₹{metrics.total_procurement_value.toLocaleString()}</p>
        </div>
        <div className="glass-card rounded-2xl p-6 border border-[#16a34a]/30 text-center">
           <p className="font-label-mono text-[11px] text-[#16a34a] uppercase tracking-wider mb-2">Active Vendors</p>
          <p className="font-display-lg text-[32px] font-bold text-[#16a34a]">{metrics.active_vendors}</p>
        </div>
        <div className="glass-card rounded-2xl p-6 border border-[#d97706]/30 text-center">
           <p className="font-label-mono text-[11px] text-[#d97706] uppercase tracking-wider mb-2">Pending Approvals</p>
          <p className="font-display-lg text-[32px] font-bold text-[#d97706]">{metrics.pending_approvals}</p>
        </div>
      </div>
      <div className="glass-card rounded-2xl border border-outline-variant/30 p-8">
         <h3 className="font-title-sm text-[18px] font-bold mb-6">Spend Analysis</h3>
         <div className="h-[300px] w-full flex items-center justify-center">
            <Bar data={data} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
         </div>
      </div>
    </div>
  );
};

export default AdminReports;

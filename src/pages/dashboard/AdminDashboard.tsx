import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface AdminMetrics {
  total_procurement_value: number;
  active_vendors: number;
  pending_approvals: number;
  pos_generated: number;
  chart_labels: string[];
  chart_data: number[];
  overdue_rfqs: number;
  approval_bottlenecks: number;
  high_priority: number;
}

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/dashboard/admin');
      setMetrics(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching admin metrics", error);
    }
  };

  // Poll for real-time updates every 5 seconds
  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleExportPDF = async () => {
    setLoading(true);
    const reportElement = document.getElementById('pdf-analytical-report');
    if (!reportElement) {
      setLoading(false);
      return;
    }
    
    try {
      // Use higher scale for crisp text
      const canvas = await html2canvas(reportElement, { scale: 3, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4'); // Portrait mode for report
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`VendorVision_Analysis_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error("Error generating PDF", error);
    } finally {
      setLoading(false);
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { display: false, min: 0 }, x: { display: false } },
    elements: { line: { tension: 0.4 } },
    animation: { duration: 0 } // Disable animation for smoother polling
  };

  const chartData = {
    labels: metrics?.chart_labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      fill: true,
      label: 'Procurement Spend Trend',
      data: metrics?.chart_data || [0, 0, 0, 0, 0, 0],
      borderColor: '#004ac6',
      backgroundColor: 'rgba(0, 74, 198, 0.1)',
      borderWidth: 2,
      pointBackgroundColor: '#004ac6',
    }]
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumSignificantDigits: 3 }).format(value);
  };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div id="dashboard-content" className="bg-background">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="font-display-lg text-[32px] font-bold text-on-surface">CEO Command Center</h2>
          <p className="font-body-md text-on-surface-variant mt-1">Premium Executive Dashboard (Live Updates)</p>
        </div>
        <button onClick={handleExportPDF} className="px-4 py-2 glass-card rounded-lg font-body-sm font-semibold text-primary flex items-center gap-2 hover:bg-primary/5">
          <span className="material-symbols-outlined text-[18px]">download</span> Export PDF
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="glass-card rounded-xl p-5 hover:-translate-y-1 transition-transform flex flex-col justify-between h-[140px]">
          <div className="flex justify-between items-start">
            <span className="font-label-mono text-[11px] text-outline uppercase">Total Procurement Value</span>
            <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
          </div>
          <div><div className="font-display-lg text-[32px] font-bold">{formatCurrency(metrics?.total_procurement_value || 0)}</div></div>
        </div>
        <div className="glass-card rounded-xl p-5 hover:-translate-y-1 transition-transform flex flex-col justify-between h-[140px]">
          <div className="flex justify-between items-start">
            <span className="font-label-mono text-[11px] text-outline uppercase">Active Vendors</span>
            <span className="material-symbols-outlined text-success">storefront</span>
          </div>
          <div><div className="font-display-lg text-[32px] font-bold">{metrics?.active_vendors}</div></div>
        </div>
        <div className="glass-card rounded-xl p-5 hover:-translate-y-1 transition-transform flex flex-col justify-between h-[140px]">
          <div className="flex justify-between items-start">
            <span className="font-label-mono text-[11px] text-outline uppercase">Pending Approvals</span>
            <span className="material-symbols-outlined text-error">pending_actions</span>
          </div>
          <div><div className="font-display-lg text-[32px] font-bold text-error">{metrics?.pending_approvals}</div></div>
        </div>
        <div className="glass-card rounded-xl p-5 hover:-translate-y-1 transition-transform flex flex-col justify-between h-[140px]">
          <div className="flex justify-between items-start">
            <span className="font-label-mono text-[11px] text-outline uppercase">POs Generated</span>
            <span className="material-symbols-outlined text-tertiary-container">receipt_long</span>
          </div>
          <div><div className="font-display-lg text-[32px] font-bold">{metrics?.pos_generated}</div></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 glass-card rounded-xl p-6 min-h-[380px] flex flex-col">
          <h3 className="font-title-sm text-[18px] mb-6">Procurement Spend Trend (Real-time)</h3>
          <div className="flex-1 bg-surface-container-lowest/50 rounded-lg p-4"><Line data={chartData} options={chartOptions} /></div>
        </div>
        <div className="glass-card rounded-xl p-6 min-h-[380px] flex flex-col">
          <h3 className="font-title-sm text-[18px] mb-6 text-error">Procurement Health Center</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-error/5 rounded-lg border border-error/10">
              <span className="font-body-sm text-on-surface">Overdue RFQs</span>
              <span className="font-bold text-error">{metrics?.overdue_rfqs}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-warning/5 rounded-lg border border-warning/10">
              <span className="font-body-sm text-on-surface">Approval Bottlenecks</span>
              <span className="font-bold text-warning">{metrics?.approval_bottlenecks}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-tertiary-container/5 rounded-lg border border-tertiary-container/10">
              <span className="font-body-sm text-on-surface">High Priority Procurement</span>
              <span className="font-bold text-tertiary-container">{metrics?.high_priority}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Professional PDF Report Template */}
      <div style={{ position: 'absolute', top: '-10000px', left: '-10000px', width: '800px', backgroundColor: 'white', padding: '40px', color: 'black', fontFamily: 'Arial, sans-serif' }} id="pdf-analytical-report">
        <div style={{ borderBottom: '2px solid #004ac6', paddingBottom: '16px', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#004ac6', margin: 0 }}>VendorVision ERP</h1>
          <h2 style={{ fontSize: '18px', color: '#4b5563', marginTop: '4px' }}>Executive Procurement Analysis Report</h2>
          <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>Generated on: {new Date().toLocaleString()}</p>
        </div>
        
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px', marginBottom: '12px' }}>1. Executive Summary</h3>
          <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#374151' }}>
            The current total procurement value stands at <strong>{formatCurrency(metrics?.total_procurement_value || 0)}</strong>. 
            VendorVision ecosystem is currently managing <strong>{metrics?.active_vendors}</strong> active vendors. 
            We have generated <strong>{metrics?.pos_generated}</strong> purchase orders to date. 
            There are currently <strong>{metrics?.pending_approvals}</strong> approvals pending manager review.
            <br/><br/>
            {metrics?.overdue_rfqs && metrics.overdue_rfqs > 0 ? <span style={{color: '#dc2626', fontWeight: 'bold'}}>Critical Alert: There are {metrics.overdue_rfqs} overdue RFQs that require immediate follow-up. </span> : <span style={{color: '#16a34a'}}>All RFQs are currently on track. </span>}
            {metrics?.approval_bottlenecks && metrics.approval_bottlenecks > 0 ? <span style={{color: '#d97706', fontWeight: 'bold'}}>We have identified {metrics.approval_bottlenecks} approval bottlenecks affecting the supply chain speed.</span> : ''}
            {' '}Overall procurement health is stable, but attention is advised on the highlighted bottlenecks.
          </p>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px', marginBottom: '16px' }}>2. Key Performance Indicators</h3>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1, padding: '16px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', marginBottom: '8px' }}>Total Spend</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{formatCurrency(metrics?.total_procurement_value || 0)}</div>
            </div>
            <div style={{ flex: 1, padding: '16px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', marginBottom: '8px' }}>Active Vendors</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{metrics?.active_vendors}</div>
            </div>
            <div style={{ flex: 1, padding: '16px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', marginBottom: '8px' }}>POs Issued</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{metrics?.pos_generated}</div>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px', marginBottom: '16px' }}>3. Spend Trend Analysis</h3>
          <div style={{ height: '300px', width: '100%', border: '1px solid #e5e7eb', padding: '16px', borderRadius: '8px' }}>
            <Line data={chartData} options={{...chartOptions, animation: false}} />
          </div>
        </div>
        
        <div style={{ marginTop: '40px', paddingTop: '16px', borderTop: '1px solid #e5e7eb', fontSize: '10px', color: '#9ca3af', textAlign: 'center' }}>
          Confidential - VendorVision ERP System Generated Analytical Report
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

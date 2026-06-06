import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const VendorDashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [quotesCount, setQuotesCount] = useState(0);
  const [posCount, setPosCount] = useState(0);
  const [pendingPayments, setPendingPayments] = useState(0);

  useEffect(() => {
    if (currentUser?.uid) {
      fetchDashboardData();
    }
  }, [currentUser]);

  const fetchDashboardData = async () => {
    try {
      // Fetch Allocated RFQs
      const rfqRes = await axios.get(`http://localhost:8000/api/rfqs/vendor/${currentUser?.uid}`);
      setRfqs(rfqRes.data);
      
      // Fetch Quotations to get count
      const quotesRes = await axios.get('http://localhost:8000/api/quotations/');
      const vendorQuotes = quotesRes.data.filter((q: any) => q.vendor_id === currentUser?.uid);
      setQuotesCount(vendorQuotes.length);
      
      // Fetch POs to get count and calculate pending payments
      const poRes = await axios.get('http://localhost:8000/api/procurement/pos');
      const vendorPOs = poRes.data.filter((po: any) => po.vendor_id === currentUser?.uid || po.vendor_name === currentUser?.displayName);
      setPosCount(vendorPOs.length);
      
      // Calculate pending payments (e.g. from POs that are 'Issued' or not yet 'Paid')
      // For now, let's sum total_amount of non-completed POs
      const pendingSum = vendorPOs.reduce((sum: number, po: any) => {
        return po.status !== 'Completed' ? sum + po.total_amount : sum;
      }, 0);
      setPendingPayments(pendingSum);
      
    } catch (error) {
      console.error("Error fetching vendor dashboard data:", error);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="font-display-lg text-[32px] font-bold text-on-surface">Vendor Portal</h2>
          <p className="font-body-md text-on-surface-variant mt-1">Manage RFQs, Submit Quotations, and Track Payments</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="glass-card rounded-xl p-5 h-[140px] flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="font-label-mono text-[11px] text-outline uppercase">Allocated RFQs</span>
            <span className="material-symbols-outlined text-primary">inbox</span>
          </div>
          <div><div className="font-display-lg text-[32px] font-bold">{rfqs.length}</div></div>
        </div>
        <div className="glass-card rounded-xl p-5 h-[140px] flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="font-label-mono text-[11px] text-outline uppercase">Quotations Submitted</span>
            <span className="material-symbols-outlined text-tertiary-container">send</span>
          </div>
          <div><div className="font-display-lg text-[32px] font-bold">{quotesCount}</div></div>
        </div>
        <div className="glass-card rounded-xl p-5 h-[140px] flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="font-label-mono text-[11px] text-outline uppercase">Purchase Orders</span>
            <span className="material-symbols-outlined text-success">receipt</span>
          </div>
          <div><div className="font-display-lg text-[32px] font-bold text-success">{posCount}</div></div>
        </div>
        <div className="glass-card rounded-xl p-5 h-[140px] flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="font-label-mono text-[11px] text-outline uppercase">Pending Payments</span>
            <span className="material-symbols-outlined text-warning">payments</span>
          </div>
          <div><div className="font-display-lg text-[32px] font-bold">₹{pendingPayments.toLocaleString()}</div></div>
        </div>
      </div>

      <div className="glass-card rounded-xl overflow-hidden flex flex-col mb-6">
        <div className="p-6 border-b border-primary/10 flex justify-between items-center">
          <h3 className="font-title-sm text-[18px]">Allocated RFQs</h3>
          <button onClick={() => navigate('/vendor-rfqs')} className="text-primary text-[13px] font-semibold hover:underline">View All</button>
        </div>
        <table className="w-full text-left">
          <thead className="bg-surface-container-lowest/80 text-outline text-[11px] uppercase">
            <tr>
              <th className="py-3 px-6">RFQ Number</th>
              <th className="py-3 px-6">Product</th>
              <th className="py-3 px-6">Deadline</th>
              <th className="py-3 px-6 text-center">Status</th>
              <th className="py-3 px-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="text-[13px]">
            {rfqs.length === 0 ? (
               <tr>
                 <td colSpan={5} className="py-8 text-center text-on-surface-variant">No allocated RFQs available. Waiting for Procurement Officer.</td>
               </tr>
            ) : rfqs.map((rfq) => (
              <tr key={rfq.id} className="border-b border-primary/5 hover:bg-primary/5">
                <td className="py-3 px-6 font-semibold">{rfq.rfq_number}</td>
                <td className="py-3 px-6">{rfq.title}</td>
                <td className="py-3 px-6">{new Date(rfq.deadline).toLocaleDateString()}</td>
                <td className="py-3 px-6 text-center">
                  <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-[10px]">Allocated</span>
                </td>
                <td className="py-3 px-6 text-right">
                  <button onClick={() => navigate('/vendor-rfqs')} className="px-3 py-1 bg-primary text-on-primary rounded font-semibold text-xs transition-colors hover:bg-primary/80">
                    View & Quote
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default VendorDashboard;

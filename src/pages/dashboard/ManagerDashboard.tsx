import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const ManagerDashboard = () => {
  const { currentUser } = useAuth();
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [selectedApproval, setSelectedApproval] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchApprovals();
  }, []);

  const fetchApprovals = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/approvals');
      setApprovals(response.data);
    } catch (error) {
      console.error("Error fetching approvals:", error);
    } finally {
      setLoading(false);
    }
  };

  const pendingApprovals = approvals.filter(a => a.status === 'Pending');
  const approvedCount = approvals.filter(a => a.status === 'Approved').length;
  const rejectedCount = approvals.filter(a => a.status === 'Rejected').length;
  const valuePending = pendingApprovals.reduce((sum, a) => sum + (a.amount || 0), 0);

  const handleOpenReview = (approval: any) => {
    setSelectedApproval(approval);
    setIsModalOpen(true);
  };

  const handleAction = async (action: 'approve' | 'reject') => {
    if (!selectedApproval) return;
    setIsProcessing(true);
    try {
      await axios.post(`http://localhost:8000/api/approvals/${selectedApproval.id}/${action}`);
      alert(`Request ${action}d successfully!`);
      setIsModalOpen(false);
      fetchApprovals();
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
      alert(`Failed to ${action} request.`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="font-display-lg text-[32px] font-bold text-on-surface">Approvals & Review</h2>
          <p className="font-body-md text-on-surface-variant mt-1">Review Quotations, Manage Budgets, and Approve Requests</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="glass-card rounded-xl p-5 h-[140px] flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="font-label-mono text-[11px] text-outline uppercase">Pending Approvals</span>
            <span className="material-symbols-outlined text-warning">pending_actions</span>
          </div>
          <div><div className="font-display-lg text-[32px] font-bold text-warning">{pendingApprovals.length}</div></div>
        </div>
        <div className="glass-card rounded-xl p-5 h-[140px] flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="font-label-mono text-[11px] text-outline uppercase">Approved Requests</span>
            <span className="material-symbols-outlined text-success">check_circle</span>
          </div>
          <div><div className="font-display-lg text-[32px] font-bold">{approvedCount}</div></div>
        </div>
        <div className="glass-card rounded-xl p-5 h-[140px] flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="font-label-mono text-[11px] text-outline uppercase">Value Pending</span>
            <span className="material-symbols-outlined text-primary">payments</span>
          </div>
          <div><div className="font-display-lg text-[32px] font-bold">₹{valuePending.toLocaleString()}</div></div>
        </div>
        <div className="glass-card rounded-xl p-5 h-[140px] flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="font-label-mono text-[11px] text-outline uppercase">Rejected</span>
            <span className="material-symbols-outlined text-error">cancel</span>
          </div>
          <div><div className="font-display-lg text-[32px] font-bold text-error">{rejectedCount}</div></div>
        </div>
      </div>

      {/* Approval Queue */}
      <div className="glass-card rounded-xl overflow-hidden flex flex-col mb-6">
        <div className="p-6 border-b border-primary/10 flex justify-between items-center">
          <h3 className="font-title-sm text-[18px]">Approval Queue</h3>
        </div>
        <table className="w-full text-left">
          <thead className="bg-surface-container-lowest/80 text-outline text-[11px] uppercase">
            <tr>
              <th className="py-3 px-6">RFQ Number</th>
              <th className="py-3 px-6">Vendor</th>
              <th className="py-3 px-6">Date</th>
              <th className="py-3 px-6 text-right">Amount</th>
              <th className="py-3 px-6 text-center">Status</th>
              <th className="py-3 px-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="text-[13px]">
            {loading ? (
              <tr><td colSpan={6} className="py-8 text-center text-on-surface-variant">Loading queue...</td></tr>
            ) : approvals.length === 0 ? (
              <tr><td colSpan={6} className="py-8 text-center text-on-surface-variant">No items in the approval queue.</td></tr>
            ) : approvals.map(app => (
              <tr key={app.id} className="border-b border-primary/5 hover:bg-primary/5">
                <td className="py-3 px-6 font-semibold">{app.rfq_number}</td>
                <td className="py-3 px-6">{app.vendor_name}</td>
                <td className="py-3 px-6">{new Date(app.created_at).toLocaleDateString()}</td>
                <td className="py-3 px-6 text-right font-medium">₹{(app.amount || 0).toLocaleString()}</td>
                <td className="py-3 px-6 text-center">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-semibold ${
                    app.status === 'Approved' ? 'bg-[#16a34a]/10 text-[#16a34a]' :
                    app.status === 'Rejected' ? 'bg-error/10 text-error' :
                    'bg-warning/10 text-warning'
                  }`}>
                    {app.status}
                  </span>
                </td>
                <td className="py-3 px-6 text-right">
                  {app.status === 'Pending' ? (
                    <button onClick={() => handleOpenReview(app)} className="px-3 py-1 bg-primary text-on-primary rounded font-semibold text-xs hover:bg-primary/90 transition-colors">Review</button>
                  ) : (
                    <button onClick={() => handleOpenReview(app)} className="px-3 py-1 border border-outline-variant/30 text-on-surface-variant rounded font-semibold text-xs hover:bg-surface-container transition-colors">View</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Review Modal */}
      {isModalOpen && selectedApproval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/40 backdrop-blur-sm">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-outline-variant/20 flex justify-between items-center">
              <div>
                <h3 className="font-title-md text-[18px] font-bold text-on-surface">Review Approval Request</h3>
                <p className="font-body-sm text-on-surface-variant mt-1">Approval ID: #{selectedApproval.id}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-outline hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6 bg-surface-container-low p-4 rounded-xl border border-outline-variant/20">
                <div>
                  <p className="font-label-mono text-[11px] text-outline uppercase tracking-wider mb-1">RFQ Reference</p>
                  <p className="font-semibold text-primary">{selectedApproval.rfq_number}</p>
                </div>
                <div>
                  <p className="font-label-mono text-[11px] text-outline uppercase tracking-wider mb-1">Date Submitted</p>
                  <p className="font-semibold text-on-surface">{new Date(selectedApproval.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <p className="font-label-mono text-[11px] text-outline uppercase tracking-wider mb-1">Selected Vendor</p>
                  <p className="font-semibold text-on-surface">{selectedApproval.vendor_name}</p>
                </div>
                <div>
                  <p className="font-label-mono text-[11px] text-outline uppercase tracking-wider mb-1">Quotation Amount</p>
                  <p className="font-bold text-[18px] text-on-surface">₹{(selectedApproval.amount || 0).toLocaleString()}</p>
                </div>
              </div>
              
              <div>
                 <h4 className="font-label-mono text-[11px] text-outline uppercase tracking-wider mb-2">Current Status</h4>
                 <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-label-mono text-[11px] uppercase tracking-wider font-bold ${
                    selectedApproval.status === 'Approved' ? 'bg-[#16a34a]/10 text-[#16a34a] border border-[#16a34a]/20' :
                    selectedApproval.status === 'Rejected' ? 'bg-error/10 text-error border border-error/20' :
                    'bg-warning/10 text-warning border border-warning/20'
                  }`}>
                    {selectedApproval.status === 'Approved' ? <span className="material-symbols-outlined text-[14px]">check_circle</span> : 
                     selectedApproval.status === 'Rejected' ? <span className="material-symbols-outlined text-[14px]">cancel</span> : 
                     <span className="material-symbols-outlined text-[14px]">pending</span>}
                    {selectedApproval.status}
                  </span>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-outline-variant/20 flex justify-between items-center bg-surface-container-low/50">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-on-surface font-semibold rounded-lg hover:bg-surface-container transition-colors text-[14px]">Close</button>
              
              {selectedApproval.status === 'Pending' && (
                <div className="flex gap-3">
                  <button 
                    onClick={() => handleAction('reject')} 
                    disabled={isProcessing}
                    className="px-6 py-2 text-error bg-error/10 hover:bg-error/20 font-semibold rounded-lg transition-colors flex items-center gap-2"
                  >
                    Reject Request
                  </button>
                  <button 
                    onClick={() => handleAction('approve')} 
                    disabled={isProcessing}
                    className="px-6 py-2 bg-[#16a34a] text-white hover:bg-[#15803d] font-semibold rounded-lg transition-colors flex items-center gap-2"
                  >
                    {isProcessing ? 'Processing...' : 'Approve & Issue PO'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ManagerDashboard;

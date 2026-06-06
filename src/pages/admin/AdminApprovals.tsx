import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminApprovals = () => {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [selectedApprovalId, setSelectedApprovalId] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchApprovals();
  }, []);

  const fetchApprovals = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/approvals');
      setApprovals(response.data);
      if (response.data.length > 0) {
        setSelectedApprovalId(response.data[0].id);
      }
    } catch (error) {
      console.error("Error fetching approvals:", error);
    }
  };

  const selectedApproval = approvals.find(a => a.id === selectedApprovalId);

  const handleAction = async (action: 'approve' | 'reject') => {
    if (!selectedApprovalId) return;
    setIsProcessing(true);
    try {
      await axios.post(`http://localhost:8000/api/approvals/${selectedApprovalId}/${action}`);
      fetchApprovals(); // Refresh list after action
    } catch (error) {
      console.error(`Error ${action}ing approval:`, error);
    }
    setIsProcessing(false);
  };

  return (
    <div className="bg-background relative">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="font-display-lg text-[32px] font-bold text-on-surface">Approval Workflow</h2>
          {selectedApproval ? (
            <p className="font-body-md text-on-surface-variant mt-1">RFQ ID: {selectedApproval.rfq_id}</p>
          ) : (
            <p className="font-body-md text-on-surface-variant mt-1">Select an item below to review.</p>
          )}
        </div>
        <div>
           <select 
              className="bg-surface-container border border-outline-variant/30 rounded-lg px-3 py-2 text-[14px] font-semibold text-primary focus:outline-none"
              value={selectedApprovalId || ''}
              onChange={(e) => setSelectedApprovalId(Number(e.target.value))}
            >
              <option value="">-- Select Pending Approval --</option>
              {approvals.map(approval => (
                <option key={approval.id} value={approval.id}>Approval #{approval.id} - Status: {approval.status}</option>
              ))}
            </select>
        </div>
      </div>

      {!selectedApproval ? (
        <div className="glass-card rounded-2xl border border-outline-variant/30 p-12 max-w-4xl mx-auto text-center">
          <p className="text-on-surface-variant font-body-md">No pending approvals at this time.</p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl border border-outline-variant/30 p-8 max-w-4xl mx-auto transition-all">
          <div className="flex items-center justify-between mb-12 relative px-8">
            <div className="absolute left-[52px] right-[52px] top-5 h-[2px] bg-surface-container-high -z-10"></div>
            <div className="absolute left-[52px] top-5 h-[2px] bg-primary transition-all duration-500 -z-10" style={{ width: selectedApproval.status === 'Approved' ? 'calc(100% - 104px)' : 'calc(50% - 52px)' }}></div>
            
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-[14px] bg-primary text-on-primary shadow-sm">
                <span className="material-symbols-outlined text-[18px]">check</span>
              </div>
              <span className="font-body-sm text-[12px] text-primary font-semibold">Procurement Review</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-[14px] bg-primary text-on-primary shadow-sm">
                <span className="material-symbols-outlined text-[18px]">check</span>
              </div>
              <span className="font-body-sm text-[12px] text-primary font-semibold">Manager Approval</span>
            </div>
            <div className="flex flex-col items-center gap-2 relative">
               {selectedApproval.status === 'Pending' && (
                 <span className="absolute -top-3 -right-3 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d97706] opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-[#d97706]"></span></span>
               )}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-[14px] shadow-sm transition-colors ${
                selectedApproval.status === 'Approved' ? 'bg-[#16a34a] text-white' : 
                selectedApproval.status === 'Rejected' ? 'bg-[#dc2626] text-white' : 
                'bg-[#d97706] text-white'
              }`}>
                {selectedApproval.status === 'Approved' ? <span className="material-symbols-outlined text-[18px]">check</span> :
                 selectedApproval.status === 'Rejected' ? <span className="material-symbols-outlined text-[18px]">close</span> : '3'}
              </div>
              <span className={`font-body-sm text-[12px] font-semibold ${
                selectedApproval.status === 'Approved' ? 'text-[#16a34a]' : 
                selectedApproval.status === 'Rejected' ? 'text-[#dc2626]' : 
                'text-[#d97706]'
              }`}>
                Final Approval
              </span>
            </div>
          </div>

          {selectedApproval.status === 'Rejected' ? (
            <div className="py-12 text-center animate-in fade-in zoom-in-95 duration-300">
              <div className="w-16 h-16 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto mb-4">
                 <span className="material-symbols-outlined text-[32px]">cancel</span>
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-2">Request Rejected</h3>
              <p className="text-on-surface-variant">The quotation approval has been declined.</p>
            </div>
          ) : selectedApproval.status === 'Approved' ? (
            <div className="py-12 text-center animate-in fade-in zoom-in-95 duration-300">
              <div className="w-16 h-16 bg-[#16a34a]/10 text-[#16a34a] rounded-full flex items-center justify-center mx-auto mb-4">
                 <span className="material-symbols-outlined text-[32px]">task_alt</span>
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-2">Approval Successful</h3>
              <p className="text-on-surface-variant">A Purchase Order has been automatically generated.</p>
            </div>
          ) : (
            <div className="animate-in fade-in duration-300">
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-xl p-6">
                  <h3 className="font-label-mono text-[11px] text-outline uppercase tracking-wider font-semibold mb-4">Request Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between border-b border-outline-variant/20 pb-2"><span className="text-on-surface-variant font-body-sm">Requester</span><span className="font-semibold text-[14px]">System</span></div>
                    <div className="flex justify-between border-b border-outline-variant/20 pb-2"><span className="text-on-surface-variant font-body-sm">Date Submitted</span><span className="font-semibold text-[14px]">{new Date(selectedApproval.created_at).toLocaleDateString()}</span></div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t border-outline-variant/20">
                <button 
                  onClick={() => handleAction('reject')} 
                  disabled={isProcessing}
                  className="px-8 py-3 text-error bg-error/10 border border-error/20 rounded-lg font-body-sm font-semibold hover:bg-error/20 transition-colors shadow-sm disabled:opacity-50"
                >
                  Reject
                </button>
                <button 
                  onClick={() => handleAction('approve')} 
                  disabled={isProcessing}
                  className="px-8 py-3 bg-[#16a34a] text-white rounded-lg font-body-sm font-semibold hover:bg-[#15803d] transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {isProcessing ? 'Processing...' : <>Approve <span className="material-symbols-outlined text-[18px]">verified</span></>}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminApprovals;

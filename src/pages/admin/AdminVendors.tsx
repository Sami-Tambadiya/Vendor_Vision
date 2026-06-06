import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const AdminVendors = () => {
  const { userRole } = useAuth();
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Allotment modal states
  const [isAllotModalOpen, setIsAllotModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [rfqs, setRfqs] = useState<any[]>([]);

  useEffect(() => {
    fetchVendors();
    fetchRFQs();
  }, []);

  const fetchVendors = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/users');
      // Filter only Vendors
      setVendors(response.data.filter((u: any) => u.role === 'Vendor'));
    } catch (error) {
      console.error("Error fetching vendors:", error);
    }
    setLoading(false);
  };

  const fetchRFQs = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/rfqs');
      // Only open RFQs can be allotted
      setRfqs(response.data.filter((r: any) => r.status === 'Sent' || r.status === 'Open'));
    } catch (error) {
      console.error("Error fetching RFQs:", error);
    }
  };

  const handleOpenAllotModal = (vendor: any) => {
    setSelectedVendor(vendor);
    setIsAllotModalOpen(true);
  };

  const handleAllotRFQ = async (rfqId: number) => {
    if (!selectedVendor) return;
    try {
      await axios.post(`http://localhost:8000/api/rfqs/${rfqId}/allocate`, {
        vendor_uid: selectedVendor.uid
      });
      alert(`Successfully allotted RFQ to ${selectedVendor.full_name || selectedVendor.email}`);
      setIsAllotModalOpen(false);
    } catch (error) {
      console.error("Error allotting RFQ:", error);
      alert("Failed to allot RFQ.");
    }
  };

  return (
    <div className="bg-background relative">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="font-display-lg text-[32px] font-bold text-on-surface">Vendor Management</h2>
          <p className="font-body-md text-on-surface-variant mt-1">Manage vendor profiles and allocate RFQs</p>
        </div>
      </div>

      <div className="glass-card rounded-xl overflow-hidden border border-outline-variant/30">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low border-b border-outline-variant/30">
              <th className="px-6 py-4 font-label-mono text-[11px] text-outline uppercase tracking-wider font-semibold">Vendor Details</th>
              <th className="px-6 py-4 font-label-mono text-[11px] text-outline uppercase tracking-wider font-semibold">Status</th>
              <th className="px-6 py-4 font-label-mono text-[11px] text-outline uppercase tracking-wider font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20 bg-surface-container-lowest/50">
            {loading ? (
              <tr><td colSpan={3} className="py-8 text-center text-on-surface-variant">Loading vendors...</td></tr>
            ) : vendors.length === 0 ? (
              <tr><td colSpan={3} className="py-8 text-center text-on-surface-variant">No registered vendors found.</td></tr>
            ) : vendors.map((vendor) => (
              <tr key={vendor.uid} className="hover:bg-surface-container-low/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-title-sm text-[14px] text-on-surface font-semibold">{vendor.full_name || 'Vendor Company'}</div>
                  <div className="font-body-sm text-[12px] text-on-surface-variant">{vendor.email}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-label-mono text-[10px] uppercase tracking-wider font-bold bg-[#16a34a]/10 text-[#16a34a] border border-[#16a34a]/20">
                    <span className="w-1.5 h-1.5 rounded-full fill-current bg-current"></span>
                    Active
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-4">
                    {userRole === 'Procurement Officer' || userRole === 'Admin' ? (
                      <button 
                        onClick={() => handleOpenAllotModal(vendor)}
                        className="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg font-body-sm text-[13px] font-semibold transition-colors flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[16px]">assignment_turned_in</span> Allot RFQ
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Allot RFQ Modal */}
      {isAllotModalOpen && selectedVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/40 backdrop-blur-sm">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-outline-variant/20 flex justify-between items-center">
              <div>
                <h3 className="font-title-md text-[18px] font-bold text-on-surface">Allot RFQ to Vendor</h3>
                <p className="font-body-sm text-on-surface-variant mt-1">Assigning to: {selectedVendor.full_name || selectedVendor.email}</p>
              </div>
              <button onClick={() => setIsAllotModalOpen(false)} className="text-outline hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6">
              <h4 className="font-label-mono text-[11px] text-outline uppercase tracking-wider mb-4">Select an Open RFQ</h4>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {rfqs.length === 0 ? (
                  <p className="text-on-surface-variant text-[13px]">No open RFQs available to allot.</p>
                ) : rfqs.map((rfq) => (
                  <div key={rfq.id} className="flex items-center justify-between p-4 rounded-xl border border-outline-variant/30 bg-surface hover:border-primary/50 transition-colors">
                    <div>
                      <p className="font-semibold text-primary text-[14px]">{rfq.rfq_number}</p>
                      <p className="font-body-sm text-on-surface text-[13px] mt-0.5">{rfq.title}</p>
                    </div>
                    <button 
                      onClick={() => handleAllotRFQ(rfq.id)}
                      className="px-4 py-1.5 bg-primary text-on-primary rounded text-[12px] font-semibold hover:bg-primary/90 transition-colors"
                    >
                      Allot
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-outline-variant/20 flex justify-end bg-surface-container-low/50">
              <button onClick={() => setIsAllotModalOpen(false)} className="px-4 py-2 text-on-surface font-semibold rounded-lg hover:bg-surface-container transition-colors text-[14px]">Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminVendors;

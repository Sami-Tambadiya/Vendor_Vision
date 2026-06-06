import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManagerVendorReview = () => {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/users');
      setVendors(response.data.filter((u: any) => u.role === 'Vendor'));
    } catch (error) {
      console.error("Error fetching vendors:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReview = (vendor: any) => {
    setSelectedVendor(vendor);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-background">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="font-display-lg text-[32px] font-bold text-on-surface">Vendor Review</h2>
          <p className="font-body-md text-on-surface-variant mt-1">Review newly registered vendors and their compliance profiles.</p>
        </div>
      </div>

      <div className="glass-card rounded-xl overflow-hidden border border-outline-variant/30">
        <div className="p-6 border-b border-outline-variant/20 bg-surface-container-lowest flex justify-between items-center">
          <h3 className="font-title-sm font-bold text-on-surface">Vendor Directory</h3>
        </div>
        <table className="w-full text-left">
          <thead className="bg-surface-container-lowest/80 text-outline text-[11px] uppercase border-b border-outline-variant/30">
            <tr>
              <th className="py-4 px-6">Company Name / ID</th>
              <th className="py-4 px-6">Email Address</th>
              <th className="py-4 px-6 text-center">Status</th>
              <th className="py-4 px-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="text-[14px]">
            {loading ? (
              <tr><td colSpan={4} className="py-8 text-center text-on-surface-variant">Loading vendors...</td></tr>
            ) : vendors.length === 0 ? (
              <tr><td colSpan={4} className="py-8 text-center text-on-surface-variant">No vendors registered yet.</td></tr>
            ) : vendors.map(vendor => (
              <tr key={vendor.uid} className="border-b border-outline-variant/10 hover:bg-surface-container-lowest transition-colors">
                <td className="py-4 px-6 font-semibold text-primary">{vendor.full_name || 'Vendor Profile'}</td>
                <td className="py-4 px-6 text-on-surface">{vendor.email}</td>
                <td className="py-4 px-6 text-center">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-label-mono text-[10px] uppercase tracking-wider font-bold bg-[#16a34a]/10 text-[#16a34a] border border-[#16a34a]/20">
                    <span className="w-1.5 h-1.5 rounded-full fill-current bg-current"></span> Active
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  <button 
                    onClick={() => handleOpenReview(vendor)}
                    className="px-4 py-1.5 font-body-sm font-semibold border border-outline-variant/30 text-on-surface rounded-lg hover:bg-surface-container transition-colors"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Review Modal */}
      {isModalOpen && selectedVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/40 backdrop-blur-sm">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-outline-variant/20 flex justify-between items-center">
              <div>
                <h3 className="font-title-md text-[18px] font-bold text-on-surface">Vendor Profile Review</h3>
                <p className="font-body-sm text-on-surface-variant mt-1">System ID: {selectedVendor.uid}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-outline hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                 <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl border border-primary/20">
                   {selectedVendor.full_name ? selectedVendor.full_name[0].toUpperCase() : 'V'}
                 </div>
                 <div>
                   <h4 className="font-title-md font-bold text-on-surface">{selectedVendor.full_name || 'Vendor Company'}</h4>
                   <p className="text-on-surface-variant text-[14px]">{selectedVendor.email}</p>
                 </div>
              </div>

              <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/20 space-y-4">
                 <div>
                   <p className="font-label-mono text-[11px] text-outline uppercase tracking-wider mb-1">Account Status</p>
                   <span className="text-[#16a34a] font-semibold text-[13px] flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">verified</span> Active & Verified</span>
                 </div>
                 <div>
                   <p className="font-label-mono text-[11px] text-outline uppercase tracking-wider mb-1">Registration Level</p>
                   <p className="font-body-sm text-on-surface">Standard Vendor (Auto-approved via Google Auth)</p>
                 </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-outline-variant/20 flex justify-end bg-surface-container-low/50">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 bg-primary text-on-primary font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
                Close Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerVendorReview;

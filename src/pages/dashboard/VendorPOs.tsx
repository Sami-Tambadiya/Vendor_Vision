import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const VendorPOs = () => {
  const { currentUser } = useAuth();
  const [pos, setPos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser?.uid) {
      fetchPOs();
    }
  }, [currentUser]);

  const fetchPOs = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/procurement/pos');
      // Filter POs for this specific vendor
      const myPOs = response.data.filter((po: any) => po.vendor_id === currentUser?.uid || po.vendor_name === currentUser?.displayName);
      setPos(myPOs);
    } catch (error) {
      console.error("Error fetching POs:", error);
    }
    setLoading(false);
  };

  return (
    <div className="bg-background">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="font-display-lg text-[32px] font-bold text-on-surface">Purchase Orders</h2>
          <p className="font-body-md text-on-surface-variant mt-1">View your awarded purchase orders</p>
        </div>
      </div>

      <div className="glass-card rounded-2xl border border-outline-variant/30 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-surface-container-lowest/80 text-outline text-[11px] uppercase border-b border-outline-variant/30">
            <tr>
              <th className="py-4 px-6">PO Number</th>
              <th className="py-4 px-6">RFQ ID</th>
              <th className="py-4 px-6">Amount</th>
              <th className="py-4 px-6">Date Generated</th>
              <th className="py-4 px-6 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="text-[14px]">
            {loading ? (
              <tr><td colSpan={5} className="py-8 text-center text-on-surface-variant">Loading POs...</td></tr>
            ) : pos.length === 0 ? (
              <tr><td colSpan={5} className="py-8 text-center text-on-surface-variant">No Purchase Orders found.</td></tr>
            ) : pos.map(po => (
              <tr key={po.id} className="border-b border-outline-variant/10 hover:bg-surface-container-lowest transition-colors">
                <td className="py-4 px-6 font-semibold text-primary">{po.po_number}</td>
                <td className="py-4 px-6 text-on-surface">RFQ-{po.rfq_id}</td>
                <td className="py-4 px-6 text-on-surface font-semibold">₹{po.total_amount.toLocaleString()}</td>
                <td className="py-4 px-6 text-on-surface-variant">{new Date(po.created_at).toLocaleDateString()}</td>
                <td className="py-4 px-6 text-center">
                  <span className={`px-2 py-1 rounded-md text-[11px] font-semibold tracking-wide ${
                    po.status === 'Issued' ? 'bg-[#004ac6]/10 text-[#004ac6]' : 
                    po.status === 'Completed' ? 'bg-[#16a34a]/10 text-[#16a34a]' : 
                    'bg-outline-variant/20 text-on-surface-variant'
                  }`}>
                    {po.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VendorPOs;

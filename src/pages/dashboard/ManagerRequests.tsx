import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManagerRequests = () => {
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRFQs();
  }, []);

  const fetchRFQs = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/rfqs');
      setRfqs(response.data);
    } catch (error) {
      console.error("Error fetching RFQs:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="font-display-lg text-[32px] font-bold text-on-surface">Purchase Requests</h2>
          <p className="font-body-md text-on-surface-variant mt-1">Overview of all procurement requests and their current pipeline status.</p>
        </div>
      </div>

      <div className="glass-card rounded-xl overflow-hidden border border-outline-variant/30">
        <div className="p-6 border-b border-outline-variant/20 bg-surface-container-lowest flex justify-between items-center">
          <h3 className="font-title-sm font-bold text-on-surface">All RFQs Pipeline</h3>
        </div>
        <table className="w-full text-left">
          <thead className="bg-surface-container-lowest/80 text-outline text-[11px] uppercase border-b border-outline-variant/30">
            <tr>
              <th className="py-4 px-6">RFQ Number</th>
              <th className="py-4 px-6">Title</th>
              <th className="py-4 px-6">Category</th>
              <th className="py-4 px-6">Deadline</th>
              <th className="py-4 px-6 text-center">Current Status</th>
            </tr>
          </thead>
          <tbody className="text-[14px]">
            {loading ? (
              <tr><td colSpan={5} className="py-8 text-center text-on-surface-variant">Loading requests...</td></tr>
            ) : rfqs.length === 0 ? (
              <tr><td colSpan={5} className="py-8 text-center text-on-surface-variant">No requests found.</td></tr>
            ) : rfqs.map(rfq => (
              <tr key={rfq.id} className="border-b border-outline-variant/10 hover:bg-surface-container-lowest transition-colors">
                <td className="py-4 px-6 font-semibold text-primary">{rfq.rfq_number || `RFQ-${rfq.id}`}</td>
                <td className="py-4 px-6 text-on-surface">{rfq.title}</td>
                <td className="py-4 px-6 text-on-surface-variant">{rfq.category || 'General'}</td>
                <td className="py-4 px-6 text-on-surface-variant">{new Date(rfq.deadline).toLocaleDateString()}</td>
                <td className="py-4 px-6 text-center">
                  <span className={`px-2 py-1 rounded-md text-[11px] font-semibold tracking-wide ${
                    rfq.status === 'Approved' ? 'bg-[#16a34a]/10 text-[#16a34a]' : 
                    rfq.status === 'Sent' || rfq.status === 'Active' ? 'bg-primary/10 text-primary' : 
                    rfq.status === 'Approval Pending' ? 'bg-warning/10 text-warning' :
                    'bg-outline-variant/20 text-on-surface-variant'
                  }`}>
                    {rfq.status}
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

export default ManagerRequests;

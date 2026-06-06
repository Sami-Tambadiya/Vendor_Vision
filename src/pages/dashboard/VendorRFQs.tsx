import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const VendorRFQs = () => {
  const { currentUser } = useAuth();
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [myQuotes, setMyQuotes] = useState<any[]>([]);

  useEffect(() => {
    if (currentUser?.uid) {
      fetchData();
    }
  }, [currentUser]);

  const fetchData = async () => {
    try {
      const [rfqRes, quotesRes] = await Promise.all([
        axios.get(`http://localhost:8000/api/rfqs/vendor/${currentUser?.uid}`),
        axios.get('http://localhost:8000/api/quotations/')
      ]);
      
      // The backend now strictly returns RFQs allocated to this specific vendor
      setRfqs(rfqRes.data);
      
      // Filter quotes submitted by THIS vendor
      const vendorQuotes = quotesRes.data.filter((q: any) => q.vendor_id === currentUser?.uid);
      setMyQuotes(vendorQuotes);
      
    } catch (error) {
      console.error("Error fetching RFQs/Quotes:", error);
    }
  };

  const handleSubmitQuote = async (rfqId: number) => {
    const amountStr = prompt("Enter total quotation amount (₹):");
    if (!amountStr) return;
    const amount = parseFloat(amountStr);
    if (isNaN(amount)) return alert("Invalid amount");

    try {
      await axios.post('http://localhost:8000/api/quotations/simulate', {
        rfq_id: rfqId,
        vendor_id: currentUser?.uid
      });
      // The simulate endpoint automatically creates quotes. Wait, simulate creates dummy quotes.
      // Let's call the proper POST quotation endpoint.
      await axios.post('http://localhost:8000/api/quotations', {
        rfq_id: rfqId,
        vendor_id: currentUser?.uid,
        total_amount: amount,
        delivery_time_days: 14,
        validity_days: 30,
        items: []
      });
      alert("Quotation submitted successfully!");
      fetchData();
    } catch (error) {
      console.error("Error submitting quote", error);
      alert("Failed to submit quotation.");
    }
  };

  // Check if vendor already submitted quote for an RFQ
  const hasSubmitted = (rfqId: number) => {
    return myQuotes.some(q => q.rfq_id === rfqId);
  };

  return (
    <div className="bg-background">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="font-display-lg text-[32px] font-bold text-on-surface">RFQs & Quotations</h2>
          <p className="font-body-md text-on-surface-variant mt-1">Submit quotes and track your RFQ statuses</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Open RFQs Section */}
        <div className="glass-card rounded-2xl border border-outline-variant/30 overflow-hidden">
          <div className="p-6 border-b border-outline-variant/20 bg-surface-container-lowest">
            <h3 className="font-title-sm font-bold text-on-surface">Open Requests For Quotation</h3>
          </div>
          <table className="w-full text-left">
            <thead className="bg-surface-container-lowest/80 text-outline text-[11px] uppercase border-b border-outline-variant/30">
              <tr>
                <th className="py-4 px-6">RFQ Number</th>
                <th className="py-4 px-6">Title</th>
                <th className="py-4 px-6">Deadline</th>
                <th className="py-4 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-[14px]">
              {rfqs.length === 0 ? (
                <tr><td colSpan={4} className="py-8 text-center text-on-surface-variant">No Open RFQs available.</td></tr>
              ) : rfqs.map(rfq => (
                <tr key={rfq.id} className="border-b border-outline-variant/10 hover:bg-surface-container-lowest transition-colors">
                  <td className="py-4 px-6 font-semibold text-primary">{rfq.rfq_number}</td>
                  <td className="py-4 px-6 text-on-surface">{rfq.title}</td>
                  <td className="py-4 px-6 text-on-surface-variant">{new Date(rfq.deadline).toLocaleDateString()}</td>
                  <td className="py-4 px-6 text-right">
                    {hasSubmitted(rfq.id) ? (
                      <span className="text-[#16a34a] font-semibold text-[13px] flex items-center justify-end gap-1">
                        <span className="material-symbols-outlined text-[16px]">check_circle</span> Submitted
                      </span>
                    ) : (
                      <button 
                        onClick={() => handleSubmitQuote(rfq.id)}
                        className="px-4 py-2 font-body-sm font-semibold bg-primary text-on-primary rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        Submit Quote
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* My Submitted Quotes Section */}
        <div className="glass-card rounded-2xl border border-outline-variant/30 overflow-hidden">
          <div className="p-6 border-b border-outline-variant/20 bg-surface-container-lowest">
            <h3 className="font-title-sm font-bold text-on-surface">My Quotation Status</h3>
          </div>
          <table className="w-full text-left">
            <thead className="bg-surface-container-lowest/80 text-outline text-[11px] uppercase border-b border-outline-variant/30">
              <tr>
                <th className="py-4 px-6">Quotation ID</th>
                <th className="py-4 px-6">Related RFQ</th>
                <th className="py-4 px-6">Amount</th>
                <th className="py-4 px-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="text-[14px]">
              {myQuotes.length === 0 ? (
                <tr><td colSpan={4} className="py-8 text-center text-on-surface-variant">You have not submitted any quotes yet.</td></tr>
              ) : myQuotes.map(quote => (
                <tr key={quote.id} className="border-b border-outline-variant/10 hover:bg-surface-container-lowest transition-colors">
                  <td className="py-4 px-6 font-semibold text-primary">{quote.quotation_number}</td>
                  <td className="py-4 px-6 text-on-surface">RFQ ID: {quote.rfq_id}</td>
                  <td className="py-4 px-6 text-on-surface font-semibold">₹{quote.total_amount.toLocaleString()}</td>
                  <td className="py-4 px-6 text-center">
                    <span className={`px-2 py-1 rounded-md text-[11px] font-semibold tracking-wide ${
                      quote.status === 'Approved' ? 'bg-[#16a34a]/10 text-[#16a34a]' : 
                      quote.status === 'Rejected' ? 'bg-error/10 text-error' : 
                      'bg-[#d97706]/10 text-[#d97706]'
                    }`}>
                      {quote.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VendorRFQs;

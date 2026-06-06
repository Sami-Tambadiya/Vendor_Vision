import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminQuotations = () => {
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [selectedRfqId, setSelectedRfqId] = useState<number | null>(null);
  
  const [quotations, setQuotations] = useState<any[]>([]);
  const [selectedQuoteId, setSelectedQuoteId] = useState<number | null>(null);
  
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  useEffect(() => {
    fetchRFQs();
  }, []);

  useEffect(() => {
    if (selectedRfqId) {
      fetchQuotations(selectedRfqId);
    } else {
      setQuotations([]);
      setSelectedQuoteId(null);
    }
  }, [selectedRfqId]);

  const fetchRFQs = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/rfqs');
      setRfqs(response.data);
      if (response.data.length > 0) {
        setSelectedRfqId(response.data[0].id);
      }
    } catch (error) {
      console.error("Error fetching RFQs:", error);
    }
  };

  const fetchQuotations = async (rfqId: number) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/quotations/rfq/${rfqId}`);
      setQuotations(response.data);
      setSelectedQuoteId(null);
    } catch (error) {
      console.error("Error fetching quotations:", error);
    }
  };

  const selectedRfq = rfqs.find(r => r.id === selectedRfqId);
  const selectedQuote = quotations.find(q => q.id === selectedQuoteId);
  const isAnyApproved = quotations.some(q => q.status === 'Selected' || q.status === 'Approved');

  const handleApprove = async () => {
    if (!selectedQuoteId) return;
    setIsApproving(true);
    try {
      await axios.post(`http://localhost:8000/api/quotations/${selectedQuoteId}/approve`);
      // Refresh quotations
      if (selectedRfqId) fetchQuotations(selectedRfqId);
    } catch (error) {
      console.error("Error approving quotation:", error);
    }
    setIsApproving(false);
  };

  return (
    <div className="bg-background relative">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="font-display-lg text-[32px] font-bold text-on-surface">Select Quotations</h2>
          <div className="mt-2 flex items-center gap-2">
            <span className="font-body-md text-on-surface-variant">RFQ:</span>
            <select 
              className="bg-surface-container border border-outline-variant/30 rounded-lg px-3 py-1 text-[14px] font-semibold text-primary focus:outline-none"
              value={selectedRfqId || ''}
              onChange={(e) => setSelectedRfqId(Number(e.target.value))}
            >
              {rfqs.map(rfq => (
                <option key={rfq.id} value={rfq.id}>{rfq.rfq_number} - {rfq.title}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 glass-card rounded-2xl border border-outline-variant/30 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant/30">
                <th className="px-6 py-4 font-label-mono text-[11px] text-outline uppercase tracking-wider font-semibold">Vendor Name</th>
                <th className="px-6 py-4 font-label-mono text-[11px] text-outline uppercase tracking-wider font-semibold">Total Price</th>
                <th className="px-6 py-4 font-label-mono text-[11px] text-outline uppercase tracking-wider font-semibold">Score</th>
                <th className="px-6 py-4 font-label-mono text-[11px] text-outline uppercase tracking-wider font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 bg-surface-container-lowest/50">
              {quotations.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-on-surface-variant font-body-sm">
                    No quotations received yet for this RFQ.
                  </td>
                </tr>
              ) : (
                quotations.map(quote => (
                  <tr 
                    key={quote.id} 
                    className={`transition-colors ${isAnyApproved ? '' : 'cursor-pointer'} ${selectedQuoteId === quote.id ? 'bg-primary/5' : 'hover:bg-surface-container-low/50'}`}
                    onClick={() => !isAnyApproved && setSelectedQuoteId(quote.id)}
                  >
                    <td className="px-6 py-4 font-title-sm text-[14px] text-on-surface font-semibold">{quote.vendor_name || quote.vendor_id}</td>
                    <td className="px-6 py-4 font-body-sm font-bold text-on-surface">₹{quote.price.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#16a34a]/10 text-[#16a34a] font-bold text-[12px]">90</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {quote.status === 'Selected' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-label-mono text-[10px] uppercase tracking-wider font-bold bg-[#16a34a]/10 text-[#16a34a] border border-[#16a34a]/20"><span className="w-1.5 h-1.5 rounded-full fill-current bg-current"></span>Awarded</span>
                      ) : quote.status === 'Rejected' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-label-mono text-[10px] uppercase tracking-wider font-bold bg-error/10 text-error border border-error/20"><span className="w-1.5 h-1.5 rounded-full fill-current bg-current"></span>Rejected</span>
                      ) : (
                        <input 
                          type="radio" 
                          name="quotation" 
                          className="w-4 h-4 text-primary accent-primary cursor-pointer" 
                          checked={selectedQuoteId === quote.id}
                          onChange={() => !isAnyApproved && setSelectedQuoteId(quote.id)}
                          disabled={isAnyApproved}
                        />
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="w-full lg:w-[350px]">
          <div className="glass-card rounded-2xl border border-outline-variant/30 p-6 sticky top-24">
            <h3 className="font-title-md text-[18px] font-bold text-on-surface mb-6">Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between border-b border-outline-variant/20 pb-3">
                <span className="text-on-surface-variant text-[14px]">Selected</span>
                <span className="font-semibold text-[14px] text-on-surface">{selectedQuote ? selectedQuote.vendor_name || selectedQuote.vendor_id : '-'}</span>
              </div>
              <div className="flex justify-between border-b border-outline-variant/20 pb-3">
                <span className="text-on-surface-variant text-[14px]">Total</span>
                <span className="font-bold text-[16px] text-primary">{selectedQuote ? `₹${selectedQuote.price.toLocaleString()}` : '-'}</span>
              </div>
              <div className="flex justify-between border-b border-outline-variant/20 pb-3">
                <span className="text-on-surface-variant text-[14px]">Score</span>
                <span className="font-bold text-[14px] text-[#16a34a]">{selectedQuote ? '90' : '-'}</span>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => setIsCompareModalOpen(true)}
                disabled={quotations.length < 2}
                className="flex-1 py-2.5 px-4 bg-surface-container border border-outline-variant/30 rounded-lg font-body-sm font-semibold hover:bg-surface-container-high transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Compare
              </button>
              <button 
                onClick={handleApprove}
                className={`flex-1 py-2.5 px-4 rounded-lg font-body-sm font-semibold transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 ${isAnyApproved ? 'bg-[#16a34a] text-white' : 'bg-primary text-on-primary hover:bg-primary/90'}`}
                disabled={!selectedQuoteId || isAnyApproved || isApproving}
              >
                {isApproving ? 'Approving...' : isAnyApproved ? <><span className="material-symbols-outlined text-[18px]">check_circle</span> Awarded</> : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Compare Modal */}
      {isCompareModalOpen && quotations.length >= 2 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/40 backdrop-blur-sm">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-outline-variant/20 flex justify-between items-center">
              <h3 className="font-title-md text-[18px] font-bold text-on-surface">Compare Quotations</h3>
              <button onClick={() => setIsCompareModalOpen(false)} className="text-outline hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 overflow-x-auto">
              <table className="w-full text-center">
                <thead>
                  <tr>
                    <th className="font-label-mono text-[11px] text-outline uppercase tracking-wider font-semibold border-b border-outline-variant/20 pb-2 text-left pl-4">Criteria</th>
                    {quotations.map(q => (
                      <th key={q.id} className="font-title-sm font-semibold border-b border-outline-variant/20 pb-2">{q.vendor_name || q.vendor_id}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="text-on-surface-variant font-body-sm py-3 border-b border-outline-variant/10 text-left pl-4">Total Price</td>
                    {quotations.map(q => (
                      <td key={q.id} className="font-bold text-primary py-3 border-b border-outline-variant/10">₹{q.price.toLocaleString()}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="text-on-surface-variant font-body-sm py-3 border-b border-outline-variant/10 text-left pl-4">Vendor Score</td>
                    {quotations.map(q => (
                      <td key={q.id} className="text-[#16a34a] font-bold py-3 border-b border-outline-variant/10">90</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="text-on-surface-variant font-body-sm py-3 border-b border-outline-variant/10 text-left pl-4">Delivery Time</td>
                    {quotations.map(q => (
                      <td key={q.id} className="py-3 border-b border-outline-variant/10">{q.delivery_time_days} Days</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-outline-variant/20 flex justify-end">
              <button onClick={() => setIsCompareModalOpen(false)} className="px-4 py-2 bg-surface-container border border-outline-variant/30 text-on-surface font-semibold rounded-lg hover:bg-surface-container-high transition-colors shadow-sm text-[14px]">Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminQuotations;

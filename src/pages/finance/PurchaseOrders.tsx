import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import axios from 'axios';

const PurchaseOrders = () => {
  const [pos, setPos] = useState<any[]>([]);
  const [selectedPoId, setSelectedPoId] = useState<number | null>(null);
  
  const [isDownloading, setIsDownloading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  useEffect(() => {
    fetchPOs();
  }, []);

  const fetchPOs = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/procurement/purchase-orders');
      setPos(response.data);
      if (response.data.length > 0) {
        setSelectedPoId(response.data[0].id);
      }
    } catch (error) {
      console.error("Error fetching POs:", error);
    }
  };

  const selectedPo = pos.find(p => p.id === selectedPoId);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const element = document.getElementById('po-container');
      if (element) {
        const canvas = await html2canvas(element, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${selectedPo?.po_number || 'PO'}.pdf`);
      }
    } catch (error) {
      console.error("Error generating PDF", error);
    }
    setIsDownloading(false);
  };

  const handleSendEmail = () => {
    if (!selectedPo) return;
    window.location.href = `mailto:${selectedPo.vendor_id}?subject=Purchase Order ${selectedPo.po_number}&body=Please find the details for ${selectedPo.po_number}.`;
    setIsEmailSent(true);
    setTimeout(() => setIsEmailSent(false), 3000);
  };

  return (
    <div className="bg-background relative">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="font-display-lg text-[32px] font-bold text-on-surface">Purchase Orders</h2>
        </div>
        <div>
           <select 
              className="bg-surface-container border border-outline-variant/30 rounded-lg px-3 py-2 text-[14px] font-semibold text-primary focus:outline-none"
              value={selectedPoId || ''}
              onChange={(e) => setSelectedPoId(Number(e.target.value))}
            >
              <option value="">-- Select Purchase Order --</option>
              {pos.map(po => (
                <option key={po.id} value={po.id}>{po.po_number} - {po.status}</option>
              ))}
            </select>
        </div>
      </div>

      {!selectedPo ? (
        <div className="glass-card rounded-2xl border border-outline-variant/30 p-12 max-w-4xl mx-auto text-center">
          <p className="text-on-surface-variant font-body-md">No purchase orders available.</p>
        </div>
      ) : (
        <div id="po-container" className="bg-background p-4 rounded-xl">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="font-label-mono text-[11px] text-outline uppercase">Purchase Orders / Details</span>
              </div>
              <div className="flex items-center gap-4">
                <h2 className="font-display-lg text-[48px] leading-[56px] text-on-surface font-bold">{selectedPo.po_number}</h2>
                <span className="px-3 py-1 rounded-full status-badge-processing font-label-mono text-[11px] flex items-center gap-1.5 uppercase">
                  <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
                  {selectedPo.status}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={handleDownload}
                disabled={isDownloading}
                className={`px-4 py-2 bg-surface border border-outline-variant text-on-surface font-body-sm text-[13px] rounded-lg hover:bg-surface-container transition-colors flex items-center gap-2 ${isDownloading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span className={`material-symbols-outlined text-[18px] ${isDownloading ? 'animate-bounce' : ''}`}>
                   {isDownloading ? 'hourglass_top' : 'download'}
                </span>
                {isDownloading ? 'Downloading...' : 'Download PDF'}
              </button>
              <button 
                onClick={handleSendEmail}
                disabled={isEmailSent}
                className={`px-4 py-2 font-body-sm text-[13px] rounded-lg flex items-center gap-2 transition-all ${isEmailSent ? 'bg-[#16a34a] text-white shadow-sm' : 'btn-primary text-on-primary'}`}
              >
                <span className="material-symbols-outlined text-[18px]">
                   {isEmailSent ? 'check_circle' : 'send'}
                </span>
                {isEmailSent ? 'Email Sent' : 'Send Email'}
              </button>
            </div>
          </div>

          {/* Context Info Cards */}
          <div className="grid grid-cols-12 gap-6 mt-8">
            {/* Order Details */}
            <div className="col-span-12 md:col-span-6 gradient-border-card p-6">
              <h3 className="font-title-sm text-[18px] text-on-surface mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">info</span>
                Order Information
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-body-sm text-[13px] text-on-surface-variant">PO Date</span>
                  <span className="font-label-mono text-[11px] text-on-surface text-right">{new Date(selectedPo.created_at).toLocaleDateString()}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-body-sm text-[13px] text-on-surface-variant">Expected Delivery</span>
                  <span className="font-label-mono text-[11px] text-on-surface text-right">14 Days</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-body-sm text-[13px] text-on-surface-variant">Payment Terms</span>
                  <span className="font-label-mono text-[11px] text-on-surface text-right">Net 30</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-body-sm text-[13px] text-on-surface-variant">Buyer</span>
                  <span className="font-body-sm text-[13px] text-on-surface text-right font-medium">System Auto-Generated</span>
                </div>
              </div>
            </div>

            {/* Vendor Info */}
            <div className="col-span-12 md:col-span-6 gradient-border-card p-6">
              <h3 className="font-title-sm text-[18px] text-on-surface mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">storefront</span>
                Vendor Details
              </h3>
              <div className="space-y-2">
                <p className="font-headline-md text-[18px] leading-6 font-semibold text-primary">{selectedPo.vendor_name || selectedPo.vendor_id}</p>
                <div className="h-px w-full bg-outline-variant/30 my-2"></div>
                <p className="font-body-sm text-[13px] text-on-surface">Vendor Registered Address</p>
                <div className="flex items-center gap-2 mt-2 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[16px]">mail</span>
                  <span className="font-body-sm text-[13px]">{selectedPo.vendor_id}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="glass-card rounded-xl overflow-hidden mt-8">
            <div className="p-5 border-b border-outline-variant/30 bg-surface/50 flex justify-between items-center">
              <h3 className="font-title-sm text-[18px] text-on-surface">Line Items</h3>
              <span className="font-body-sm text-[13px] text-on-surface-variant">1 Item(s)</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-white/90 backdrop-blur-md border-b border-outline-variant/50 z-10 sticky top-0">
                  <tr>
                    <th className="py-3 px-4 font-label-mono text-[11px] text-on-surface-variant uppercase tracking-wider">Description</th>
                    <th className="py-3 px-4 font-label-mono text-[11px] text-on-surface-variant uppercase tracking-wider w-32 text-right">Total Price</th>
                  </tr>
                </thead>
                <tbody className="font-table-data text-[12px] text-on-surface">
                  <tr className="border-b border-outline-variant/20 hover:bg-primary/5 transition-colors group">
                    <td className="py-3 px-4">
                      <p className="font-medium text-[14px] text-on-surface group-hover:text-primary transition-colors">Bulk Order / RFQ Fulfillment</p>
                    </td>
                    <td className="py-3 px-4 text-right font-label-mono text-[11px] font-medium">₹{selectedPo.total_amount.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary & Totals */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 mt-6">
            <div className="w-full md:w-1/2">
            </div>
            <div className="w-full md:w-[320px] gradient-border-card p-5">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-title-sm text-[18px] text-on-surface">Grand Total</span>
                  <span className="font-label-mono text-[18px] font-bold text-primary">₹{selectedPo.total_amount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrders;

import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import axios from 'axios';

const AdminInvoices = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/procurement/invoices');
      setInvoices(response.data);
      if (response.data.length > 0) {
        setSelectedInvoiceId(response.data[0].id);
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
    }
  };

  const selectedInvoice = invoices.find(inv => inv.id === selectedInvoiceId);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const element = document.getElementById('invoice-container');
      if (element) {
        const canvas = await html2canvas(element, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${selectedInvoice?.invoice_number || 'Invoice'}.pdf`);
      }
    } catch (error) {
      console.error("Error generating PDF", error);
    }
    setIsDownloading(false);
  };

  return (
    <div className="bg-background relative">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="font-display-lg text-[32px] font-bold text-on-surface">Invoices</h2>
        </div>
        <div className="flex items-center gap-4">
           <select 
              className="bg-surface-container border border-outline-variant/30 rounded-lg px-3 py-2 text-[14px] font-semibold text-primary focus:outline-none"
              value={selectedInvoiceId || ''}
              onChange={(e) => setSelectedInvoiceId(Number(e.target.value))}
            >
              <option value="">-- Select Invoice --</option>
              {invoices.map(inv => (
                <option key={inv.id} value={inv.id}>{inv.invoice_number} - {inv.status}</option>
              ))}
            </select>

          <button 
            onClick={handleDownload}
            disabled={isDownloading || !selectedInvoice}
            className={`px-4 py-2 rounded-lg font-body-sm font-semibold flex items-center gap-2 transition-colors shadow-sm ${isDownloading || !selectedInvoice ? 'bg-primary/70 text-on-primary cursor-not-allowed w-40 justify-center' : 'bg-primary text-on-primary hover:bg-primary/90 w-40 justify-center'}`}
          >
            {isDownloading ? (
              <><span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> Downloading...</>
            ) : (
              <><span className="material-symbols-outlined text-[18px]">download</span> Download PDF</>
            )}
          </button>
        </div>
      </div>

      {!selectedInvoice ? (
        <div className="glass-card rounded-2xl border border-outline-variant/30 p-12 max-w-4xl mx-auto text-center">
          <p className="text-on-surface-variant font-body-md">No invoices available.</p>
        </div>
      ) : (
        <div id="invoice-container" className="glass-card rounded-2xl border border-outline-variant/30 p-8 max-w-5xl mx-auto bg-surface">
          <div className="flex justify-between border-b border-outline-variant/20 pb-8 mb-8">
            <div>
              <h1 className="text-[24px] font-bold text-primary mb-2">VendorVision ERP</h1>
              <p className="text-on-surface-variant text-[14px]">123 Enterprise Way<br/>Tech City, TC 10010</p>
            </div>
            <div className="text-right">
              <h2 className="text-[24px] font-bold text-on-surface mb-2">INVOICE</h2>
              <p className="text-on-surface-variant text-[14px]"><strong>Invoice #:</strong> {selectedInvoice.invoice_number}<br/><strong>Date:</strong> {new Date(selectedInvoice.created_at).toLocaleDateString()}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-12 mb-12">
            <div>
               <h3 className="font-label-mono text-[11px] text-outline uppercase tracking-wider font-semibold mb-2">Billed To</h3>
               <p className="text-on-surface text-[14px] font-semibold">{selectedInvoice.vendor_name || selectedInvoice.vendor_id || 'Unknown Vendor'}</p>
               <p className="text-on-surface-variant text-[14px]">Vendor Registered Address</p>
            </div>
            <div className="text-right">
               <h3 className="font-label-mono text-[11px] text-outline uppercase tracking-wider font-semibold mb-2">Payment Details</h3>
               <p className="text-on-surface text-[14px]"><strong>Due Date:</strong> +30 Days</p>
               <p className="text-on-surface text-[14px]"><strong>Terms:</strong> Net 30</p>
               <p className="text-on-surface text-[14px] mt-2 text-primary font-semibold">Status: {selectedInvoice.status}</p>
            </div>
          </div>

          <table className="w-full text-left border-collapse mb-8">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant/30">
                <th className="px-4 py-3 font-label-mono text-[11px] text-outline uppercase tracking-wider font-semibold">Description</th>
                <th className="px-4 py-3 font-label-mono text-[11px] text-outline uppercase tracking-wider font-semibold text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 bg-surface-container-lowest/50">
              <tr>
                <td className="px-4 py-4 text-[14px] text-on-surface font-semibold">Fulfillment for PO ID: {selectedInvoice.po_id}</td>
                <td className="px-4 py-4 text-[14px] text-right font-bold">₹{selectedInvoice.amount.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          <div className="flex justify-end border-t border-outline-variant/20 pt-6">
             <div className="w-64 space-y-3 text-[14px]">
               <div className="flex justify-between"><span className="text-on-surface-variant">Subtotal</span><span className="font-semibold">₹{selectedInvoice.amount.toLocaleString()}</span></div>
               <div className="flex justify-between"><span className="text-on-surface-variant">Tax (0%)</span><span className="font-semibold">₹0.00</span></div>
               <div className="flex justify-between border-t border-outline-variant/20 pt-3"><span className="font-bold text-[16px]">Total</span><span className="font-bold text-primary text-[16px]">₹{selectedInvoice.amount.toLocaleString()}</span></div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInvoices;

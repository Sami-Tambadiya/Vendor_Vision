import React from 'react';

const ProcurementDashboard = () => {
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="font-display-lg text-[32px] font-bold text-on-surface">Procurement Operations</h2>
          <p className="font-body-md text-on-surface-variant mt-1">Manage RFQs, Compare Quotations, and Generate POs</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-primary text-on-primary rounded-lg font-body-sm font-semibold hover:bg-primary/90 shadow-sm">
            + Create RFQ
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="glass-card rounded-xl p-5 h-[140px] flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="font-label-mono text-[11px] text-outline uppercase">Active RFQs</span>
            <span className="material-symbols-outlined text-primary">request_quote</span>
          </div>
          <div><div className="font-display-lg text-[32px] font-bold">34</div></div>
        </div>
        <div className="glass-card rounded-xl p-5 h-[140px] flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="font-label-mono text-[11px] text-outline uppercase">Quotations Received</span>
            <span className="material-symbols-outlined text-tertiary-container">description</span>
          </div>
          <div><div className="font-display-lg text-[32px] font-bold">128</div></div>
        </div>
        <div className="glass-card rounded-xl p-5 h-[140px] flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="font-label-mono text-[11px] text-outline uppercase">Pending Approvals</span>
            <span className="material-symbols-outlined text-warning">pending_actions</span>
          </div>
          <div><div className="font-display-lg text-[32px] font-bold">12</div></div>
        </div>
        <div className="glass-card rounded-xl p-5 h-[140px] flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="font-label-mono text-[11px] text-outline uppercase">Generated POs</span>
            <span className="material-symbols-outlined text-success">receipt</span>
          </div>
          <div><div className="font-display-lg text-[32px] font-bold">56</div></div>
        </div>
      </div>

      {/* Main Workflow Section */}
      <div className="glass-card rounded-xl p-6 mb-6">
        <h3 className="font-title-sm text-[18px] mb-6">RFQ Pipeline Workflow</h3>
        <div className="flex items-center justify-between overflow-x-auto pb-4">
          {['Draft', 'Sent', 'Quotation Received', 'Comparison Pending', 'Approval Pending', 'Approved', 'PO Generated'].map((step, idx) => (
            <div key={step} className="flex items-center">
              <div className="flex flex-col items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${idx < 3 ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'}`}>{idx + 1}</div>
                <span className="font-label-mono text-[10px] text-center w-20">{step}</span>
              </div>
              {idx < 6 && <div className={`h-1 w-16 mx-2 ${idx < 2 ? 'bg-primary' : 'bg-surface-container-high'}`}></div>}
            </div>
          ))}
        </div>
      </div>
      
      {/* Recent RFQs Table */}
      <div className="glass-card rounded-xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-primary/10 flex justify-between items-center">
          <h3 className="font-title-sm text-[18px]">Recent RFQs</h3>
          <button className="text-primary text-sm hover:underline">View All</button>
        </div>
        <table className="w-full text-left">
          <thead className="bg-surface-container-lowest/80 text-outline text-[11px] uppercase">
            <tr>
              <th className="py-3 px-6">RFQ Number</th>
              <th className="py-3 px-6">Title</th>
              <th className="py-3 px-6">Category</th>
              <th className="py-3 px-6">Status</th>
            </tr>
          </thead>
          <tbody className="text-[13px]">
            <tr className="border-b border-primary/5 hover:bg-primary/5">
              <td className="py-3 px-6 font-semibold">RFQ-2023-001</td>
              <td className="py-3 px-6">Office Laptops</td>
              <td className="py-3 px-6">IT Hardware</td>
              <td className="py-3 px-6"><span className="px-2 py-1 bg-warning/10 text-warning rounded-full text-[10px]">Comparison Pending</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
};

export default ProcurementDashboard;

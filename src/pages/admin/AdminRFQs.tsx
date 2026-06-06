import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminRFQs = () => {
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [lineItems, setLineItems] = useState([{ id: 1, description: '', qty: 1 }]);
  
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [newRfqTitle, setNewRfqTitle] = useState('');
  const [newRfqDeadline, setNewRfqDeadline] = useState('');

  useEffect(() => {
    fetchRFQs();
  }, []);

  const fetchRFQs = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/rfqs');
      setRfqs(response.data);
    } catch (error) {
      console.error("Error fetching RFQs:", error);
    }
  };

  const handleAddItem = () => {
    setLineItems([...lineItems, { id: Date.now(), description: '', qty: 1 }]);
  };

  const handleRemoveItem = (id: number) => {
    setLineItems(lineItems.filter(item => item.id !== id));
  };

  const handleNext = () => setCurrentStep(Math.min(currentStep + 1, 3));
  const handleBack = () => setCurrentStep(Math.max(currentStep - 1, 1));
  
  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      await axios.post('http://localhost:8000/api/rfqs', {
        title: newRfqTitle || 'New RFQ',
        category: 'Hardware', // Add dummy category for now
        deadline: newRfqDeadline || new Date().toISOString()
      });
      setIsPublished(true);
      setTimeout(() => {
        setIsPublished(false);
        setIsCreateMode(false);
        setCurrentStep(1);
        setNewRfqTitle('');
        setNewRfqDeadline('');
        setLineItems([{ id: 1, description: '', qty: 1 }]);
        fetchRFQs(); // Refresh list after adding
      }, 2000);
    } catch (error) {
      console.error("Error publishing RFQ:", error);
    } finally {
      setIsPublishing(false);
    }
  };

  if (isCreateMode) {
    return (
      <div className="bg-background animate-in fade-in duration-300">
        <div className="mb-8">
          <h2 className="font-display-lg text-[32px] font-bold text-on-surface">Create New RFQ</h2>
          <p className="font-body-md text-on-surface-variant mt-1">Initialize a new request for quotation</p>
        </div>

        <div className="glass-card rounded-2xl border border-outline-variant/30 p-8 max-w-4xl mx-auto">
          {/* Stepper */}
          <div className="flex items-center justify-between mb-12 relative px-8">
            <div className="absolute left-[52px] right-[52px] top-5 h-[2px] bg-surface-container-high -z-10"></div>
            <div className="absolute left-[52px] top-5 h-[2px] bg-primary transition-all duration-300 -z-10" style={{ width: currentStep === 1 ? '0%' : currentStep === 2 ? 'calc(50% - 52px)' : 'calc(100% - 104px)' }}></div>
            
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-[14px] transition-colors ${currentStep >= step ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                  {currentStep > step ? <span className="material-symbols-outlined text-[18px]">check</span> : step}
                </div>
                <span className={`font-body-sm text-[12px] font-semibold ${currentStep >= step ? 'text-primary' : 'text-on-surface-variant'}`}>
                  {step === 1 ? 'Details' : step === 2 ? 'Items' : 'Review'}
                </span>
              </div>
            ))}
          </div>

          <div className="py-8 min-h-[300px] flex items-center justify-center">
            {isPublished ? (
              <div className="text-center animate-in zoom-in duration-300">
                <div className="w-16 h-16 bg-[#16a34a]/10 text-[#16a34a] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-[32px]">check_circle</span>
                </div>
                <h3 className="font-title-lg text-xl font-bold mb-2">RFQ Published Successfully!</h3>
                <p className="text-on-surface-variant">Vendors will be notified shortly.</p>
              </div>
            ) : currentStep === 1 ? (
              <div className="text-left w-full animate-in slide-in-from-right-4 duration-300 space-y-6">
                <h3 className="font-title-lg text-xl font-bold mb-6">RFQ Details</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block font-label-mono text-[11px] text-outline uppercase tracking-wider font-semibold mb-2">RFQ Title</label>
                    <input type="text" value={newRfqTitle} onChange={(e) => setNewRfqTitle(e.target.value)} className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/30 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 text-[14px]" placeholder="e.g. Office Furniture Q3" />
                  </div>
                  <div>
                    <label className="block font-label-mono text-[11px] text-outline uppercase tracking-wider font-semibold mb-2">Category</label>
                    <select className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/30 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 text-[14px]">
                      <option>Furniture & Fixtures</option>
                      <option>IT Equipment</option>
                      <option>Stationery</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-label-mono text-[11px] text-outline uppercase tracking-wider font-semibold mb-2">Deadline</label>
                    <input type="date" value={newRfqDeadline} onChange={(e) => setNewRfqDeadline(e.target.value)} className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/30 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 text-[14px]" />
                  </div>
                  <div>
                    <label className="block font-label-mono text-[11px] text-outline uppercase tracking-wider font-semibold mb-2">Budget Limit (Optional)</label>
                    <input type="text" className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/30 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 text-[14px]" placeholder="₹0.00" />
                  </div>
                </div>
                <div>
                  <label className="block font-label-mono text-[11px] text-outline uppercase tracking-wider font-semibold mb-2">Description / Requirements</label>
                  <textarea rows={4} className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/30 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 text-[14px] resize-none" placeholder="Enter detailed specifications..."></textarea>
                </div>
              </div>
            ) : currentStep === 2 ? (
               <div className="w-full max-w-2xl mx-auto animate-in slide-in-from-right-4 duration-300">
                <div className="text-center mb-6">
                  <h3 className="font-title-lg text-xl font-bold mb-2">Add Line Items</h3>
                  <p className="text-on-surface-variant">Specify the products or services required.</p>
                </div>
                
                <div className="space-y-3 mb-6">
                  {lineItems.map((item, index) => (
                    <div key={item.id} className="flex gap-4 items-start">
                      <div className="flex-1">
                        <input 
                          type="text" 
                          value={item.description}
                          onChange={(e) => {
                            const newItems = [...lineItems];
                            newItems[index].description = e.target.value;
                            setLineItems(newItems);
                          }}
                          className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-[14px]" 
                          placeholder="Item Description" 
                        />
                      </div>
                      <div className="w-24">
                        <input 
                          type="number" 
                          value={item.qty}
                          onChange={(e) => {
                            const newItems = [...lineItems];
                            newItems[index].qty = parseInt(e.target.value) || 1;
                            setLineItems(newItems);
                          }}
                          className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-[14px]" 
                          placeholder="Qty" 
                          min="1"
                        />
                      </div>
                      <button 
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-2.5 text-error hover:bg-error/10 rounded-lg transition-colors mt-0.5"
                        disabled={lineItems.length === 1}
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  ))}
                </div>

                <div className="text-center">
                  <button 
                    onClick={handleAddItem}
                    className="px-4 py-2 bg-surface-container border border-outline-variant/30 text-on-surface font-semibold rounded-lg hover:bg-surface-container-high transition-colors text-[14px]"
                  >
                    + Add Item Row
                  </button>
                </div>
              </div>
            ) : (
               <div className="text-center animate-in slide-in-from-right-4 duration-300">
                <h3 className="font-title-lg text-xl font-bold mb-2">Review & Publish</h3>
                <p className="text-on-surface-variant">Review all details before publishing to vendors.</p>
              </div>
            )}
          </div>

          {!isPublished && (
            <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-outline-variant/20">
              {currentStep === 1 ? (
                 <button onClick={() => setIsCreateMode(false)} className="px-8 py-3 bg-surface-container border border-outline-variant/30 text-on-surface rounded-lg font-body-sm font-semibold hover:bg-surface-container-high transition-colors">Cancel</button>
              ) : (
                 <button onClick={handleBack} className="px-8 py-3 bg-surface-container border border-outline-variant/30 text-on-surface rounded-lg font-body-sm font-semibold hover:bg-surface-container-high transition-colors">Back</button>
              )}
              
              {currentStep < 3 ? (
                <button onClick={handleNext} className="px-8 py-3 bg-primary text-on-primary rounded-lg font-body-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm">Continue</button>
              ) : (
                <button 
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className={`px-8 py-3 rounded-lg font-body-sm font-semibold transition-colors shadow-sm flex items-center justify-center gap-2 ${isPublishing ? 'bg-primary/70 text-on-primary cursor-not-allowed w-40' : 'bg-[#0047FF] text-white hover:bg-[#003BCC] w-40'}`}
                >
                  {isPublishing ? (
                    <><span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> Publishing...</>
                  ) : (
                    'Publish RFQ'
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className="bg-background">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="font-display-lg text-[32px] font-bold text-on-surface">RFQs</h2>
          <p className="font-body-md text-on-surface-variant mt-1">Manage Requests for Quotation</p>
        </div>
        <button 
          onClick={() => setIsCreateMode(true)}
          className="px-4 py-2 bg-primary text-on-primary rounded-lg font-body-sm font-semibold flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">add</span> Create RFQ
        </button>
      </div>

      <div className="glass-card rounded-xl overflow-hidden border border-outline-variant/30">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low border-b border-outline-variant/30">
              <th className="px-6 py-4 font-label-mono text-[11px] text-outline uppercase tracking-wider font-semibold">RFQ ID</th>
              <th className="px-6 py-4 font-label-mono text-[11px] text-outline uppercase tracking-wider font-semibold">Title</th>
              <th className="px-6 py-4 font-label-mono text-[11px] text-outline uppercase tracking-wider font-semibold">Status</th>
              <th className="px-6 py-4 font-label-mono text-[11px] text-outline uppercase tracking-wider font-semibold">Deadline</th>
              <th className="px-6 py-4 font-label-mono text-[11px] text-outline uppercase tracking-wider font-semibold text-right">Responses</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20 bg-surface-container-lowest/50">
            {rfqs.map(rfq => (
              <tr key={rfq.id} className="hover:bg-surface-container-low/50 transition-colors">
                <td className="px-6 py-4 font-label-mono text-[12px] font-semibold text-primary">{rfq.rfq_number || rfq.id}</td>
                <td className="px-6 py-4 font-title-sm text-[14px] text-on-surface font-semibold">{rfq.title}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-label-mono text-[10px] uppercase tracking-wider font-bold ${rfq.status === 'Active' || rfq.status === 'Sent' ? 'bg-[#16a34a]/10 text-[#16a34a] border border-[#16a34a]/20' : 'bg-primary/10 text-primary border border-primary/20'}`}>
                    <span className="w-1.5 h-1.5 rounded-full fill-current bg-current"></span>
                    {rfq.status}
                  </span>
                </td>
                <td className="px-6 py-4 font-body-sm text-[13px] text-on-surface-variant">
                  {new Date(rfq.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                <td className="px-6 py-4 text-right font-body-sm text-[13px] font-semibold">{rfq.responses || '0'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminRFQs;

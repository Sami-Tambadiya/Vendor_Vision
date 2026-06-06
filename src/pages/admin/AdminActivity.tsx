import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminActivity = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [filterModule, setFilterModule] = useState<string>('All');
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/activity');
      setLogs(response.data);
    } catch (error) {
      console.error("Error fetching logs:", error);
    }
  };

  const handleExport = () => {
    setIsExporting(true);
    try {
      const headers = ['Date', 'User', 'Module', 'Action', 'Details'];
      const csvData = filteredLogs.map(log => [
        new Date(log.created_at).toLocaleString(),
        log.user_name || log.user_uid,
        log.module,
        log.action,
        `"${log.details.replace(/"/g, '""')}"`
      ]);

      const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `activity_logs_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error exporting CSV:", error);
    }
    setIsExporting(false);
  };

  const filteredLogs = filterModule === 'All' ? logs : logs.filter(l => l.module === filterModule);
  
  const modules = ['All', ...Array.from(new Set(logs.map(l => l.module)))];

  const getLogColor = (module: string) => {
    switch(module) {
      case 'RFQ': return 'border-outline-variant';
      case 'Quotation': return 'border-[#16a34a]';
      case 'Approval': return 'border-[#d97706]';
      case 'Procurement': return 'border-primary';
      default: return 'border-primary';
    }
  };
  
  const getLogBgColor = (module: string) => {
    switch(module) {
      case 'RFQ': return 'bg-outline-variant';
      case 'Quotation': return 'bg-[#16a34a]';
      case 'Approval': return 'bg-[#d97706]';
      case 'Procurement': return 'bg-primary';
      default: return 'bg-primary';
    }
  };

  return (
    <div className="bg-background">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="font-display-lg text-[32px] font-bold text-on-surface">Activity & Logs</h2>
          <p className="font-body-md text-on-surface-variant mt-1">System-wide audit trail</p>
        </div>
        <div className="flex gap-4">
          <select 
            className="px-4 py-2 text-on-surface bg-surface-container-lowest border border-outline-variant/50 rounded-lg font-body-sm font-semibold focus:outline-none shadow-sm"
            value={filterModule}
            onChange={(e) => setFilterModule(e.target.value)}
          >
            {modules.map(m => (
              <option key={m} value={m}>{m} Module</option>
            ))}
          </select>

          <button 
            onClick={handleExport}
            disabled={isExporting}
            className={`px-4 py-2 rounded-lg font-body-sm font-semibold transition-colors shadow-sm flex items-center gap-2 ${isExporting ? 'bg-surface-container-low text-on-surface-variant cursor-not-allowed' : 'text-on-surface bg-surface-container-lowest border border-outline-variant/50 hover:bg-surface-container-low'}`}
          >
            {isExporting ? (
               <><span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span> Exporting...</>
            ) : (
               <><span className="material-symbols-outlined text-[16px]">download</span> Export CSV</>
            )}
          </button>
        </div>
      </div>

      <div className="glass-card rounded-2xl border border-outline-variant/30 p-8 max-w-4xl">
        <div className="space-y-8">
          {filteredLogs.length === 0 ? (
            <p className="text-on-surface-variant text-center py-4">No activity logs found.</p>
          ) : (
            filteredLogs.map((log, index) => (
              <div key={log.id} className={`flex gap-6 items-start border-l-2 pl-6 relative ${index === filteredLogs.length - 1 ? 'pb-2' : ''} ${getLogColor(log.module)}`}>
                 <div className={`absolute -left-[11px] top-0 w-[20px] h-[20px] rounded-full border-[5px] border-background ${getLogBgColor(log.module)}`}></div>
                 <div>
                   <p className="font-body-md text-on-surface">
                     <span className="font-bold">{log.user_name || log.user_uid}</span> [{log.module}] - {log.action}: <span className="font-semibold">{log.details}</span>
                   </p>
                   <p className="font-label-mono text-[11px] text-outline mt-1.5 uppercase">
                     {new Date(log.created_at).toLocaleString()}
                   </p>
                 </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminActivity;

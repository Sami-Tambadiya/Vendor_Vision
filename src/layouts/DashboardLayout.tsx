import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState, useRef, useEffect } from 'react';

const DashboardLayout = () => {
  const { userRole, currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) setIsNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setIsProfileOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  // Role-based links
  const adminLinks = [
    { name: 'Dashboard', icon: 'dashboard', path: '/dashboard' },
    { name: 'Users', icon: 'manage_accounts', path: '/users' },
    { name: 'Vendors', icon: 'handshake', path: '/vendors' },
    { name: 'Reports', icon: 'leaderboard', path: '/reports' },
    { name: 'Activity', icon: 'history', path: '/activity' },
  ];

  const procurementLinks = [
    { name: 'Dashboard', icon: 'dashboard', path: '/dashboard' },
    { name: 'RFQs', icon: 'request_quote', path: '/rfqs' },
    { name: 'Vendor Management', icon: 'handshake', path: '/vendors' },
    { name: 'Quotation Comparison', icon: 'compare_arrows', path: '/quotations' },
    { name: 'Approvals', icon: 'pending_actions', path: '/approvals' },
    { name: 'Purchase Orders', icon: 'receipt', path: '/pos' },
    { name: 'Invoices', icon: 'request_page', path: '/invoices' },
    { name: 'Reports', icon: 'leaderboard', path: '/reports' },
  ];

  const managerLinks = [
    { name: 'Dashboard', icon: 'dashboard', path: '/dashboard' },
    { name: 'Approvals', icon: 'pending_actions', path: '/approvals' },
    { name: 'Requests', icon: 'assignment', path: '/requests' },
    { name: 'Vendor Review', icon: 'rate_review', path: '/vendor-review' },
    { name: 'Reports', icon: 'leaderboard', path: '/reports' },
  ];

  const vendorLinks = [
    { name: 'Dashboard', icon: 'dashboard', path: '/dashboard' },
    { name: 'RFQs & Quotes', icon: 'request_quote', path: '/vendor-rfqs' },
    { name: 'Purchase Orders', icon: 'receipt', path: '/vendor-pos' },
  ];

  const getLinks = () => {
    switch (userRole) {
      case 'Admin': return adminLinks;
      case 'Procurement Officer': return procurementLinks;
      case 'Vendor': return vendorLinks;
      case 'Manager': return managerLinks;
      default: return adminLinks;
    }
  };

  const links = getLinks();
  
  // Try to use displayName from Firebase, otherwise default to Email, or generic
  const userName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User';

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen flex">
      {/* SideNavBar */}
      <nav className="bg-surface dark:bg-inverse-surface fixed left-0 top-0 h-screen w-[260px] hidden md:block bg-surface/80 dark:bg-inverse-surface/80 backdrop-blur-xl border-r border-primary/10 shadow-sm z-50 flex flex-col">
        <div className="flex flex-col h-full py-6">
          <div className="px-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-sm font-bold text-xl">V</div>
              <div>
                <h1 className="font-headline-md text-[20px] leading-[24px] font-bold text-primary dark:text-primary-fixed">VendorVision</h1>
                <p className="font-label-mono text-[11px] leading-[14px] text-outline uppercase tracking-wider">{userName}</p>
                <p className="font-label-mono text-[10px] leading-[14px] text-primary/80 uppercase font-semibold mt-0.5">{userRole || 'Role'}</p>
              </div>
            </div>
          </div>
          


          <div className="flex-1 overflow-y-auto px-2 space-y-1">
            {links.map((link) => {
              const isActive = location.pathname === link.path || location.pathname.startsWith(link.path + '/');
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={isActive 
                    ? "flex items-center gap-3 px-4 py-3 text-primary dark:text-primary-fixed-dim bg-primary/5 dark:bg-primary-fixed/5 border-r-4 border-primary rounded-l-lg scale-95 transition-transform duration-200"
                    : "flex items-center gap-3 px-4 py-3 text-on-surface-variant dark:text-outline-variant hover:bg-surface-container-high dark:hover:bg-surface-variant/10 transition-colors duration-300 rounded-lg"}
                >
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "" }}>
                    {link.icon}
                  </span>
                  <span className="font-body-md font-semibold">{link.name}</span>
                </Link>
              );
            })}
          </div>

        </div>
      </nav>

      {/* Main Content Wrapper */}
      <div className="flex-1 ml-0 md:ml-[260px] flex flex-col min-h-screen max-w-full overflow-hidden">
        {/* TopNavBar */}
        <header className="bg-surface/80 dark:bg-inverse-surface/80 docked full-width top-0 sticky z-40 backdrop-blur-xl border-b border-primary/10 shadow-sm">
          <div className="flex justify-between items-center w-full px-8 h-16 max-w-[calc(100%)]">
            <div className="flex-1 flex items-center gap-4">
              <div className="relative w-full max-w-md hidden sm:block">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
                <input 
                  type="text"
                  className="w-full pl-10 pr-4 py-2 bg-surface-container-lowest border border-primary/10 rounded-lg font-body-sm text-body-sm focus:outline-none focus:border-tertiary-fixed-dim focus:ring-1 focus:ring-tertiary-fixed-dim/30 transition-all input-glow" 
                  placeholder="Search POs, Suppliers, RFQs..." 
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative" ref={notifRef}>
                <button 
                  onClick={() => { setIsNotifOpen(!isNotifOpen); setIsProfileOpen(false); }}
                  className="p-2 text-on-surface-variant hover:text-primary transition-all rounded-full hover:bg-surface-container-high relative"
                >
                  <span className="material-symbols-outlined">notifications</span>
                  <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full animate-pulse"></span>
                </button>
                
                {isNotifOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-surface border border-primary/10 rounded-xl shadow-lg z-50 overflow-hidden">
                    <div className="p-4 border-b border-primary/10 bg-surface-container-lowest flex justify-between items-center">
                      <h3 className="font-semibold text-on-surface">Notifications</h3>
                      <button className="text-[11px] text-primary hover:underline">Mark all read</button>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      <div className="p-3 border-b border-primary/5 hover:bg-surface-container-low cursor-pointer">
                        <p className="font-body-sm text-[13px] text-on-surface"><span className="font-bold">System</span> generated 12 new Purchase Orders.</p>
                        <p className="font-label-mono text-[10px] text-outline mt-1">Just now</p>
                      </div>
                      <div className="p-3 border-b border-primary/5 hover:bg-surface-container-low cursor-pointer">
                        <p className="font-body-sm text-[13px] text-on-surface">Vendor <span className="font-bold">TechCorp</span> updated Quotation.</p>
                        <p className="font-label-mono text-[10px] text-outline mt-1">2 hours ago</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="h-6 w-px bg-primary/20 mx-2"></div>

              <div className="relative" ref={profileRef}>
                <button 
                  onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false); }}
                  className="flex items-center gap-2 pl-2 focus:outline-none"
                >
                  <img alt="User Profile" className="w-8 h-8 rounded-full border border-primary/20 hover:border-primary transition-colors" src={`https://ui-avatars.com/api/?name=${userName}&background=004ac6&color=fff`} />
                </button>
                
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-surface border border-primary/10 rounded-xl shadow-lg z-50 overflow-hidden py-2">
                    <div className="px-4 py-3 border-b border-primary/10 mb-1">
                      <p className="font-body-sm font-semibold text-on-surface truncate">{userName}</p>
                      <p className="font-label-mono text-[11px] text-outline truncate">{currentUser?.email || 'user@vendorvision.com'}</p>
                    </div>
                    <button 
                      onClick={() => { setIsProfileModalOpen(true); setIsProfileOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-on-surface-variant hover:bg-surface-container-low hover:text-primary transition-colors flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">account_circle</span> My Profile
                    </button>
                    <button 
                      onClick={() => { setIsSettingsModalOpen(true); setIsProfileOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-on-surface-variant hover:bg-surface-container-low hover:text-primary transition-colors flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">settings</span> Settings
                    </button>
                    <div className="h-px bg-primary/10 my-1"></div>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-error hover:bg-error/5 transition-colors flex items-center gap-2 font-semibold"
                    >
                      <span className="material-symbols-outlined text-[18px]">logout</span> Log Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Canvas */}
        <main className="flex-1 p-6 overflow-x-hidden overflow-y-auto relative">
          <div className="max-w-[1600px] mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Profile Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-scrim/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface w-full max-w-md rounded-2xl shadow-xl border border-outline-variant/30 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-lowest">
              <h2 className="font-title-lg font-bold text-on-surface">My Profile</h2>
              <button onClick={() => setIsProfileModalOpen(false)} className="text-on-surface-variant hover:text-error transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <img alt="User Profile" className="w-16 h-16 rounded-full border-2 border-primary/20" src={`https://ui-avatars.com/api/?name=${userName}&background=004ac6&color=fff&size=64`} />
                <div>
                  <h3 className="font-title-md font-bold text-on-surface">{userName}</h3>
                  <p className="font-body-sm text-primary font-semibold">{userRole || 'User'}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block font-label-mono text-[11px] uppercase text-outline mb-1">Email Address</label>
                  <input type="text" disabled value={currentUser?.email || ''} className="w-full p-2 bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-on-surface-variant text-[14px]" />
                </div>
                <div>
                  <label className="block font-label-mono text-[11px] uppercase text-outline mb-1">Full Name</label>
                  <input type="text" defaultValue={userName} className="w-full p-2 bg-surface border border-outline-variant/50 rounded-lg text-on-surface text-[14px] focus:outline-none focus:border-primary" />
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-outline-variant/20 bg-surface-container-lowest flex justify-end gap-3">
              <button onClick={() => setIsProfileModalOpen(false)} className="px-4 py-2 font-body-sm font-semibold text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-colors">Cancel</button>
              <button onClick={() => { setIsProfileModalOpen(false); alert("Profile saved!"); }} className="px-4 py-2 font-body-sm font-semibold bg-primary text-on-primary rounded-lg hover:bg-primary/90 transition-colors">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-scrim/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface w-full max-w-lg rounded-2xl shadow-xl border border-outline-variant/30 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-lowest">
              <h2 className="font-title-lg font-bold text-on-surface">System Settings</h2>
              <button onClick={() => setIsSettingsModalOpen(false)} className="text-on-surface-variant hover:text-error transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-title-sm font-semibold text-on-surface mb-4">Preferences</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-body-md font-semibold text-on-surface">Email Notifications</p>
                      <p className="font-body-sm text-on-surface-variant">Receive alerts for important updates</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-body-md font-semibold text-on-surface">Dark Mode</p>
                      <p className="font-body-sm text-on-surface-variant">Switch between light and dark themes</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-outline-variant/20 bg-surface-container-lowest flex justify-end gap-3">
              <button onClick={() => setIsSettingsModalOpen(false)} className="px-4 py-2 font-body-sm font-semibold bg-primary text-on-primary rounded-lg hover:bg-primary/90 transition-colors">Done</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DashboardLayout;

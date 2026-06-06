import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, googleProvider } from '../../config/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendEmailVerification, 
  signInWithPopup, 
  signOut 
} from 'firebase/auth';
import { useAuth } from '../../contexts/AuthContext';

type AuthMode = 'login' | 'register';
type Role = 'Admin' | 'Manager' | 'Vendor' | 'Procurement Officer';

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const navigate = useNavigate();
  const { setUserRole } = useAuth();

  useEffect(() => {
    requestAnimationFrame(() => setIsLoaded(true));
  }, []);

  // When switching to Register, ensure Admin cannot be selected
  useEffect(() => {
    if (mode === 'register' && selectedRole === 'Admin') {
      setSelectedRole(null);
    }
  }, [mode, selectedRole]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (mode === 'register') {
      if (!selectedRole) return setError('Please select a role to register.');
      if (password !== confirmPassword) return setError('Passwords do not match.');
      if (selectedRole === 'Admin') return setError('Cannot register as Admin. Contact system administrator.');
      
      try {
        setLoading(true);
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Save role to Backend
        try {
          await fetch('http://localhost:8000/api/users/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid: user.uid, email: user.email, role: selectedRole })
          });
        } catch (err) {
          console.error("Failed to sync role with backend", err);
          // Proceed anyway as they are registered in Firebase
        }
        
        await sendEmailVerification(user);
        await signOut(auth); // Force them to verify before actually logging in
        
        setSuccess('Registration successful! Please check your Gmail for the verification link.');
        setMode('login'); // Switch to login view automatically
        setPassword('');
        setConfirmPassword('');
      } catch (err: any) {
        setError(err.message || 'Failed to create an account.');
      } finally {
        setLoading(false);
      }
      
    } else {
      // Login Logic
      try {
        setLoading(true);
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        if (!userCredential.user.emailVerified) {
          await signOut(auth);
          setError('Please verify your email address before logging in.');
          setLoading(false);
          return;
        }

        // Fetch their Role from Backend
        let role: Role = 'Admin'; // Default fallback
        try {
          const res = await fetch(`http://localhost:8000/api/users/${userCredential.user.uid}/role`);
          if (res.ok) {
            const data = await res.json();
            if (data.role) role = data.role as Role;
          }
        } catch (err) {
          console.error("Failed to fetch role from backend", err);
          // If we can't hit the backend, try to infer from what they selected or email
          if (selectedRole) role = selectedRole;
        }

        setUserRole(role);
        navigate('/dashboard');
        
      } catch (err: any) {
        setError(err.message || 'Failed to log in.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGoogleAuth = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (mode === 'register' && !selectedRole) {
        setError('Please select a role before registering with Google.');
        setLoading(false);
        return;
      }
      if (mode === 'register' && selectedRole === 'Admin') {
         setError('Cannot register as Admin.');
         setLoading(false);
         return;
      }

      const userCredential = await signInWithPopup(auth, googleProvider);
      const user = userCredential.user;

      if (mode === 'register') {
         // Save role to Backend
         try {
           await fetch('http://localhost:8000/api/users/register', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ uid: user.uid, email: user.email, role: selectedRole })
           });
         } catch (err) {
           console.error("Failed to sync role with backend", err);
         }
         setUserRole(selectedRole!);
         navigate('/dashboard');
      } else {
         // Logging in - fetch role from backend to verify registration
         try {
           const res = await fetch(`http://localhost:8000/api/users/${user.uid}/role`);
           if (res.ok) {
             const data = await res.json();
             if (data.role) {
               setUserRole(data.role as Role);
               navigate('/dashboard');
             } else {
               await signOut(auth);
               throw new Error("Account not found. Please register first.");
             }
           } else {
             await signOut(auth);
             throw new Error("Account not found. Please register first.");
           }
         } catch (err: any) {
           console.error("Failed to fetch role", err);
           await signOut(auth);
           setError(err.message || "Account not found. Please register first.");
           setLoading(false);
           return;
         }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const roleCards = [
    { id: 'Admin', icon: 'shield_person', label: 'Admin', color: 'text-error' },
    { id: 'Manager', icon: 'engineering', label: 'Manager', color: 'text-warning' },
    { id: 'Vendor', icon: 'storefront', label: 'Vendor', color: 'text-success' },
    { id: 'Procurement Officer', icon: 'account_balance', label: 'Officer', color: 'text-primary' },
  ];

  return (
    <div className="bg-background text-on-background min-h-screen flex relative overflow-hidden font-body-md text-body-md w-full">
      
      {/* LEFT SIDE - Landing Page Area */}
      <div className="hidden lg:flex lg:w-[45%] relative flex-col justify-between p-12 bg-primary overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-primary to-[#2563eb] opacity-100"></div>
        <div className="absolute top-0 left-0 right-0 bottom-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute -bottom-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-white/10 blur-3xl"></div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20 shadow-lg">
            <span className="material-symbols-outlined text-white text-[24px]">corporate_fare</span>
          </div>
          <span className="text-white font-display-md text-[24px] font-bold tracking-tight">VendorBridge</span>
        </div>

        <div className="relative z-10 max-w-lg mb-10">
          <div className="inline-block px-3 py-1 mb-6 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-[12px] font-semibold tracking-wider uppercase">
            Enterprise Procurement
          </div>
          <h1 className="text-white font-display-lg text-[44px] font-bold leading-[1.15] mb-8">
            Streamline your supply chain with intelligent sourcing.
          </h1>
          
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 relative">
            <span className="material-symbols-outlined absolute -top-4 -left-2 text-[48px] text-white/20 transform -rotate-12">format_quote</span>
            <p className="text-white/90 font-body-lg text-[16px] leading-relaxed mb-6 italic relative z-10">
              "VendorBridge has completely transformed how we manage our supply chain. The real-time transparency and seamless vendor allocation have saved us countless hours of manual tracking. Highly recommended for any growing enterprise."
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-400 to-emerald-400 flex items-center justify-center shadow-lg border-2 border-white/20">
                <span className="text-white font-bold text-lg">SJ</span>
              </div>
              <div>
                <p className="text-white font-bold text-[15px]">Sarah Jenkins</p>
                <p className="text-white/70 text-[13px]">Director of Procurement, TechNova</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - Form Area */}
      <div className="w-full lg:w-[55%] flex items-center justify-center relative p-6">
        {/* Ambient Glow Effects for right side */}
        <div className="ambient-glow" style={{ top: '-100px', right: '-100px' }}></div>
        <div className="ambient-glow" style={{ bottom: '-150px', left: '-50px', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(76, 215, 246, 0.03) 0%, rgba(255, 255, 255, 0) 70%)' }}></div>
        
        <div className={`glass-card smart-border rounded-2xl w-full max-w-[460px] p-8 relative z-10 transition-all duration-[400ms] ease-out shadow-2xl ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
              <span className="material-symbols-outlined text-primary text-[20px]">corporate_fare</span>
            </div>
            <span className="text-on-surface font-display-md text-[20px] font-bold tracking-tight">VendorBridge</span>
          </div>

          {/* Top Toggle Login / Register */}
          <div className="flex bg-surface-container-low p-1 rounded-xl mb-8 relative">
            <button 
              type="button"
              className={`flex-1 py-2.5 text-[14px] font-title-sm font-medium rounded-lg z-10 transition-all duration-300 ${mode === 'login' ? 'text-on-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
              onClick={() => setMode('login')}
            >
              Login
            </button>
            <button 
              type="button"
              className={`flex-1 py-2.5 text-[14px] font-title-sm font-medium rounded-lg z-10 transition-all duration-300 ${mode === 'register' ? 'text-on-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
              onClick={() => setMode('register')}
            >
              Register
            </button>
            {/* Animated background pill */}
            <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-primary rounded-lg transition-transform duration-300 ease-out shadow-md`} style={{ transform: mode === 'login' ? 'translateX(0)' : 'translateX(calc(100% + 8px))' }}></div>
          </div>

          <div className="text-center mb-8">
            <h2 className="font-label-mono text-[11px] text-on-surface-variant uppercase tracking-widest mb-4">Select Your Role</h2>
            
            <div className="grid grid-cols-4 gap-3">
              {roleCards.map((r) => {
                const isDisabled = mode === 'register' && r.id === 'Admin';
                const isSelected = selectedRole === r.id;
                
                return (
                  <button
                    key={r.id}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => setSelectedRole(r.id as Role)}
                    className={`flex flex-col items-center justify-center py-4 px-2 rounded-xl border-2 transition-all duration-200 ${
                      isDisabled 
                        ? 'opacity-40 cursor-not-allowed border-outline-variant bg-surface-container-lowest grayscale' 
                        : isSelected 
                          ? 'border-primary bg-primary/5 shadow-sm transform scale-[1.02]' 
                          : 'border-outline-variant bg-surface-container-lowest hover:border-outline hover:bg-surface-container-low'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${isSelected ? 'bg-primary/20 ' + r.color : 'bg-surface-container ' + r.color}`}>
                      <span className="material-symbols-outlined" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>{r.icon}</span>
                    </div>
                    <span className="font-title-sm text-[12px] whitespace-nowrap">{r.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {mode === 'login' && (
            <>
              <div className="flex items-center gap-4 mb-6">
                <div className="h-[1px] flex-1 bg-outline-variant/50"></div>
                <span className="font-label-mono text-[10px] text-on-surface-variant uppercase tracking-widest">OR</span>
                <div className="h-[1px] flex-1 bg-outline-variant/50"></div>
              </div>

              {/* Google Auth */}
              <button 
                type="button"
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-surface-container-lowest border border-outline-variant text-on-surface hover:bg-surface-container-low transition-colors font-body-md font-semibold mb-6 shadow-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
            </>
          )}

          {error && <div className="mb-6 p-3 bg-error-container/50 text-error rounded-xl text-[13px] text-center font-semibold border border-error/20">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {mode === 'register' && (
              <div>
                <label className="block font-label-mono text-[11px] text-on-surface-variant mb-1.5 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline">
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person</span>
                  </div>
                  <input 
                    className="block w-full pl-10 pr-3 py-3 border border-outline-variant rounded-xl bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 placeholder-outline/50 font-body-md text-[14px]" 
                    placeholder="John Doe" required type="text" value={name} onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block font-label-mono text-[11px] text-on-surface-variant mb-1.5 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>mail</span>
                </div>
                <input 
                  className="block w-full pl-10 pr-3 py-3 border border-outline-variant rounded-xl bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 placeholder-outline/50 font-body-md text-[14px]" 
                  placeholder="your@email.com" required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block font-label-mono text-[11px] text-on-surface-variant uppercase tracking-wider">Password</label>
                {mode === 'login' && <a href="#" className="font-body-sm text-[12px] text-primary font-semibold hover:underline">Forgot password?</a>}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>lock</span>
                </div>
                <input 
                  className="block w-full pl-10 pr-10 py-3 border border-outline-variant rounded-xl bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 placeholder-outline/50 font-body-md text-[14px]" 
                  placeholder="••••••••" required type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-outline hover:text-on-surface transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block font-label-mono text-[11px] text-on-surface-variant mb-1.5 uppercase tracking-wider">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline">
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>lock_reset</span>
                  </div>
                  <input 
                    className="block w-full pl-10 pr-3 py-3 border border-outline-variant rounded-xl bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 placeholder-outline/50 font-body-md text-[14px]" 
                    placeholder="••••••••" required type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="pt-4">
              <button 
                type="submit" disabled={loading}
                className="w-full flex justify-center py-3.5 px-4 rounded-xl text-on-primary font-title-md text-[16px] font-bold bg-primary hover:bg-primary/90 transform hover:-translate-y-[1px] active:translate-y-[1px] transition-all duration-200 shadow-lg shadow-primary/25"
              >
                {loading ? 'Processing...' : mode === 'login' ? 'Login to Dashboard ➔' : 'Create Account ➔'}
              </button>
            </div>

          </form>
        </div>
      </div>

      {/* Success Modal Popup */}
      {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm transition-opacity duration-300">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center transform scale-100 transition-transform duration-300">
            <div className="w-16 h-16 bg-success-container/30 text-success rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>mark_email_read</span>
            </div>
            <h3 className="font-display-sm text-[24px] text-on-surface mb-2 font-bold">Registration Successful!</h3>
            <p className="font-body-md text-on-surface-variant mb-6 leading-relaxed">
              We've sent a verification link to your Gmail. Please check your inbox (and <span className="font-medium text-warning">Spam folder</span>) to verify your account before logging in.
            </p>
            <button 
              onClick={() => setSuccess('')}
              className="w-full py-3 px-4 rounded-xl text-on-primary font-title-sm text-[16px] bg-primary hover:bg-primary/90 transition-all duration-200"
            >
              Back to Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Auth;

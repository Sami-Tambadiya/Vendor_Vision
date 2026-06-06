import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { auth } from '../config/firebase';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';

type Role = 'Admin' | 'Procurement Officer' | 'Vendor' | 'Manager' | null;

interface AuthContextType {
  currentUser: User | null;
  userRole: Role;
  setUserRole: (role: Role) => void;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userRole: null,
  setUserRole: () => {},
  logout: async () => {},
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<Role>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const res = await fetch(`http://localhost:8000/api/users/${user.uid}/role`);
          if (res.ok) {
            const data = await res.json();
            if (data.role) {
              setUserRole(data.role as Role);
            } else {
              setUserRole('Admin'); // fallback
            }
          }
        } catch (error) {
          console.error("Failed to fetch user role on init:", error);
          setUserRole('Admin'); // fallback
        }
      } else {
        setUserRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    await signOut(auth);
    setUserRole(null);
  };

  const value = {
    currentUser,
    userRole,
    setUserRole,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

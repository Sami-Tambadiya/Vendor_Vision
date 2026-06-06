import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminUsers = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/users');
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
    setLoading(false);
  };

  const handleDelete = async (uid: string) => {
    if (!window.confirm("Are you sure you want to remove this user?")) return;
    try {
      await axios.delete(`http://localhost:8000/api/users/${uid}`);
      setUsers(users.filter(u => u.uid !== uid));
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to remove user.");
    }
  };

  return (
    <div className="bg-background">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="font-display-lg text-[32px] font-bold text-on-surface">Manage Users</h2>
          <p className="font-body-md text-on-surface-variant mt-1">View and manage system users and roles</p>
        </div>
      </div>

      <div className="glass-card rounded-2xl border border-outline-variant/30 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-surface-container-lowest/80 text-outline text-[11px] uppercase border-b border-outline-variant/30">
            <tr>
              <th className="py-4 px-6">Name</th>
              <th className="py-4 px-6">Email</th>
              <th className="py-4 px-6">Role</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-[14px]">
            {loading ? (
              <tr><td colSpan={4} className="py-8 text-center text-on-surface-variant">Loading users...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={4} className="py-8 text-center text-on-surface-variant">No users found.</td></tr>
            ) : users.map(user => (
              <tr key={user.uid} className="border-b border-outline-variant/10 hover:bg-surface-container-lowest transition-colors">
                <td className="py-4 px-6 font-semibold text-on-surface">{user.full_name || 'System User'}</td>
                <td className="py-4 px-6 text-on-surface-variant">{user.email}</td>
                <td className="py-4 px-6">
                  <span className={`px-2 py-1 rounded-md text-[11px] font-semibold tracking-wide ${
                    user.role === 'Admin' ? 'bg-[#004ac6]/10 text-[#004ac6]' : 
                    user.role === 'Vendor' ? 'bg-[#d97706]/10 text-[#d97706]' : 
                    user.role === 'Manager' ? 'bg-[#16a34a]/10 text-[#16a34a]' : 
                    'bg-outline-variant/20 text-on-surface-variant'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  {user.role !== 'Admin' && (
                    <button 
                      onClick={() => handleDelete(user.uid)}
                      className="text-error hover:text-error/80 transition-colors p-2 rounded-full hover:bg-error/10"
                      title="Remove User"
                    >
                      <span className="material-symbols-outlined text-[20px]">person_remove</span>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;

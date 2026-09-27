import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { api } from '../services/api';
import { ROLE_DASHBOARDS } from '../config/permissions';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState(null);
  const [company, setCompany] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpiredModalOpen, setSessionExpiredModalOpen] = useState(false);

  // Helper method: Check permission
  const hasPermission = useCallback((perm) => {
    if (!perm) return true;
    if (role === 'SUPER_ADMIN' || role === 'HR_ADMIN') return true;
    if (permissions.includes('*') || permissions.includes('all')) return true;
    return permissions.includes(perm);
  }, [permissions, role]);

  // Helper method: Check role
  const hasRole = useCallback((requiredRole) => {
    if (!requiredRole) return true;
    if (role === 'SUPER_ADMIN') return true;
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(role);
    }
    return role === requiredRole;
  }, [role]);

  // Fetch / refresh user session & profile
  const refreshSession = useCallback(async () => {
    setLoading(true);
    try {
      const storedToken = localStorage.getItem('access_token');
      if (!storedToken) {
        setUser(null);
        setProfile(null);
        setRole(null);
        setCompany(null);
        setPermissions([]);
        setSession(null);
        setLoading(false);
        return null;
      }

      // Query current user from API endpoint /api/auth/me
      try {
        const response = await api.get('/auth/me');
        if (response && response.success && response.data?.user) {
          const u = response.data.user;
          setUser(u);
          setProfile(u);
          setRole(u.roles?.[0] || 'EMPLOYEE');
          setCompany(u.company || { name: 'Acme Enterprise', code: 'ACME' });
          setPermissions(u.permissions || []);
          setSession({ token: storedToken });
          setLoading(false);
          return u;
        }
      } catch (networkErr) {
        // Fallback for saved local demo session if server is offline
        const savedUserStr = localStorage.getItem('demo_user_data');
        if (savedUserStr) {
          const u = JSON.parse(savedUserStr);
          setUser(u);
          setProfile(u);
          setRole(u.roles?.[0] || 'EMPLOYEE');
          setCompany(u.company || { name: 'Acme Enterprise', code: 'ACME' });
          setPermissions(u.permissions || []);
          setSession({ token: storedToken });
          setLoading(false);
          return u;
        }
      }
    } catch (err) {
      console.warn('[AuthContext] Session verification warning:', err.message);
      if (err.status === 401) {
        setSessionExpiredModalOpen(true);
      }
    } finally {
      setLoading(false);
    }
    return null;
  }, []);

  useEffect(() => {
    refreshSession();

    // Listen to window session expired events
    const handleExpired = () => {
      setSessionExpiredModalOpen(true);
    };
    window.addEventListener('app:session-expired', handleExpired);
    return () => window.removeEventListener('app:session-expired', handleExpired);
  }, [refreshSession]);

  // Login method
  const login = async ({ email, password, rememberMe }) => {
    setLoading(true);
    try {
      let response;
      try {
        response = await api.post('/auth/login', { email, password, rememberMe });
      } catch (apiErr) {
        console.warn('[AuthContext] API network error, utilizing client session fallback:', apiErr);
      }

      if (response && response.success && response.data) {
        const { user: userData, company: companyData, roles, permissions: permList, token } = response.data;
        localStorage.setItem('access_token', token);
        setUser(userData);
        setProfile(userData);
        const primaryRole = roles?.[0] || 'EMPLOYEE';
        setRole(primaryRole);
        setCompany(companyData);
        setPermissions(permList || []);
        setSession({ token });
        setLoading(false);

        if (userData.isFirstLogin || !userData.profileCompleted) {
          return { redirect: '/first-login', role: primaryRole, user: userData };
        }
        const targetDashboard = ROLE_DASHBOARDS[primaryRole] || '/employee/dashboard';
        return { redirect: targetDashboard, role: primaryRole, user: userData };
      }

      // Offline / Demo Fallback Mode
      let demoRole = 'EMPLOYEE';
      let isFirstLogin = false;
      if (email.includes('superadmin')) demoRole = 'SUPER_ADMIN';
      else if (email.includes('hradmin') || email.includes('hr@')) demoRole = 'HR_ADMIN';
      else if (email.includes('manager')) demoRole = 'MANAGER';
      else if (email.includes('newemployee')) {
        demoRole = 'EMPLOYEE';
        isFirstLogin = true;
      }

      const mockUserData = {
        id: 'usr_demo_101',
        email,
        name: email.split('@')[0].toUpperCase(),
        roles: [demoRole],
        company_id: 'comp_demo_acme',
        isFirstLogin,
        profileCompleted: !isFirstLogin,
        permissions: ['read', 'write', 'admin', 'reports', 'payroll'],
        company: { name: 'Acme Enterprise Pvt Ltd', code: 'ACME' },
      };

      const token = `demo_jwt_token_${Date.now()}`;
      localStorage.setItem('access_token', token);
      localStorage.setItem('demo_user_data', JSON.stringify(mockUserData));

      setUser(mockUserData);
      setProfile(mockUserData);
      setRole(demoRole);
      setCompany(mockUserData.company);
      setPermissions(mockUserData.permissions);
      setSession({ token });
      setLoading(false);

      if (isFirstLogin) {
        return { redirect: '/first-login', role: demoRole, user: mockUserData };
      }

      const targetDashboard = ROLE_DASHBOARDS[demoRole] || '/employee/dashboard';
      return { redirect: targetDashboard, role: demoRole, user: mockUserData };
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  // Logout method
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.warn('[Logout Warning]:', err);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('demo_user_data');
      await supabase.auth.signOut().catch(() => {});
      setUser(null);
      setProfile(null);
      setRole(null);
      setCompany(null);
      setPermissions([]);
      setSession(null);
      setSessionExpiredModalOpen(false);
    }
  };

  const closeSessionExpiredModal = () => {
    setSessionExpiredModalOpen(false);
    logout();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        company,
        permissions,
        session,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshSession,
        hasPermission,
        hasRole,
        sessionExpiredModalOpen,
        closeSessionExpiredModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [adminProfile, setAdminProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  // True while the admin_users membership check is in flight (separate from
  // session loading) so guards never flash 403 for a legitimate admin.
  const [privilegesLoading, setPrivilegesLoading] = useState(false);

  // Verifies if an authenticated user exists in the admin_users table
  const verifyAdminPrivileges = async (currentUser) => {
    if (!currentUser || !supabase || !isSupabaseConfigured) {
      setAdminProfile(null);
      setIsAdmin(false);
      return false;
    }

    setPrivilegesLoading(true);
    try {
      // 1. Try public.is_admin() RPC function if present in Supabase
      try {
        const { data: rpcIsAdmin, error: rpcErr } = await supabase.rpc('is_admin');
        if (!rpcErr && rpcIsAdmin === true) {
          setIsAdmin(true);
          // Also fetch profile row if possible
          const { data: profile } = await supabase
            .from('admin_users')
            .select('*')
            .eq('user_id', currentUser.id)
            .maybeSingle();

          setAdminProfile(profile || { user_id: currentUser.id, email: currentUser.email });
          return true;
        }
      } catch {
        // Fall through to direct table check
      }

      // 2. Direct query on public.admin_users table
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', currentUser.id)
        .maybeSingle();

      if (error) {
        if (import.meta.env.DEV) {
          console.warn('[1TAP Admin] admin_users lookup failed:', error.message);
        }
        // Fail closed: any lookup error means no admin access.
        setAdminProfile(null);
        setIsAdmin(false);
        return false;
      }

      if (data) {
        setAdminProfile(data);
        setIsAdmin(true);
        return true;
      } else {
        setAdminProfile(null);
        setIsAdmin(false);
        return false;
      }
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('[1TAP Admin] Failed to verify admin status:', err);
      }
      setAdminProfile(null);
      setIsAdmin(false);
      return false;
    } finally {
      setPrivilegesLoading(false);
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    // 1. Initial session check
    const checkInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          if (import.meta.env.DEV) {
            console.warn('[1TAP Admin] Session retrieval error:', error.message);
          }
        }

        if (session?.user && isMounted) {
          setUser(session.user);
          await verifyAdminPrivileges(session.user);
        } else if (isMounted) {
          setUser(null);
          setAdminProfile(null);
          setIsAdmin(false);
        }
      } catch (err) {
        if (import.meta.env.DEV) {
          console.error('[1TAP Admin] Error during initial auth check:', err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkInitialSession();

    // 2. Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        if (session?.user) {
          setUser(session.user);
          await verifyAdminPrivileges(session.user);
        } else {
          setUser(null);
          setAdminProfile(null);
          setIsAdmin(false);
        }
        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // Login handler
  const login = async (email, password) => {
    setAuthError(null);

    if (!isSupabaseConfigured || !supabase) {
      return {
        success: false,
        error: 'Supabase credentials are not configured or invalid in your .env / .env.local file.'
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (error) {
        let errorMsg = error.message;
        if (errorMsg === 'Failed to fetch' || errorMsg.includes('fetch')) {
          errorMsg = 'Failed to connect to Supabase (Network / DNS error). Please check that your Supabase Project URL in .env is valid, not paused, and accessible.';
        }
        setAuthError(errorMsg);
        return { success: false, error: errorMsg };
      }

      if (data?.user) {
        setUser(data.user);
        const hasAdminRole = await verifyAdminPrivileges(data.user);
        if (!hasAdminRole) {
          // Generic customer-safe message. Detailed reason stays in dev-only logs.
          if (import.meta.env.DEV) {
            console.debug('[1TAP Admin] Login denied: authenticated user has no admin_users row.', {
              email: data.user.email,
              userId: data.user.id,
            });
          }
          // Fail closed: keep the session but deny admin access, so the
          // 403 page (ProtectedAdminRoute) handles the signed-in non-admin.
          // No privileges are granted here and nothing is written to admin_users.
          return {
            success: false,
            error: 'Access denied. This account is not authorized for the admin portal.'
          };
        }
        return { success: true, user: data.user };
      }

      return { success: false, error: 'Authentication failed. Please check your credentials.' };
    } catch (err) {
      let msg = err.message || 'An unexpected error occurred during login.';
      if (msg === 'Failed to fetch' || msg.includes('fetch')) {
        msg = 'Failed to connect to Supabase (Network / DNS error). Please verify your VITE_SUPABASE_URL in .env / .env.local.';
      }
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      if (supabase) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      if (import.meta.env.DEV) {
        console.warn('[1TAP Admin] Error during sign out:', err);
      }
    } finally {
      setUser(null);
      setAdminProfile(null);
      setIsAdmin(false);
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        adminProfile,
        isAdmin,
        loading,
        authError,
        login,
        logout,
        isConfigured: isSupabaseConfigured,
        privilegesLoading,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

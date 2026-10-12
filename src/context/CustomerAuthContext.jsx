import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import {
  fetchCustomerProfile,
  createOrUpsertCustomerProfile,
  updateCustomerProfile
} from '../services/customerService';

const CustomerAuthContext = createContext(null);

export const CustomerAuthProvider = ({ children }) => {
  const [customerUser, setCustomerUser] = useState(null);
  const [customerProfile, setCustomerProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Loads profile from public.profiles
  const loadProfile = async (user) => {
    if (!user || !supabase || !isSupabaseConfigured) {
      setCustomerProfile(null);
      return null;
    }

    try {
      const res = await fetchCustomerProfile(user.id);
      if (res.success && res.profile) {
        // Existing profile found — preserve customer-edited info, DO NOT overwrite
        setCustomerProfile(res.profile);
        return res.profile;
      } else {
        // If profile row doesn't exist yet (e.g. first-time Google sign-in or direct sign-up)
        const fullNameFromMeta =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          (user.user_metadata?.given_name
            ? `${user.user_metadata.given_name} ${user.user_metadata.family_name || ''}`.trim()
            : '') ||
          '';

        const defaultProfile = {
          fullName: fullNameFromMeta,
          email: user.email || '',
          phone: user.user_metadata?.phone || ''
        };
        const createRes = await createOrUpsertCustomerProfile(user.id, defaultProfile);
        if (createRes.success && createRes.profile) {
          setCustomerProfile(createRes.profile);
          return createRes.profile;
        }
      }
    } catch (err) {
      console.warn('Could not load profile:', err);
    }
    return null;
  };

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    // Check initial session
    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && isMounted) {
          setCustomerUser(session.user);
          await loadProfile(session.user);
        } else if (isMounted) {
          setCustomerUser(null);
          setCustomerProfile(null);
        }
      } catch (err) {
        console.warn('Initial session check error:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initSession();

    // Listen for auth state changes (including Google OAuth redirects)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        if (session?.user) {
          setCustomerUser(session.user);
          await loadProfile(session.user);
        } else {
          setCustomerUser(null);
          setCustomerProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // Customer Email/Password Login
  const login = async (email, password) => {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: 'Supabase credentials are not configured in .env' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data?.user) {
        setCustomerUser(data.user);
        await loadProfile(data.user);
        return { success: true, user: data.user };
      }

      return { success: false, error: 'Authentication failed. Please try again.' };
    } catch (err) {
      return { success: false, error: err.message || 'An unexpected error occurred during login.' };
    }
  };

  // Customer Google OAuth Sign-in
  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: 'Supabase credentials are not configured in .env' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message || 'An unexpected error occurred during Google sign-in.' };
    }
  };

  // Customer Password Reset Request
  const resetPassword = async (email) => {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: 'Supabase credentials are not configured in .env' };
    }

    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/login`
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message || 'An unexpected error occurred during password reset.' };
    }
  };

  // Customer Register
  const register = async (email, password, profileData = {}) => {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: 'Supabase credentials are not configured in .env' };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: profileData.fullName || profileData.full_name || '',
            phone: profileData.phone || ''
          }
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data?.user) {
        setCustomerUser(data.user);

        // Upsert customer profile in public.profiles table
        const profilePayload = {
          fullName: profileData.fullName || profileData.full_name || '',
          phone: profileData.phone || '',
          email: email.trim(),
          address: profileData.address || '',
          city: profileData.city || '',
          state: profileData.state || '',
          pincode: profileData.pincode || ''
        };

        const profileRes = await createOrUpsertCustomerProfile(data.user.id, profilePayload);
        if (profileRes.success) {
          setCustomerProfile(profileRes.profile);
        }

        return { success: true, user: data.user, session: data.session };
      }

      return { success: false, error: 'Registration failed. Please check your inputs.' };
    } catch (err) {
      return { success: false, error: err.message || 'An unexpected error occurred during registration.' };
    }
  };

  // Customer Logout
  const logout = async () => {
    try {
      if (supabase) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn('Logout exception:', err);
    } finally {
      setCustomerUser(null);
      setCustomerProfile(null);
    }
  };

  // Update Customer Profile
  const handleUpdateProfile = async (formData) => {
    if (!customerUser) {
      return { success: false, error: 'No authenticated user found.' };
    }

    const res = await updateCustomerProfile(customerUser.id, formData);
    if (res.success && res.profile) {
      setCustomerProfile(res.profile);
      return { success: true, profile: res.profile };
    }
    return { success: false, error: res.error || 'Failed to update profile.' };
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        customerUser,
        customerProfile,
        loading,
        isAuthenticated: Boolean(customerUser),
        login,
        signInWithGoogle,
        resetPassword,
        register,
        logout,
        updateProfile: handleUpdateProfile,
        refreshProfile: () => loadProfile(customerUser)
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
};

export const useCustomerAuth = () => {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return context;
};

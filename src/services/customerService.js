import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Fetches the customer profile for the currently authenticated user
 *
 * @param {string} userId - Auth user UUID
 * @returns {Promise<{success: boolean, profile?: Object, error?: string}>}
 */
export async function fetchCustomerProfile(userId) {
  if (!userId) {
    return { success: false, error: 'User ID is required', profile: null };
  }

  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Supabase is not configured', profile: null };
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.warn('Error fetching customer profile:', error.message);
      return { success: false, error: error.message, profile: null };
    }

    return { success: true, profile: data };
  } catch (err) {
    console.error('Unexpected error fetching profile:', err);
    return { success: false, error: err.message, profile: null };
  }
}

/**
 * Upserts a customer profile record upon registration or initial setup
 *
 * @param {string} userId - Auth user UUID
 * @param {Object} profileData - Profile fields
 * @returns {Promise<{success: boolean, profile?: Object, error?: string}>}
 */
export async function createOrUpsertCustomerProfile(userId, profileData) {
  if (!userId) {
    return { success: false, error: 'User ID is required' };
  }

  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Supabase is not configured' };
  }

  try {
    const payload = {
      id: userId,
      full_name: profileData.fullName?.trim() || profileData.full_name?.trim() || '',
      phone: profileData.phone?.trim() || '',
      email: profileData.email?.trim() || '',
      address: profileData.address?.trim() || '',
      city: profileData.city?.trim() || '',
      state: profileData.state?.trim() || '',
      pincode: profileData.pincode?.trim() || ''
    };

    const { data, error } = await supabase
      .from('profiles')
      .upsert([payload], { onConflict: 'id' })
      .select('*')
      .single();

    if (error) {
      console.error('Error creating/upserting profile:', error);
      return { success: false, error: error.message };
    }

    return { success: true, profile: data };
  } catch (err) {
    console.error('Unexpected error upserting profile:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Updates an existing customer profile record (upserts if initial record was pending)
 *
 * @param {string} userId - Auth user UUID
 * @param {Object} profileData - Profile fields to update
 * @returns {Promise<{success: boolean, profile?: Object, error?: string}>}
 */
export async function updateCustomerProfile(userId, profileData) {
  if (!userId) {
    return { success: false, error: 'User ID is required' };
  }

  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Supabase is not configured' };
  }

  try {
    const payload = {
      id: userId,
      full_name: profileData.fullName?.trim() || profileData.full_name?.trim() || '',
      phone: profileData.phone?.trim() || '',
      address: profileData.address?.trim() || '',
      city: profileData.city?.trim() || '',
      state: profileData.state?.trim() || '',
      pincode: profileData.pincode?.trim() || ''
    };

    const { data, error } = await supabase
      .from('profiles')
      .upsert([payload], { onConflict: 'id' })
      .select('*')
      .single();

    if (error) {
      console.error('Error updating customer profile:', error);
      return { success: false, error: error.message };
    }

    return { success: true, profile: data };
  } catch (err) {
    console.error('Unexpected error updating customer profile:', err);
    return { success: false, error: err.message };
  }
}


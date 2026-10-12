import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Submits a customer contact inquiry to Supabase
 *
 * @param {Object} inquiryData - { name, email, phone, message }
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function submitInquiry(inquiryData) {
  const name = (inquiryData.name || '').trim();
  const email = (inquiryData.email || '').trim();
  const phone = (inquiryData.phone || '').trim();
  const message = (inquiryData.message || '').trim();

  if (!name || !email || !message) {
    return { success: false, error: 'Please provide name, email, and your inquiry message.' };
  }
  if (name.length > 120) {
    return { success: false, error: 'Please keep your name under 120 characters.' };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return { success: false, error: 'Please enter a valid email address.' };
  }
  if (phone && !/^[+\d][\d\s-]{6,19}$/.test(phone)) {
    return { success: false, error: 'Please enter a valid phone number.' };
  }
  if (message.length < 10) {
    return { success: false, error: 'Please describe your inquiry in at least 10 characters.' };
  }
  if (message.length > 2000) {
    return { success: false, error: 'Please keep your message under 2000 characters.' };
  }

  if (!isSupabaseConfigured || !supabase) {
    console.info('ℹ️ Simulated inquiry submission (Supabase not configured):', inquiryData);
    return { success: true, simulated: true };
  }

  try {
    const payload = {
      name,
      email,
      phone: phone || null,
      message,
      status: 'New'
    };

    const { data, error } = await supabase
      .from('inquiries')
      .insert([payload])
      .select('*')
      .single();

    if (error) {
      console.error('Inquiry submission error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, inquiry: data };
  } catch (err) {
    console.error('Unexpected inquiry error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Fetches all customer inquiries for admin dashboard
 */
export async function fetchAdminInquiries() {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Supabase credentials not configured', inquiries: [] };
  }

  try {
    const { data, error } = await supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching inquiries:', error);
      return { success: false, error: error.message, inquiries: [] };
    }

    return { success: true, inquiries: data || [] };
  } catch (err) {
    console.error('Unexpected error fetching inquiries:', err);
    return { success: false, error: err.message, inquiries: [] };
  }
}

import { supabase, isSupabaseConfigured } from './supabase';
import { getAllProducts as getFallbackProducts, getProductById as getFallbackProductById } from '../data/products';

/**
 * Validates and normalizes product data for customer UI consumption
 */
function normalizeProduct(item) {
  if (!item) return null;
  const price = Number(item.price) || 0;
  const discountPrice = item.discount_price ? Number(item.discount_price) : (item.discountPrice ? Number(item.discountPrice) : null);
  const isOutOfStock = item.status === 'Out of Stock' || (item.stock !== undefined && item.stock <= 0);

  // Parse additional images if stored as string or array
  let additionalImages = [];
  if (Array.isArray(item.additional_images)) {
    additionalImages = item.additional_images;
  } else if (typeof item.additional_images === 'string') {
    try {
      additionalImages = JSON.parse(item.additional_images);
    } catch {
      additionalImages = [];
    }
  }

  // Parse benefits list from string or array
  let highlights = [];
  if (Array.isArray(item.highlights)) {
    highlights = item.highlights;
  } else if (item.benefits) {
    highlights = item.benefits
      .split('\n')
      .map((b) => b.trim())
      .filter(Boolean);
  }

  return {
    id: item.id,
    name: item.name,
    slug: item.slug || item.id,
    category: item.category || 'Skin Care',
    price: price,
    discountPrice: discountPrice,
    formattedPrice: `₹${price.toLocaleString('en-IN')}`,
    formattedOriginalPrice: discountPrice ? `₹${discountPrice.toLocaleString('en-IN')}` : null,
    stock: item.stock ?? 0,
    isOutOfStock: isOutOfStock,
    status: item.status || 'Active',
    sku: item.sku || '',
    brand: item.brand || 'Featured Brand',
    image: item.image_url || item.image,
    imageUrl: item.image_url || item.image,
    additionalImages: additionalImages,
    shortDescription: item.description || item.shortDescription || '',
    fullDescription: item.description || item.fullDescription || '',
    ingredients: item.ingredients || '',
    howToUse: item.how_to_use || item.howToUse || '',
    benefits: item.benefits || '',
    highlights: highlights.length > 0 ? highlights : [
      'Deep 24-hour hydration barrier',
      'Ultra-lightweight, fast absorbing',
      'Infused with Hyaluronic Acid & Botanicals',
      '100% Cruelty-Free & Dermatologically Tested'
    ],
    details: {
      volume: item.size || '30ml / 1.0 fl oz',
      skinType: 'All Skin Types',
      application: item.how_to_use || 'Apply 3-4 drops to cleansed face morning and night.'
    },
    createdAt: item.created_at || new Date().toISOString()
  };
}

/**
 * Fetches all Active products for public customer storefront
 */
export async function fetchPublicProducts() {
  if (!isSupabaseConfigured || !supabase) {
    return getFallbackProducts().map(normalizeProduct);
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('status', 'Active')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Could not fetch active products from Supabase, using fallback catalog:', error.message);
      return getFallbackProducts().map(normalizeProduct);
    }

    if (!data || data.length === 0) {
      return getFallbackProducts().map(normalizeProduct);
    }

    return data.map(normalizeProduct);
  } catch (err) {
    console.warn('Error fetching public products:', err);
    return getFallbackProducts().map(normalizeProduct);
  }
}

/**
 * Fetches single product by ID or Slug for public customer storefront
 */
export async function fetchPublicProductById(id) {
  if (!id) return null;

  if (!isSupabaseConfigured || !supabase) {
    const fallback = getFallbackProductById(id);
    return fallback ? normalizeProduct(fallback) : null;
  }

  try {
    // Check by ID or slug
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    let query = supabase.from('products').select('*').eq('status', 'Active');
    if (isUuid) {
      query = query.or(`id.eq.${id},slug.eq.${id}`);
    } else {
      query = query.eq('slug', id);
    }

    const { data, error } = await query.maybeSingle();

    if (error || !data) {
      const fallback = getFallbackProductById(id);
      return fallback ? normalizeProduct(fallback) : null;
    }

    return normalizeProduct(data);
  } catch (err) {
    console.warn('Error fetching public product by id:', err);
    const fallback = getFallbackProductById(id);
    return fallback ? normalizeProduct(fallback) : null;
  }
}

/**
 * Searches active products by name, category, brand, and details
 */
export async function searchPublicProducts(searchTerm) {
  if (!searchTerm || !searchTerm.trim()) return [];
  const term = searchTerm.trim().toLowerCase();

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'Active');

      if (!error && data) {
        const matches = data.filter((item) => {
          const name = (item.name || '').toLowerCase();
          const category = (item.category || '').toLowerCase();
          const brand = (item.brand || '').toLowerCase();
          const sku = (item.sku || '').toLowerCase();
          const desc = (item.description || '').toLowerCase();
          const benefits = (item.benefits || '').toLowerCase();
          const ingredients = (item.ingredients || '').toLowerCase();
          return (
            name.includes(term) ||
            category.includes(term) ||
            brand.includes(term) ||
            sku.includes(term) ||
            desc.includes(term) ||
            benefits.includes(term) ||
            ingredients.includes(term)
          );
        });
        return matches.map(normalizeProduct);
      }
    } catch (err) {
      console.warn('Error searching Supabase products:', err);
    }
  }

  // Fallback search
  const fallback = getFallbackProducts();
  return fallback
    .filter((item) => {
      const name = (item.name || '').toLowerCase();
      const category = (item.category || '').toLowerCase();
      const brand = (item.brand || '').toLowerCase();
      const sku = (item.sku || '').toLowerCase();
      const desc = (item.shortDescription || item.fullDescription || '').toLowerCase();
      return (
        name.includes(term) ||
        category.includes(term) ||
        brand.includes(term) ||
        sku.includes(term) ||
        desc.includes(term)
      );
    })
    .map(normalizeProduct);
}


/**
 * Fetches products for admin management (includes Active, Draft, Out of Stock)
 */
export async function fetchAdminProducts({ search = '', category = 'All', status = 'All' } = {}) {
  if (!isSupabaseConfigured || !supabase) {
    return {
      success: false,
      error: 'Supabase credentials are not configured in .env',
      products: []
    };
  }

  try {
    let query = supabase.from('products').select('*').order('created_at', { ascending: false });

    if (category && category !== 'All') {
      query = query.eq('category', category);
    }

    if (status && status !== 'All') {
      query = query.eq('status', status);
    }

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      query = query.or(`name.ilike.${term},sku.ilike.${term},category.ilike.${term}`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching admin products:', error);
      return { success: false, error: error.message, products: [] };
    }

    return {
      success: true,
      products: (data || []).map((item) => ({
        ...item,
        price: Number(item.price),
        discount_price: item.discount_price ? Number(item.discount_price) : null,
        stock: Number(item.stock)
      }))
    };
  } catch (err) {
    console.error('Unexpected error fetching admin products:', err);
    return { success: false, error: err.message, products: [] };
  }
}

/**
 * Fetches single product details for admin editor
 */
export async function fetchAdminProductById(id) {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Supabase credentials not configured', product: null };
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return { success: false, error: error.message, product: null };
    }

    return {
      success: true,
      product: {
        ...data,
        price: Number(data.price),
        discount_price: data.discount_price ? Number(data.discount_price) : '',
        stock: Number(data.stock)
      }
    };
  } catch (err) {
    return { success: false, error: err.message, product: null };
  }
}

/**
 * Helper to generate URL-friendly slug
 */
export function generateSlug(name) {
  return (name || '')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/&/g, '-and-')
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Validates and uploads an image file to Supabase Storage 'product-images' bucket
 */
export async function uploadProductImage(file) {
  if (!file) {
    return { success: false, error: 'No image file provided' };
  }

  if (!isSupabaseConfigured || !supabase) {
    return {
      success: false,
      error: 'Supabase credentials are not configured in .env'
    };
  }

  // 1. Validate file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type.toLowerCase())) {
    return {
      success: false,
      error: 'Invalid file format. Please upload a JPG, JPEG, PNG, or WEBP image.'
    };
  }

  // 2. Validate file size (max 5MB)
  const MAX_SIZE_BYTES = 5 * 1024 * 1024;
  if (file.size > MAX_SIZE_BYTES) {
    return {
      success: false,
      error: 'Image file is too large. Maximum allowed size is 5MB.'
    };
  }

  try {
    const fileExt = file.name.split('.').pop().toLowerCase();
    const cleanFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `products/${cleanFileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return { success: false, error: uploadError.message || 'Image upload failed' };
    }

    const { data: publicUrlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return {
      success: true,
      publicUrl: publicUrlData.publicUrl,
      filePath: filePath
    };
  } catch (err) {
    console.error('Unexpected image upload error:', err);
    return { success: false, error: err.message || 'Failed to upload image' };
  }
}

/**
 * Creates a new product in the database
 */
export async function createProduct(productData) {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Supabase credentials not configured' };
  }

  try {
    const slug = productData.slug?.trim() || generateSlug(productData.name);

    const payload = {
      name: productData.name.trim(),
      slug: slug,
      description: productData.description.trim(),
      category: productData.category.trim(),
      price: Number(productData.price),
      discount_price: productData.discount_price ? Number(productData.discount_price) : null,
      stock: parseInt(productData.stock, 10) || 0,
      sku: productData.sku ? productData.sku.trim() : null,
      brand: productData.brand ? productData.brand.trim() : null,
      image_url: productData.image_url.trim(),
      additional_images: productData.additional_images || [],
      ingredients: productData.ingredients ? productData.ingredients.trim() : null,
      how_to_use: productData.how_to_use ? productData.how_to_use.trim() : null,
      benefits: productData.benefits ? productData.benefits.trim() : null,
      size: productData.size ? productData.size.trim() : '30ml / 1.0 fl oz',
      status: productData.status || 'Active'
    };

    const { data, error } = await supabase
      .from('products')
      .insert([payload])
      .select('*')
      .single();

    if (error) {
      console.error('Error creating product:', error);
      return { success: false, error: error.message };
    }

    return { success: true, product: data };
  } catch (err) {
    console.error('Unexpected error creating product:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Updates an existing product in the database
 */
export async function updateProduct(id, productData) {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Supabase credentials not configured' };
  }

  try {
    const slug = productData.slug?.trim() || generateSlug(productData.name);

    const payload = {
      name: productData.name.trim(),
      slug: slug,
      description: productData.description.trim(),
      category: productData.category.trim(),
      price: Number(productData.price),
      discount_price: productData.discount_price ? Number(productData.discount_price) : null,
      stock: parseInt(productData.stock, 10) || 0,
      sku: productData.sku ? productData.sku.trim() : null,
      brand: productData.brand ? productData.brand.trim() : null,
      image_url: productData.image_url.trim(),
      additional_images: productData.additional_images || [],
      ingredients: productData.ingredients ? productData.ingredients.trim() : null,
      how_to_use: productData.how_to_use ? productData.how_to_use.trim() : null,
      benefits: productData.benefits ? productData.benefits.trim() : null,
      size: productData.size ? productData.size.trim() : '30ml / 1.0 fl oz',
      status: productData.status || 'Active'
    };

    const { data, error } = await supabase
      .from('products')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating product:', error);
      return { success: false, error: error.message };
    }

    return { success: true, product: data };
  } catch (err) {
    console.error('Unexpected error updating product:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Deletes a product from the database
 */
export async function deleteProduct(id) {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Supabase credentials not configured' };
  }

  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting product:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Unexpected error deleting product:', err);
    return { success: false, error: err.message };
  }
}

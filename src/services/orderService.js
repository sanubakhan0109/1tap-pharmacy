import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Creates a new customer order and line items in Supabase.
 *
 * @param {Object} customerData - Customer and delivery details (including optional userId)
 * @param {Array} items - Cart items
 * @param {Object} totals - Calculated order totals (subtotal, delivery, total)
 * @returns {Promise<{success: boolean, orderId?: string, error?: string, simulated?: boolean}>}
 */
export async function createOrder(customerData, items, totals) {
  try {
    if (!items || items.length === 0) {
      return { success: false, error: 'Your cart is empty. Please add items before checking out.' };
    }

    // Required fields validation
    const requiredFields = ['fullName', 'phone', 'address', 'city', 'state', 'pincode'];
    for (const field of requiredFields) {
      if (!customerData[field] || !customerData[field].trim()) {
        return { success: false, error: `Please fill in all required fields: ${field} is missing.` };
      }
    }

    // Determine authenticated user_id if present
    let authUserId = customerData.userId || customerData.user_id || null;
    if (!authUserId && isSupabaseConfigured && supabase) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id) {
          authUserId = session.user.id;
        }
      } catch {
        // Ignore session read error
      }
    }

    // ---- Trust boundary: revalidate prices/availability against the live
    // catalog (Active products in Supabase) instead of trusting client totals.
    // Quantities are clamped, unknown items dropped, out-of-stock items block
    // the order with a clear message. Falls back to cart data only when the
    // catalog cannot be reached (offline), preserving checkout availability.
    let verifiedItems = items.map((item) => ({
      id: item.id ? String(item.id) : 'unknown',
      name: item.name,
      quantity: Math.max(1, Math.min(99, Math.floor(Number(item.quantity) || 1))),
      price: Number(item.price) || 0
    }));
    let removedNames = [];
    let catalogVerified = false;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: catalog, error: catalogError } = await supabase
          .from('products')
          .select('id, name, price, stock, status')
          .eq('status', 'Active');
        if (!catalogError && Array.isArray(catalog)) {
          catalogVerified = true;
          const byId = new Map(catalog.map((p) => [String(p.id), p]));
          const outOfStockNames = [];
          const kept = [];
          for (const item of verifiedItems) {
            const live = byId.get(item.id);
            if (!live) {
              removedNames.push(item.name);
              continue;
            }
            if (live.status === 'Out of Stock' || Number(live.stock ?? 0) <= 0) {
              outOfStockNames.push(live.name || item.name);
              continue;
            }
            kept.push({ ...item, name: live.name || item.name, price: Number(live.price) || 0 });
          }
          if (outOfStockNames.length > 0) {
            return {
              success: false,
              error: `Sorry, ${outOfStockNames.slice(0, 3).join(', ')} ${outOfStockNames.length === 1 ? 'is' : 'are'} no longer in stock. Please remove ${outOfStockNames.length === 1 ? 'it' : 'them'} from your cart and try again.`
            };
          }
          verifiedItems = kept;
          if (verifiedItems.length === 0) {
            return { success: false, error: 'The items in your cart are no longer available. Please browse products and try again.' };
          }
        }
      } catch {
        // Catalog unreachable: proceed with cart data (availability enforced by admin review + COD).
      }
    }

    const verifiedSubtotal = verifiedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const verifiedDelivery = 0; // Free delivery (matches storefront pricing rule)
    const verifiedTotal = verifiedSubtotal + verifiedDelivery;

    // Effective totals: catalog-verified when possible, otherwise the
    // caller-provided cart totals (offline fallback path).
    const effectiveTotals = catalogVerified
      ? { subtotal: verifiedSubtotal, deliveryCharge: verifiedDelivery, totalAmount: verifiedTotal }
      : {
          subtotal: Number(totals?.subtotal) || 0,
          deliveryCharge: Number(totals?.deliveryCharge) || 0,
          totalAmount: Number(totals?.totalAmount) || 0,
        };

    const orderPayload = {
      user_id: authUserId,
      customer_name: customerData.fullName.trim(),
      phone: customerData.phone.trim(),
      email: customerData.email ? customerData.email.trim() : null,
      address: customerData.address.trim(),
      city: customerData.city.trim(),
      state: customerData.state.trim(),
      pincode: customerData.pincode.trim(),
      subtotal: effectiveTotals.subtotal,
      delivery_charge: effectiveTotals.deliveryCharge,
      total_amount: effectiveTotals.totalAmount,
      payment_method: 'COD',
      payment_status: 'Pending',
      status: 'New'
    };

    // If Supabase is live and configured
    if (isSupabaseConfigured && supabase) {
      // 1. Insert order record
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([orderPayload])
        .select('id, created_at')
        .single();

      if (orderError) {
        console.error('Supabase order creation error:', orderError);
        return {
          success: false,
          error: orderError.message || 'Failed to record order. Please try again.'
        };
      }

      const orderId = orderData.id;

      // 2. Prepare and insert order items (verified catalog prices)
      const orderItemsPayload = verifiedItems.map((item) => ({
        order_id: orderId,
        product_id: item.id ? String(item.id) : 'unknown',
        product_name: item.name,
        quantity: item.quantity,
        price: Number(item.price)
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsPayload);

      if (itemsError) {
        console.error('Supabase order_items creation error:', itemsError);
        return {
          success: false,
          error: `Order recorded (${orderId.slice(0, 8)}...), but line items failed: ${itemsError.message}`
        };
      }

      return {
        success: true,
        orderId: orderId,
        createdAt: orderData.created_at,
        simulated: false,
        catalogVerified,
        removedNames,
        verifiedTotals: effectiveTotals,
        verifiedItems
      };
    }

    // Graceful fallback for local preview when Supabase is not configured
    console.warn(
      '⚠️ Supabase credentials not set in .env. Creating simulated local order for preview.'
    );
    const mockOrderId = '1TAP-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    
    // Simulate brief network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    return {
      success: true,
      orderId: mockOrderId,
      createdAt: new Date().toISOString(),
      simulated: true
    };
  } catch (err) {
    console.error('Unexpected order error:', err);
    return {
      success: false,
      error: err.message || 'An unexpected error occurred while placing your order.'
    };
  }
}

/**
 * Fetches all orders belonging to the currently authenticated customer
 */
export async function fetchCustomerOrders() {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Supabase credentials not configured', orders: [] };
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return { success: false, error: 'Customer is not authenticated', orders: [] };
    }

    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        customer_name,
        phone,
        email,
        address,
        city,
        state,
        pincode,
        subtotal,
        delivery_charge,
        total_amount,
        payment_method,
        payment_status,
        status,
        created_at,
        order_items (
          id,
          product_id,
          product_name,
          quantity,
          price
        )
      `)
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching customer orders:', error);
      return { success: false, error: error.message, orders: [] };
    }

    const formatted = (data || []).map((order) => {
      const itemsCount = (order.order_items || []).reduce((sum, i) => sum + (i.quantity || 1), 0);
      return {
        ...order,
        itemsCount,
        total_amount: Number(order.total_amount),
        subtotal: Number(order.subtotal),
        delivery_charge: Number(order.delivery_charge)
      };
    });

    return { success: true, orders: formatted };
  } catch (err) {
    console.error('Unexpected error fetching customer orders:', err);
    return { success: false, error: err.message, orders: [] };
  }
}

/**
 * Fetches single order details and line items for customer tracking view
 */
export async function fetchCustomerOrderById(orderId) {
  if (!orderId) {
    return { success: false, error: 'Order ID is required', order: null };
  }

  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Supabase credentials not configured', order: null };
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return { success: false, error: 'Customer is not authenticated', order: null };
    }

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          product_id,
          product_name,
          quantity,
          price
        )
      `)
      .eq('id', orderId)
      .eq('user_id', session.user.id)
      .single();

    if (error) {
      console.error('Error fetching customer order by ID:', error);
      return { success: false, error: error.message, order: null };
    }

    return {
      success: true,
      order: {
        ...data,
        total_amount: Number(data.total_amount),
        subtotal: Number(data.subtotal),
        delivery_charge: Number(data.delivery_charge)
      }
    };
  } catch (err) {
    console.error('Unexpected error fetching customer order by ID:', err);
    return { success: false, error: err.message, order: null };
  }
}

/**
 * Fetches all orders for admin management with optional status and search filtering
 */
export async function fetchAdminOrders({ search = '', status = 'All' } = {}) {
  if (!isSupabaseConfigured || !supabase) {
    return {
      success: false,
      error: 'Supabase credentials not configured in .env',
      orders: []
    };
  }

  try {
    let query = supabase
      .from('orders')
      .select(`
        id,
        user_id,
        customer_name,
        phone,
        email,
        address,
        city,
        state,
        pincode,
        subtotal,
        delivery_charge,
        total_amount,
        payment_method,
        payment_status,
        status,
        created_at,
        order_items (
          id,
          product_id,
          product_name,
          quantity,
          price
        )
      `)
      .order('created_at', { ascending: false });

    if (status && status !== 'All') {
      query = query.eq('status', status);
    }

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(search.trim());
      
      if (isUuid) {
        query = query.eq('id', search.trim());
      } else {
        query = query.or(`customer_name.ilike.${term},phone.ilike.${term},city.ilike.${term}`);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching admin orders:', error);
      return { success: false, error: error.message, orders: [] };
    }

    const formattedOrders = (data || []).map((order) => {
      const itemsCount = (order.order_items || []).reduce((sum, item) => sum + (item.quantity || 1), 0);
      return {
        ...order,
        itemsCount,
        total_amount: Number(order.total_amount),
        subtotal: Number(order.subtotal),
        delivery_charge: Number(order.delivery_charge)
      };
    });

    return { success: true, orders: formattedOrders };
  } catch (err) {
    console.error('Unexpected error fetching admin orders:', err);
    return { success: false, error: err.message, orders: [] };
  }
}

/**
 * Fetches single order details and line items for admin order detail page
 */
export async function fetchAdminOrderById(orderId) {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Supabase credentials not configured in .env', order: null };
  }

  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          product_id,
          product_name,
          quantity,
          price
        )
      `)
      .eq('id', orderId)
      .single();

    if (error) {
      console.error('Error fetching order by ID:', error);
      return { success: false, error: error.message, order: null };
    }

    return {
      success: true,
      order: {
        ...data,
        total_amount: Number(data.total_amount),
        subtotal: Number(data.subtotal),
        delivery_charge: Number(data.delivery_charge)
      }
    };
  } catch (err) {
    console.error('Unexpected error fetching order by ID:', err);
    return { success: false, error: err.message, order: null };
  }
}

/**
 * Updates the status of an order
 */
export async function updateOrderStatus(orderId, newStatus) {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Supabase credentials not configured in .env' };
  }

  try {
    const { data, error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating order status:', error);
      return { success: false, error: error.message };
    }

    return { success: true, order: data };
  } catch (err) {
    console.error('Unexpected error updating order status:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Fetches high-level metrics and recent orders for the admin dashboard
 */
export async function fetchAdminDashboardStats() {
  if (!isSupabaseConfigured || !supabase) {
    return {
      success: true,
      stats: {
        totalProducts: 1,
        totalOrders: 0,
        pendingOrders: 0,
        newOrders: 0,
        totalRevenue: 0
      },
      recentOrders: []
    };
  }

  try {
    // 1. Fetch total products count
    const { count: totalProducts, error: prodErr } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    // 2. Fetch all orders for metrics
    const { data: orders, error: ordersErr } = await supabase
      .from('orders')
      .select(`
        id,
        customer_name,
        phone,
        total_amount,
        status,
        created_at
      `)
      .order('created_at', { ascending: false });

    if (prodErr || ordersErr) {
      console.error('Dashboard stats fetch error:', prodErr || ordersErr);
      return {
        success: false,
        error: (prodErr || ordersErr)?.message,
        stats: {
          totalProducts: totalProducts || 0,
          totalOrders: 0,
          pendingOrders: 0,
          newOrders: 0,
          totalRevenue: 0
        },
        recentOrders: []
      };
    }

    const allOrders = orders || [];
    const totalOrders = allOrders.length;
    const pendingOrders = allOrders.filter((o) => o.status === 'Pending').length;
    const newOrders = allOrders.filter((o) => o.status === 'New').length;
    const totalRevenue = allOrders
      .filter((o) => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

    const recentOrders = allOrders.slice(0, 5);

    return {
      success: true,
      stats: {
        totalProducts: totalProducts || 0,
        totalOrders,
        pendingOrders,
        newOrders,
        totalRevenue
      },
      recentOrders
    };
  } catch (err) {
    console.error('Unexpected error fetching dashboard stats:', err);
    return {
      success: false,
      error: err.message,
      stats: {
        totalProducts: 0,
        totalOrders: 0,
        pendingOrders: 0,
        newOrders: 0,
        totalRevenue: 0
      },
      recentOrders: []
    };
  }
}

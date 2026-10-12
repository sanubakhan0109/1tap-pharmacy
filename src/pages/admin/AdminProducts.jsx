import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchAdminProducts, deleteProduct } from '../../services/productService';
import DeleteConfirmModal from '../../components/admin/DeleteConfirmModal';
import { AdminTableSkeleton } from '../../components/skeletons';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Layers,
  Image as ImageIcon
} from 'lucide-react';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Filters and Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    const res = await fetchAdminProducts({
      search: searchQuery,
      category: selectedCategory,
      status: selectedStatus
    });

    if (res.success) {
      setProducts(res.products);
    } else {
      setError(res.error || 'Failed to load products from database.');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, selectedStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadProducts();
  };

  const openDeleteModal = (product) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setProductToDelete(null);
    setDeleteModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    const res = await deleteProduct(productToDelete.id);
    setIsDeleting(false);

    if (res.success) {
      setToastMessage(`Product "${productToDelete.name}" deleted successfully.`);
      closeDeleteModal();
      loadProducts();
      setTimeout(() => setToastMessage(null), 4000);
    } else {
      setError(res.error || 'Failed to delete product.');
      closeDeleteModal();
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'Draft':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'Out of Stock':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Product Management
            </h1>
            <span className="rounded-md bg-indigo-500/20 px-2 py-0.5 text-xs font-bold text-indigo-300 border border-indigo-500/30">
              {products.length} {products.length === 1 ? 'Product' : 'Products'}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Create, update, upload photos, and manage inventory across your store.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadProducts}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs font-bold text-slate-300 transition hover:bg-slate-800 hover:text-white active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <Link
            to="/admin/products/new"
            id="admin-add-product-btn"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-500 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* Flash Toast Notification */}
      {toastMessage && (
        <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 flex items-center justify-between gap-3 text-emerald-300 text-xs shadow-lg animate-in fade-in duration-150">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <span className="font-semibold">{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-emerald-400 hover:text-emerald-200"
          >
            ✕
          </button>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="rounded-2xl bg-rose-500/10 border border-rose-500/30 p-4 flex items-center gap-3 text-rose-300 text-xs">
          <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              id="admin-product-search"
              placeholder="Search by product name, SKU, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-800/80 pl-10 pr-3.5 py-2 text-xs text-white placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-indigo-500 active:scale-95"
            >
              Search
            </button>

            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  loadProducts();
                }}
                className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700"
              >
                Clear
              </button>
            )}
          </div>
        </form>

        {/* Filter Badges Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/60 text-xs">
          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs text-slate-200 outline-none focus:border-indigo-500"
            >
              <option value="All">All Categories</option>
              <option value="Skin Care">Skin Care</option>
              <option value="Face Care">Face Care</option>
              <option value="Body Care">Body Care</option>
              <option value="Hair Care">Hair Care</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs text-slate-200 outline-none focus:border-indigo-500"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Draft">Draft</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table Container */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 overflow-hidden shadow-xs">
        {loading ? (
          <AdminTableSkeleton columns={6} rows={6} label="Loading product catalog" />
        ) : products.length === 0 ? (
          <div className="py-16 text-center space-y-3 px-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800 text-slate-500">
              <Package className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-white">No products found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchQuery || selectedCategory !== 'All' || selectedStatus !== 'All'
                ? 'Try adjusting your search query or filter settings.'
                : 'Your catalog is currently empty. Click below to add your first product.'}
            </p>
            <div className="pt-2">
              <Link
                to="/admin/products/new"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-indigo-500"
              >
                <Plus className="h-4 w-4" />
                <span>Add First Product</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3.5 pl-4 pr-3">Image</th>
                  <th className="py-3.5 px-3">Product Name</th>
                  <th className="py-3.5 px-3">Category</th>
                  <th className="py-3.5 px-3">Price</th>
                  <th className="py-3.5 px-3">Stock</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-3">Created</th>
                  <th className="py-3.5 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {products.map((product) => {
                  const isLowStock = product.stock > 0 && product.stock <= 5;
                  const isZeroStock = product.stock <= 0;

                  return (
                    <tr key={product.id} className="hover:bg-slate-800/30 transition">
                      {/* Image */}
                      <td className="py-3 pl-4 pr-3">
                        <div className="h-12 w-12 rounded-xl overflow-hidden bg-slate-800 border border-slate-700/80 flex items-center justify-center shrink-0">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="h-full w-full object-cover object-center"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <ImageIcon className="h-5 w-5 text-slate-500" />
                          )}
                        </div>
                      </td>

                      {/* Product Name & SKU */}
                      <td className="py-3 px-3">
                        <div className="space-y-0.5 max-w-xs">
                          <p className="font-bold text-white truncate" title={product.name}>
                            {product.name}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400">
                            {product.sku && <span>SKU: {product.sku}</span>}
                            <span>• {product.brand || 'Featured Brand'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center rounded-md bg-slate-800 px-2 py-0.5 text-[11px] font-semibold text-slate-300 border border-slate-700">
                          {product.category || 'Skin Care'}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-3">
                        <div>
                          <span className="font-bold text-white">
                            ₹{Number(product.price).toLocaleString('en-IN')}
                          </span>
                          {product.discount_price && (
                            <span className="block text-[10px] text-slate-400 line-through">
                              ₹{Number(product.discount_price).toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Stock */}
                      <td className="py-3 px-3">
                        <div>
                          <span
                            className={`font-semibold ${
                              isZeroStock
                                ? 'text-rose-400'
                                : isLowStock
                                ? 'text-amber-400'
                                : 'text-slate-300'
                            }`}
                          >
                            {product.stock} units
                          </span>
                          {isZeroStock && (
                            <span className="block text-[10px] text-rose-400">Out of Stock</span>
                          )}
                          {isLowStock && (
                            <span className="block text-[10px] text-amber-400">Low Stock</span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold border ${getStatusBadge(
                            product.status
                          )}`}
                        >
                          {product.status}
                        </span>
                      </td>

                      {/* Created Date */}
                      <td className="py-3 px-3 text-slate-400 text-[11px]">
                        {new Date(product.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-3 pr-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <Link
                            to={`/admin/products/${product.id}/edit`}
                            id={`edit-product-${product.id}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 px-2.5 py-1 text-xs font-semibold text-slate-200 transition"
                            title="Edit Product"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                            <span>Edit</span>
                          </Link>

                          <button
                            type="button"
                            onClick={() => openDeleteModal(product)}
                            id={`delete-product-${product.id}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 px-2.5 py-1 text-xs font-semibold text-rose-300 transition"
                            title="Delete Product"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Product"
        message="Are you sure you want to delete this product from Supabase? Customers will no longer be able to view or purchase it."
        itemName={productToDelete?.name}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={closeDeleteModal}
      />

    </div>
  );
}

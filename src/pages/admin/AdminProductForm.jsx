import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  fetchAdminProductById,
  createProduct,
  updateProduct,
  uploadProductImage,
  generateSlug
} from '../../services/productService';
import {
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  X,
  Plus,
  Trash2,
  Sparkles,
  Info
} from 'lucide-react';

export default function AdminProductForm() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category: 'Skin Care',
    brand: '',
    sku: '',
    price: '',
    discount_price: '',
    stock: '20',
    size: '30ml / 1.0 fl oz',
    status: 'Active',
    description: '',
    ingredients: '',
    how_to_use: '',
    benefits: '',
    image_url: '',
    additional_images: []
  });

  // Image Upload State
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Additional Image Upload
  const [additionalImageUrlInput, setAdditionalImageUrlInput] = useState('');

  // UI state
  const [pageLoading, setPageLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Load product data if in edit mode
  useEffect(() => {
    if (!isEditMode) return;

    const loadProductData = async () => {
      setPageLoading(true);
      const res = await fetchAdminProductById(id);
      if (res.success && res.product) {
        const p = res.product;
        setFormData({
          name: p.name || '',
          slug: p.slug || '',
          category: p.category || 'Skin Care',
          brand: p.brand || '',
          sku: p.sku || '',
          price: p.price !== undefined ? String(p.price) : '',
          discount_price: p.discount_price ? String(p.discount_price) : '',
          stock: p.stock !== undefined ? String(p.stock) : '0',
          size: p.size || '30ml / 1.0 fl oz',
          status: p.status || 'Active',
          description: p.description || '',
          ingredients: p.ingredients || '',
          how_to_use: p.how_to_use || '',
          benefits: p.benefits || '',
          image_url: p.image_url || '',
          additional_images: Array.isArray(p.additional_images) ? p.additional_images : []
        });
        setImagePreview(p.image_url || '');
      } else {
        setFormError(res.error || 'Failed to load product details.');
      }
      setPageLoading(false);
    };

    loadProductData();
  }, [id, isEditMode]);

  // Handle Input Changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      // Auto-update slug if user changes name and hasn't manually edited slug
      if (name === 'name' && !isEditMode) {
        updated.slug = generateSlug(value);
      }
      return updated;
    });
  };

  // Handle Image File Selection
  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setFormError('Please select a valid image file (JPG, JPEG, PNG, or WEBP).');
      return;
    }

    // Validate size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setFormError('Image size exceeds 5MB limit. Please choose a smaller image.');
      return;
    }

    setFormError('');
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeSelectedImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData((prev) => ({ ...prev, image_url: '' }));
  };

  // Add an additional image URL
  const handleAddAdditionalImage = () => {
    if (!additionalImageUrlInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      additional_images: [...prev.additional_images, additionalImageUrlInput.trim()]
    }));
    setAdditionalImageUrlInput('');
  };

  const handleRemoveAdditionalImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      additional_images: prev.additional_images.filter((_, idx) => idx !== index)
    }));
  };

  // Form Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    // 1. Basic Required Validation
    if (!formData.name.trim()) {
      setFormError('Please enter a Product Name.');
      return;
    }
    if (!formData.category.trim()) {
      setFormError('Please select a Category.');
      return;
    }
    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) < 0) {
      setFormError('Please enter a valid Price (e.g. 499).');
      return;
    }
    if (formData.stock === '' || isNaN(parseInt(formData.stock, 10)) || parseInt(formData.stock, 10) < 0) {
      setFormError('Please enter a valid Stock Quantity (e.g. 20).');
      return;
    }
    if (!formData.description.trim()) {
      setFormError('Please provide a Product Description.');
      return;
    }

    // Check if an image is provided
    if (!imageFile && !formData.image_url.trim() && !imagePreview) {
      setFormError('Please select and upload a main Product Image.');
      return;
    }

    setIsSubmitting(true);

    try {
      let finalImageUrl = formData.image_url.trim();

      // 2. If a new image file was picked, upload it to Supabase Storage
      if (imageFile) {
        setIsUploadingImage(true);
        const uploadRes = await uploadProductImage(imageFile);
        setIsUploadingImage(false);

        if (!uploadRes.success) {
          setFormError(`Image upload failed: ${uploadRes.error}`);
          setIsSubmitting(false);
          return;
        }

        finalImageUrl = uploadRes.publicUrl;
      }

      // If image is still empty (e.g. fallback mockup)
      if (!finalImageUrl) {
        finalImageUrl = imagePreview || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80';
      }

      const productPayload = {
        ...formData,
        image_url: finalImageUrl
      };

      // 3. Insert or Update in Supabase
      let result;
      if (isEditMode) {
        result = await updateProduct(id, productPayload);
      } else {
        result = await createProduct(productPayload);
      }

      if (result.success) {
        const successMsg = isEditMode
          ? 'Product updated successfully.'
          : 'Product added successfully.';
        setFormSuccess(successMsg);

        // Redirect after brief delay
        setTimeout(() => {
          navigate('/admin/products', { replace: true });
        }, 1200);
      } else {
        setFormError(result.error || 'Database operation failed. Please check your inputs.');
      }
    } catch (err) {
      setFormError(err.message || 'An unexpected error occurred while saving the product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="py-20 text-center text-xs text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-500 mb-2" />
        <p>Loading product details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              to="/admin/products"
              className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Products</span>
            </Link>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {isEditMode ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p className="text-xs text-slate-400">
            {isEditMode
              ? 'Update specifications, pricing, inventory stock, or change imagery.'
              : 'Add a new product to the catalog and sync across customer storefront.'}
          </p>
        </div>
      </div>

      {/* Success Banner */}
      {formSuccess && (
        <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 flex items-center gap-3 text-emerald-300 text-xs shadow-lg animate-in fade-in duration-150">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <span className="font-semibold">{formSuccess} Redirecting to products...</span>
        </div>
      )}

      {/* Error Banner */}
      {formError && (
        <div className="rounded-2xl bg-rose-500/10 border border-rose-500/30 p-4 flex items-center gap-3 text-rose-300 text-xs shadow-lg animate-in fade-in duration-150">
          <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
          <span className="font-semibold">{formError}</span>
        </div>
      )}

      {/* Product Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Section 1: Basic Information */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 space-y-5">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              1. Basic Information
            </h2>
            <span className="text-[11px] text-slate-400">* Required fields</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Product Name */}
            <div className="sm:col-span-2">
              <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Product Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                disabled={isSubmitting}
                placeholder="e.g. Vitamin C Face Serum"
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Category <span className="text-rose-400">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-xs text-white outline-none focus:border-indigo-500"
              >
                <option value="Skin Care">Skin Care</option>
                <option value="Face Care">Face Care</option>
                <option value="Body Care">Body Care</option>
                <option value="Hair Care">Hair Care</option>
                <option value="Lip Care">Lip Care</option>
              </select>
            </div>

            {/* Brand */}
            <div>
              <label htmlFor="brand" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Brand
              </label>
              <input
                type="text"
                id="brand"
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                disabled={isSubmitting}
                placeholder="e.g. The Man Company, Minimalist, Cetaphil"
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            {/* SKU */}
            <div>
              <label htmlFor="sku" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                SKU (Stock Keeping Unit)
              </label>
              <input
                type="text"
                id="sku"
                name="sku"
                value={formData.sku}
                onChange={handleInputChange}
                disabled={isSubmitting}
                placeholder="e.g. SRM-001"
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            {/* Size / Volume */}
            <div>
              <label htmlFor="size" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Size / Volume
              </label>
              <input
                type="text"
                id="size"
                name="size"
                value={formData.size}
                onChange={handleInputChange}
                disabled={isSubmitting}
                placeholder="30ml / 1.0 fl oz"
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            {/* Slug */}
            <div className="sm:col-span-2">
              <label htmlFor="slug" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                URL Slug
              </label>
              <input
                type="text"
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                disabled={isSubmitting}
                placeholder="vitamin-c-face-serum"
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-xs text-slate-300 font-mono placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
              <p className="mt-1 text-[11px] text-slate-400">Used for URL navigation e.g. /products/vitamin-c-face-serum</p>
            </div>
          </div>
        </div>

        {/* Section 2: Pricing, Inventory & Status */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 space-y-5">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              2. Pricing, Inventory & Status
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Selling Price */}
            <div>
              <label htmlFor="price" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Price (₹) <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                id="price"
                name="price"
                required
                min="0"
                step="1"
                value={formData.price}
                onChange={handleInputChange}
                disabled={isSubmitting}
                placeholder="499"
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-bold"
              />
            </div>

            {/* Discount / Original Price */}
            <div>
              <label htmlFor="discount_price" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Original MRP (₹) <span className="text-slate-400 font-normal lowercase">(optional)</span>
              </label>
              <input
                type="number"
                id="discount_price"
                name="discount_price"
                min="0"
                step="1"
                value={formData.discount_price}
                onChange={handleInputChange}
                disabled={isSubmitting}
                placeholder="599"
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            {/* Stock Quantity */}
            <div>
              <label htmlFor="stock" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Stock Quantity <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                id="stock"
                name="stock"
                required
                min="0"
                value={formData.stock}
                onChange={handleInputChange}
                disabled={isSubmitting}
                placeholder="20"
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            {/* Product Status */}
            <div className="sm:col-span-3 pt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Product Status
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                {/* Active */}
                <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer select-none transition ${
                  formData.status === 'Active'
                    ? 'border-emerald-500/60 bg-emerald-500/10 text-white'
                    : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:bg-slate-800'
                }`}>
                  <input
                    type="radio"
                    name="status"
                    value="Active"
                    checked={formData.status === 'Active'}
                    onChange={handleInputChange}
                    className="accent-emerald-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-200">Active</p>
                    <p className="text-[11px] text-slate-400">Visible & purchasable on website</p>
                  </div>
                </label>

                {/* Draft */}
                <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer select-none transition ${
                  formData.status === 'Draft'
                    ? 'border-amber-500/60 bg-amber-500/10 text-white'
                    : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:bg-slate-800'
                }`}>
                  <input
                    type="radio"
                    name="status"
                    value="Draft"
                    checked={formData.status === 'Draft'}
                    onChange={handleInputChange}
                    className="accent-amber-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-200">Draft</p>
                    <p className="text-[11px] text-slate-400">Hidden from customers</p>
                  </div>
                </label>

                {/* Out of Stock */}
                <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer select-none transition ${
                  formData.status === 'Out of Stock'
                    ? 'border-rose-500/60 bg-rose-500/10 text-white'
                    : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:bg-slate-800'
                }`}>
                  <input
                    type="radio"
                    name="status"
                    value="Out of Stock"
                    checked={formData.status === 'Out of Stock'}
                    onChange={handleInputChange}
                    className="accent-rose-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-200">Out of Stock</p>
                    <p className="text-[11px] text-slate-400">Visible but purchasing disabled</p>
                  </div>
                </label>

              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Product Image (Supabase Storage) */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 space-y-5">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              3. Product Photography (Supabase Storage)
            </h2>
            <span className="text-[11px] text-slate-400">Bucket: product-images</span>
          </div>

          <div className="space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Main Product Photo <span className="text-rose-400">*</span>
            </label>

            {/* Photo Uploader Box */}
            <div className="flex flex-col sm:flex-row items-start gap-6">
              
              {/* Image Preview Box */}
              <div className="relative h-44 w-44 rounded-2xl overflow-hidden bg-slate-800/80 border-2 border-dashed border-slate-700 flex items-center justify-center shrink-0 group">
                {imagePreview ? (
                  <>
                    <img
                      src={imagePreview}
                      alt="Product preview"
                      className="h-full w-full object-cover object-center"
                    />
                    <button
                      type="button"
                      onClick={removeSelectedImage}
                      className="absolute top-2 right-2 rounded-lg bg-slate-900/90 text-rose-400 p-1.5 hover:bg-slate-900 hover:text-rose-300 shadow-md transition"
                      title="Remove image"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center p-4 text-center text-slate-500 space-y-1">
                    <ImageIcon className="h-8 w-8" />
                    <span className="text-[11px]">No photo selected</span>
                  </div>
                )}
              </div>

              {/* Upload Controls & URL fallback */}
              <div className="flex-1 space-y-3">
                <div className="rounded-xl border border-slate-700/80 bg-slate-800/40 p-4 space-y-3">
                  <p className="text-xs font-semibold text-white">Upload from Computer</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Select a high-resolution JPG, PNG, or WEBP photo (max 5MB). The image will be uploaded to Supabase Storage bucket.
                  </p>

                  <label className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2.5 text-xs font-bold text-white shadow-md transition cursor-pointer active:scale-95">
                    <Upload className="h-4 w-4" />
                    <span>{imagePreview ? 'Change Image' : 'Select Image File'}</span>
                    <input
                      type="file"
                      id="product-image-upload"
                      accept="image/jpeg,image/png,image/webp,image/jpg"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Direct Image URL input */}
                <div className="space-y-1">
                  <span className="text-[11px] text-slate-400">Or use an existing direct Image URL:</span>
                  <input
                    type="url"
                    id="image_url"
                    name="image_url"
                    value={formData.image_url}
                    onChange={(e) => {
                      handleInputChange(e);
                      setImagePreview(e.target.value);
                    }}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

            </div>

            {/* Additional Images (Optional Gallery) */}
            <div className="border-t border-slate-800/60 pt-4 space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Additional Gallery Photos <span className="text-slate-400 font-normal lowercase">(optional)</span>
              </label>
              
              <div className="flex gap-2">
                <input
                  type="url"
                  value={additionalImageUrlInput}
                  onChange={(e) => setAdditionalImageUrlInput(e.target.value)}
                  placeholder="Paste additional image URL (e.g. https://...)"
                  className="flex-1 rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddAdditionalImage}
                  className="rounded-xl bg-slate-800 hover:bg-slate-700 px-3 py-2 text-xs font-semibold text-slate-200"
                >
                  Add Photo
                </button>
              </div>

              {formData.additional_images.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {formData.additional_images.map((imgUrl, idx) => (
                    <div key={idx} className="relative h-16 w-16 rounded-xl overflow-hidden bg-slate-800 border border-slate-700 group">
                      <img src={imgUrl} alt={`Additional ${idx}`} className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveAdditionalImage(idx)}
                        className="absolute inset-0 bg-slate-950/70 text-rose-400 opacity-0 group-hover:opacity-100 flex items-center justify-center transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Section 4: Details & Skincare Usage */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 space-y-5">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              4. Product Description & Skincare Instructions
            </h2>
          </div>

          <div className="space-y-4">
            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Description <span className="text-rose-400">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                disabled={isSubmitting}
                placeholder="A lightweight hydrating face serum designed for everyday skincare..."
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 leading-relaxed"
              />
            </div>

            {/* Benefits (Line separated) */}
            <div>
              <label htmlFor="benefits" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Key Benefits <span className="text-slate-400 font-normal lowercase">(one per line)</span>
              </label>
              <textarea
                id="benefits"
                name="benefits"
                rows={3}
                value={formData.benefits}
                onChange={handleInputChange}
                disabled={isSubmitting}
                placeholder="Deep 24-hour hydration barrier&#10;Ultra-lightweight and fast absorbing&#10;Infused with Hyaluronic Acid & Botanicals"
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 leading-relaxed"
              />
            </div>

            {/* How To Use */}
            <div>
              <label htmlFor="how_to_use" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                How To Use / Application
              </label>
              <textarea
                id="how_to_use"
                name="how_to_use"
                rows={2}
                value={formData.how_to_use}
                onChange={handleInputChange}
                disabled={isSubmitting}
                placeholder="Apply 3-4 drops to cleansed face morning and night before moisturizers."
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 leading-relaxed"
              />
            </div>

            {/* Ingredients */}
            <div>
              <label htmlFor="ingredients" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Ingredients List
              </label>
              <textarea
                id="ingredients"
                name="ingredients"
                rows={2}
                value={formData.ingredients}
                onChange={handleInputChange}
                disabled={isSubmitting}
                placeholder="Hyaluronic Acid, Vitamin B5, Centella Asiatica Extract, Niacinamide, Glycerin, Aqua"
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Link
            to="/admin/products"
            className="rounded-xl border border-slate-700 bg-slate-800 px-5 py-2.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white"
          >
            Cancel
          </Link>

          <button
            type="submit"
            id="admin-save-product-btn"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 transition active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{isUploadingImage ? 'Uploading Image...' : 'Saving Product...'}</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>{isEditMode ? 'Update Product' : 'Publish Product'}</span>
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
}

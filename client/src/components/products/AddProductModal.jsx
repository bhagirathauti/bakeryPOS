import React, { useState } from 'react';

export default function AddProductModal({ open, onClose, onAdd, initial }) {
  const [productName, setProductName] = useState(initial?.productName || '');
  const [price, setPrice] = useState(initial?.price || '');
  const [discount, setDiscount] = useState(initial?.discount || '');
  const [cgst, setCgst] = useState(initial?.cgst || '');
  const [sgst, setSgst] = useState(initial?.sgst || '');
  // When editing an existing product we treat the stock input as "quantity to add" (optional).
  // Start with empty so it's clear it's an addition rather than replacing current stock.
  const [stock, setStock] = useState(initial ? '' : (initial?.stock || ''));
  const [stockReason, setStockReason] = useState('manual_adjustment');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!productName || !price) {
      setError('Product name and price are required.');
      return;
    }
    // For create (no initial) require stock. For edit, stock is optional (treated as quantity to add).
    if (!initial && !stock) {
      setError('Stock quantity is required when adding a new product.');
      return;
    }
    setLoading(true);
    try {
      // If stock is an empty string (edit and user didn't enter a value), don't send stock so server keeps existing.
      const payload = { productName, price, discount, cgst, sgst };
      if (stock !== '' && stock !== undefined && stock !== null) {
        payload.stock = parseInt(stock);
        payload.stockReason = stockReason; // Include reason for stock change
      }
      await onAdd(payload);
      setSuccess(initial ? 'Product updated successfully!' : 'Product added successfully!');
      setTimeout(() => {
        setSuccess('');
        onClose();
      }, 700);
    } catch (err) {
      setError(initial ? 'Failed to update product.' : 'Failed to add product.');
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {initial ? 'Edit Product' : 'Add New Product'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {initial ? 'Update product details and inventory' : 'Add a new product to your inventory'}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-5">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input 
                value={productName} 
                onChange={e => setProductName(e.target.value)} 
                placeholder="e.g., Chocolate Cake, Croissant"
                className="block w-full rounded-lg border border-gray-300 dark:border-slate-600 px-4 py-2.5 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Price and Stock Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">
                  Price (₹) <span className="text-red-500">*</span>
                </label>
                <input 
                  type="number" 
                  step="0.01"
                  value={price} 
                  onChange={e => setPrice(e.target.value)} 
                  placeholder="0.00"
                  className="block w-full rounded-lg border border-gray-300 dark:border-slate-600 px-4 py-2.5 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">
                  {initial ? 'Add Stock Quantity' : 'Initial Stock'} {!initial && <span className="text-red-500">*</span>}
                </label>
                <input 
                  type="number" 
                  value={stock} 
                  onChange={e => setStock(e.target.value)} 
                  min="0" 
                  placeholder={initial ? 'Enter qty to add (leave empty to keep current)' : '0'}
                  className="block w-full rounded-lg border border-gray-300 dark:border-slate-600 px-4 py-2.5 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  required={!initial}
                />
                {initial && stock && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Current stock will be increased by this amount
                  </p>
                )}
              </div>
            </div>

            {/* Stock Reason - Only show when editing and stock is changed */}
            {initial && stock && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">
                  Reason for Stock Change <span className="text-red-500">*</span>
                </label>
                <select
                  value={stockReason}
                  onChange={e => setStockReason(e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 dark:border-slate-600 px-4 py-2.5 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                >
                  <option value="manual_adjustment">Manual Adjustment</option>
                  <option value="supplier_receipt">Supplier Receipt</option>
                  <option value="production">Fresh Production</option>
                  <option value="stock_correction">Stock Correction</option>
                  <option value="return">Customer Return</option>
                  <option value="damage">Damage/Wastage</option>
                  <option value="other">Other</option>
                </select>
              </div>
            )}

            {/* Discount and Tax Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">
                  Discount (%)
                </label>
                <input 
                  type="number" 
                  step="0.01"
                  value={discount} 
                  onChange={e => setDiscount(e.target.value)} 
                  placeholder="0"
                  className="block w-full rounded-lg border border-gray-300 dark:border-slate-600 px-4 py-2.5 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">
                  CGST (%)
                </label>
                <input 
                  type="number" 
                  step="0.01"
                  value={cgst} 
                  onChange={e => setCgst(e.target.value)} 
                  placeholder="0"
                  className="block w-full rounded-lg border border-gray-300 dark:border-slate-600 px-4 py-2.5 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">
                  SGST (%)
                </label>
                <input 
                  type="number" 
                  step="0.01"
                  value={sgst} 
                  onChange={e => setSgst(e.target.value)} 
                  placeholder="0"
                  className="block w-full rounded-lg border border-gray-300 dark:border-slate-600 px-4 py-2.5 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Error and Success Messages */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-green-700 dark:text-green-300">{success}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-5 border-t border-gray-200 dark:border-slate-700">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg text-gray-700 dark:text-gray-200 font-medium transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {initial ? 'Updating...' : 'Adding...'}
                </span>
              ) : (
                initial ? 'Update Product' : 'Add Product'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

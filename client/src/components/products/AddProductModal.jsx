import React, { useState } from 'react';

export default function AddProductModal({ open, onClose, onAdd, initial }) {
  const [productName, setProductName] = useState(initial?.productName || '');
  const [price, setPrice] = useState(initial?.price || '');
  const [discount, setDiscount] = useState(initial?.discount || '');
  const [cgst, setCgst] = useState(initial?.cgst || '');
  const [sgst, setSgst] = useState(initial?.sgst || '');
  const [stock, setStock] = useState(initial?.stock || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!productName || !price || !stock) {
      setError('Product name, price, and stock quantity are required.');
      return;
    }
    setLoading(true);
    try {
      await onAdd({ productName, price, discount, cgst, sgst, stock: parseInt(stock) });
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-lg w-full max-w-md">
  <h3 className="text-lg font-semibold mb-4">{initial ? 'Edit Product' : 'Add Product'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm">Product Name</label>
            <input value={productName} onChange={e => setProductName(e.target.value)} className="mt-1 block w-full rounded-md border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm">Price</label>
            <input type="number" value={price} onChange={e => setPrice(e.target.value)} className="mt-1 block w-full rounded-md border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm">Stock Quantity</label>
            <input type="number" value={stock} onChange={e => setStock(e.target.value)} min="0" className="mt-1 block w-full rounded-md border px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm">Discount (%)</label>
            <input type="number" value={discount} onChange={e => setDiscount(e.target.value)} className="mt-1 block w-full rounded-md border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm">CGST (%)</label>
            <input type="number" value={cgst} onChange={e => setCgst(e.target.value)} className="mt-1 block w-full rounded-md border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm">SGST (%)</label>
            <input type="number" value={sgst} onChange={e => setSgst(e.target.value)} className="mt-1 block w-full rounded-md border px-3 py-2" />
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          {success && <div className="text-sm text-green-600">{success}</div>}
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-amber-500 text-white rounded-md" disabled={loading}>{loading ? (initial ? 'Updating...' : 'Adding...') : (initial ? 'Update Product' : 'Add Product')}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

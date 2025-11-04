import React, { useState } from 'react';

export default function NewOrderModal({ open, onClose, products, onComplete, cashierId, shopId }) {
  const [step, setStep] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Filter products based on search
  const filteredProducts = products.filter(p =>
    p.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function addToCart(product) {
    if (product.stock <= 0) {
      alert('This product is out of stock');
      return;
    }
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        alert(`Only ${product.stock} units available in stock`);
        return;
      }
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  }

  function updateQuantity(productId, newQuantity) {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const product = cart.find(item => item.id === productId);
    if (product && newQuantity > product.stock) {
      alert(`Only ${product.stock} units available in stock`);
      return;
    }
    setCart(cart.map(item =>
      item.id === productId ? { ...item, quantity: newQuantity } : item
    ));
  }

  function removeFromCart(productId) {
    setCart(cart.filter(item => item.id !== productId));
  }

  function calculateTotals() {
    let subtotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;

    cart.forEach(item => {
      const itemPrice = item.price * item.quantity;
      const discountAmount = (itemPrice * item.discount) / 100;
      const afterDiscount = itemPrice - discountAmount;
      const cgst = (afterDiscount * item.cgst) / 100;
      const sgst = (afterDiscount * item.sgst) / 100;

      subtotal += itemPrice;
      totalDiscount += discountAmount;
      totalTax += cgst + sgst;
    });

    const total = subtotal - totalDiscount + totalTax;

    return { subtotal, totalDiscount, totalTax, total };
  }

  function handleStep1Next() {
    setError('');
    if (!customerName.trim()) {
      setError('Customer name is required');
      return;
    }
    if (!customerMobile.trim() || !/^\d{10}$/.test(customerMobile)) {
      setError('Valid 10-digit mobile number is required');
      return;
    }
    setStep(2);
  }

  function handleStep2Next() {
    setError('');
    if (cart.length === 0) {
      setError('Please add at least one product');
      return;
    }
    setStep(3);
  }

  async function handleCompleteOrder() {
    setError('');
    setLoading(true);

    try {
      const API_BASE = 'http://localhost:4000';
      const response = await fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopId,
          cashierId,
          customerName,
          customerMobile,
          items: cart,
          paymentMethod
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const order = await response.json();
      onComplete(order);
      handleClose();
    } catch (err) {
      setError('Failed to complete order. Please try again.');
      console.error('Order error:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setStep(1);
    setCustomerName('');
    setCustomerMobile('');
    setSearchTerm('');
    setCart([]);
    setPaymentMethod('cash');
    setError('');
    onClose();
  }

  if (!open) return null;

  const totals = calculateTotals();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-200 dark:border-slate-700">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-slate-700 dark:to-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">New Order</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Step {step} of 3 - {step === 1 ? 'Customer Details' : step === 2 ? 'Select Products' : 'Review & Payment'}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 flex gap-2">
            <div className={`flex-1 h-2 rounded-full ${step >= 1 ? 'bg-amber-500' : 'bg-gray-200 dark:bg-slate-600'}`}></div>
            <div className={`flex-1 h-2 rounded-full ${step >= 2 ? 'bg-amber-500' : 'bg-gray-200 dark:bg-slate-600'}`}></div>
            <div className={`flex-1 h-2 rounded-full ${step >= 3 ? 'bg-amber-500' : 'bg-gray-200 dark:bg-slate-600'}`}></div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 180px)' }}>
          {error && (
            <div className="mb-4 flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Step 1: Customer Details */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="text-6xl mb-3">👤</div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Customer Information</h3>
                <p className="text-gray-600 dark:text-gray-400">Enter customer details to start the order</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter customer name"
                  className="block w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={customerMobile}
                  onChange={(e) => setCustomerMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="10-digit mobile number"
                  className="block w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Step 2: Select Products */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Select Products</h3>
                <span className="text-sm text-gray-600 dark:text-gray-400">{cart.length} items in cart</span>
              </div>

              {/* Search */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search products..."
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {filteredProducts.map(product => (
                  <div
                    key={product.id}
                    onClick={() => product.stock > 0 && addToCart(product)}
                    className={`border border-gray-200 dark:border-slate-700 rounded-lg p-3 transition-all ${product.stock > 0 ? 'hover:border-amber-500 hover:shadow-md cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                  >
                    <h4 className={`font-semibold text-sm mb-1 ${product.stock > 0 ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-500'}`}>
                      {product.productName}
                    </h4>
                    <p className="text-lg font-bold text-amber-600">₹{product.price}</p>
                    <div className="flex gap-1 flex-wrap mt-1">
                      {product.discount > 0 && (
                        <span className="inline-block px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs rounded">
                          {product.discount}% OFF
                        </span>
                      )}
                      {product.stock <= 0 ? (
                        <span className="inline-block px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 text-xs rounded">
                          Out of Stock
                        </span>
                      ) : product.stock < 10 && (
                        <span className="inline-block px-2 py-0.5 bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200 text-xs rounded">
                          {product.stock} left
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Current Cart Items */}
              {cart.length > 0 && (
                <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Cart Items</h4>
                  <div className="space-y-2">
                    {cart.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-900 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm text-gray-900 dark:text-white">{item.productName}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">₹{item.price} each</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, item.quantity - 1); }}
                            className="w-7 h-7 rounded bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 flex items-center justify-center"
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-semibold">{item.quantity}</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, item.quantity + 1); }}
                            className="w-7 h-7 rounded bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 flex items-center justify-center"
                          >
                            +
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); removeFromCart(item.id); }}
                            className="ml-2 text-red-500 hover:text-red-700"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Review & Payment */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h3>
                
                {/* Customer Info */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">Customer Details</p>
                  <p className="text-sm text-blue-800 dark:text-blue-300 mt-1">{customerName}</p>
                  <p className="text-sm text-blue-800 dark:text-blue-300">📞 {customerMobile}</p>
                </div>

                {/* Order Items */}
                <div className="space-y-2 mb-4">
                  {cart.map(item => {
                    const itemPrice = item.price * item.quantity;
                    const discountAmount = (itemPrice * item.discount) / 100;
                    const afterDiscount = itemPrice - discountAmount;
                    const cgst = (afterDiscount * item.cgst) / 100;
                    const sgst = (afterDiscount * item.sgst) / 100;
                    const itemTotal = afterDiscount + cgst + sgst;

                    return (
                      <div key={item.id} className="flex justify-between items-start p-3 border border-gray-200 dark:border-slate-700 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{item.productName}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            ₹{item.price} × {item.quantity} = ₹{itemPrice.toFixed(2)}
                          </p>
                          {item.discount > 0 && (
                            <p className="text-xs text-red-600 dark:text-red-400">-₹{discountAmount.toFixed(2)} ({item.discount}% off)</p>
                          )}
                          {(item.cgst > 0 || item.sgst > 0) && (
                            <p className="text-xs text-blue-600 dark:text-blue-400">+₹{(cgst + sgst).toFixed(2)} (Tax)</p>
                          )}
                        </div>
                        <p className="font-bold text-amber-600">₹{itemTotal.toFixed(2)}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Totals */}
                <div className="border-t border-gray-200 dark:border-slate-700 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span className="font-medium text-gray-900 dark:text-white">₹{totals.subtotal.toFixed(2)}</span>
                  </div>
                  {totals.totalDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Discount</span>
                      <span className="font-medium text-red-600">-₹{totals.totalDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Tax (GST)</span>
                    <span className="font-medium text-gray-900 dark:text-white">₹{totals.totalTax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold pt-2 border-t border-gray-200 dark:border-slate-700">
                    <span className="text-gray-900 dark:text-white">Total</span>
                    <span className="text-amber-600">₹{totals.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="mt-6">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['cash', 'card', 'upi'].map(method => (
                      <button
                        key={method}
                        onClick={() => setPaymentMethod(method)}
                        className={`p-4 border-2 rounded-xl transition-all ${
                          paymentMethod === method
                            ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                            : 'border-gray-200 dark:border-slate-700 hover:border-amber-300'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-2xl mb-1">
                            {method === 'cash' ? '💵' : method === 'card' ? '💳' : '📱'}
                          </div>
                          <p className="text-sm font-semibold capitalize text-gray-900 dark:text-white">{method}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 flex gap-3">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              disabled={loading}
              className="px-6 py-3 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-all disabled:opacity-50"
            >
              Back
            </button>
          )}
          {step < 3 ? (
            <button
              onClick={step === 1 ? handleStep1Next : handleStep2Next}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold rounded-xl shadow-lg transition-all"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleCompleteOrder}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Complete Order</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

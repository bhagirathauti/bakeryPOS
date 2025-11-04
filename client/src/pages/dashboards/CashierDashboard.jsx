import React, { useState, useEffect } from 'react'
import CashierProfile from '../../components/cashier/CashierProfile'
import NewOrderModal from '../../components/cashier/NewOrderModal'
import axios from '../../utils/axios'

export default function CashierDashboard({ user, activeTab }) {
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [todayOrders, setTodayOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterPayment, setFilterPayment] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const ordersPerPage = 10;

  useEffect(() => {
    fetchProfile();
  }, [user]);

  useEffect(() => {
    if (profile && user.shopId && activeTab === 'checkout') {
      fetchProducts();
      fetchTodayOrders();
    }
    if (profile && user.shopId && activeTab === 'orders') {
      fetchAllOrders();
    }
  }, [profile, user.shopId, activeTab]);

  async function fetchProfile() {
    try {
      const API_BASE = 'http://localhost:4000';
      const { data } = await axios.get(`${API_BASE}/api/cashier/profile`, {
        params: { userId: user.id }
      });
      setProfile(data);
    } catch (err) {
      console.error('Fetch profile error:', err);
    } finally {
      setLoadingProfile(false);
    }
  }

  function handleProfileComplete(completedProfile) {
    setProfile(completedProfile);
  }

  async function fetchProducts() {
    if (!user.shopId) return;
    setLoadingProducts(true);
    try {
      const API_BASE = 'http://localhost:4000';
      const { data } = await axios.get(`${API_BASE}/api/products`, {
        params: { shopId: user.shopId }
      });
      setProducts(data);
    } catch (err) {
      console.error('Fetch products error:', err);
    } finally {
      setLoadingProducts(false);
    }
  }

  async function fetchTodayOrders() {
    if (!user.shopId) return;
    try {
      const API_BASE = 'http://localhost:4000';
      const { data } = await axios.get(`${API_BASE}/api/orders`, {
        params: { shopId: user.shopId }
      });
      const today = new Date().toDateString();
      const todayOrdersList = data.filter(order => 
        new Date(order.createdAt).toDateString() === today
      );
      setTodayOrders(todayOrdersList);
    } catch (err) {
      console.error('Fetch orders error:', err);
    }
  }

  async function fetchAllOrders() {
    if (!user.shopId) return;
    setLoadingOrders(true);
    try {
      const API_BASE = 'http://localhost:4000';
      const { data } = await axios.get(`${API_BASE}/api/orders`, {
        params: { shopId: user.shopId }
      });
      setAllOrders(data);
    } catch (err) {
      console.error('Fetch all orders error:', err);
    } finally {
      setLoadingOrders(false);
    }
  }

  function handleOrderComplete(order) {
    fetchTodayOrders();
    setShowOrderModal(false);
  }

  function calculateTodayStats() {
    const totalSales = todayOrders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = todayOrders.length;
    const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
    return { totalSales, totalOrders, avgOrderValue };
  }

  function getFilteredOrders() {
    let filtered = [...allOrders];

    // Filter by payment method
    if (filterPayment !== 'all') {
      filtered = filtered.filter(order => order.paymentMethod === filterPayment);
    }

    // Filter by date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (filterDate === 'today') {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === today.getTime();
      });
    } else if (filterDate === 'week') {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter(order => new Date(order.createdAt) >= weekAgo);
    } else if (filterDate === 'month') {
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      filtered = filtered.filter(order => new Date(order.createdAt) >= monthAgo);
    }

    return filtered;
  }

  function getPaginatedOrders() {
    const filtered = getFilteredOrders();
    const startIndex = (currentPage - 1) * ordersPerPage;
    const endIndex = startIndex + ordersPerPage;
    return filtered.slice(startIndex, endIndex);
  }

  function getTotalPages() {
    const filtered = getFilteredOrders();
    return Math.ceil(filtered.length / ordersPerPage);
  }

  // If profile is not complete, show profile setup page
  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-4">
            <div className="w-16 h-16 border-4 border-amber-200 dark:border-amber-900 rounded-full mx-auto"></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!profile || !profile.cashierName) {
    return <CashierProfile user={user} onProfileComplete={handleProfileComplete} />;
  }

  function renderTabContent() {
    switch (activeTab) {
      case 'checkout':
        const stats = calculateTodayStats();
        
        return (
          <div className="space-y-6">
            {/* Cashier & Shop Info Card */}
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-3 border-white/30 bg-white/20 flex items-center justify-center">
                    {profile.profilePic ? (
                      <img src={profile.profilePic} alt={profile.cashierName} className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="text-amber-100 text-sm font-medium">Cashier on Duty</p>
                    <h2 className="text-2xl font-bold">{profile.cashierName}</h2>
                    {profile.mobile && (
                      <p className="text-amber-100 text-sm mt-1">📞 {profile.mobile}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-amber-100 text-sm font-medium">Shop</p>
                  <h3 className="text-2xl font-bold">{user.shopName || 'Shop Name'}</h3>
                  <p className="text-amber-100 text-sm mt-1">🏪 POS System</p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg">
                <div className="text-sm font-medium opacity-90">Today's Sales</div>
                <div className="text-3xl font-bold mt-2">₹{stats.totalSales.toFixed(2)}</div>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg">
                <div className="text-sm font-medium opacity-90">Orders Today</div>
                <div className="text-3xl font-bold mt-2">{stats.totalOrders}</div>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
                <div className="text-sm font-medium opacity-90">Avg. Order Value</div>
                <div className="text-3xl font-bold mt-2">₹{stats.avgOrderValue.toFixed(2)}</div>
              </div>
            </div>

            {/* Start Order Section */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
              <div className="p-12 text-center">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-xl shadow-amber-500/30 mb-6">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Ready to Start New Order?</h3>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                  Click below to begin a new customer order
                </p>
                <button
                  onClick={() => setShowOrderModal(true)}
                  className="px-10 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-lg font-bold rounded-xl shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 transition-all duration-200 transform hover:scale-105"
                >
                  🛒 Start New Order
                </button>
              </div>
            </div>

            {/* Recent Orders */}
            {todayOrders.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Today's Orders</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{todayOrders.length} orders completed</p>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {todayOrders.slice(0, 5).map(order => (
                      <div key={order.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{order.customerName}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">📞 {order.customerMobile}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {new Date(order.createdAt).toLocaleTimeString()} • {order.orderItems.length} items
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-amber-600">₹{order.total.toFixed(2)}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{order.paymentMethod}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Order Modal */}
            <NewOrderModal
              open={showOrderModal}
              onClose={() => setShowOrderModal(false)}
              products={products}
              onComplete={handleOrderComplete}
              cashierId={user.id}
              shopId={user.shopId}
            />
          </div>
        );
      case 'checkout':
        return (
          <div className="space-y-6">
            {/* Cashier & Shop Info Card */}
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-3 border-white/30 bg-white/20 flex items-center justify-center">
                    {profile.profilePic ? (
                      <img src={profile.profilePic} alt={profile.cashierName} className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="text-amber-100 text-sm font-medium">Cashier on Duty</p>
                    <h2 className="text-2xl font-bold">{profile.cashierName}</h2>
                    {profile.mobile && (
                      <p className="text-amber-100 text-sm mt-1">📞 {profile.mobile}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-amber-100 text-sm font-medium">Shop</p>
                  <h3 className="text-2xl font-bold">{user.shopName || 'Shop Name'}</h3>
                  <p className="text-amber-100 text-sm mt-1">🏪 POS System</p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg">
                <div className="text-sm font-medium opacity-90">Today's Sales</div>
                <div className="text-3xl font-bold mt-2">₹0.00</div>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg">
                <div className="text-sm font-medium opacity-90">Orders Today</div>
                <div className="text-3xl font-bold mt-2">0</div>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
                <div className="text-sm font-medium opacity-90">Items in Cart</div>
                <div className="text-3xl font-bold mt-2">{cart.reduce((sum, item) => sum + item.quantity, 0)}</div>
              </div>
            </div>

            {/* Checkout Interface - Products & Cart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Products List */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Available Products</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Select products to add to cart</p>
                </div>
                <div className="p-6">
                  {loadingProducts ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
                    </div>
                  ) : products.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">�</div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Products Available</h3>
                      <p className="text-gray-600 dark:text-gray-400">Contact your shop owner to add products</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto">
                      {products.map(product => (
                        <div
                          key={product.id}
                          onClick={() => product.stock > 0 && addToCart(product)}
                          className={`border border-gray-200 dark:border-slate-700 rounded-xl p-4 transition-all ${product.stock > 0 ? 'hover:border-amber-500 dark:hover:border-amber-500 hover:shadow-md cursor-pointer group' : 'opacity-50 cursor-not-allowed'}`}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <h4 className={`font-semibold ${product.stock > 0 ? 'text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400' : 'text-gray-500 dark:text-gray-500'} transition-colors`}>
                              {product.productName}
                            </h4>
                            <span className="text-lg font-bold text-amber-600">₹{product.price}</span>
                          </div>
                          <div className="flex gap-2 text-xs text-gray-600 dark:text-gray-400 mb-2">
                            {product.discount > 0 && (
                              <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded">
                                {product.discount}% OFF
                              </span>
                            )}
                            {(product.cgst > 0 || product.sgst > 0) && (
                              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                                +{product.cgst + product.sgst}% Tax
                              </span>
                            )}
                          </div>
                          <div className="mb-2">
                            {product.stock <= 0 ? (
                              <span className="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 text-xs font-medium rounded">
                                Out of Stock
                              </span>
                            ) : product.stock < 10 ? (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200 text-xs font-medium rounded">
                                {product.stock} left
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200 text-xs font-medium rounded">
                                {product.stock} in stock
                              </span>
                            )}
                          </div>
                          {product.stock > 0 && (
                            <button className="mt-3 w-full px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                              Add to Cart
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Cart */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-slate-700 dark:to-slate-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    🛒 Current Order
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {cart.length} item{cart.length !== 1 ? 's' : ''} in cart
                  </p>
                </div>
                <div className="p-4">
                  {cart.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-5xl mb-3">🛒</div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">Cart is empty</p>
                      <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">Click products to add</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3 max-h-[400px] overflow-y-auto mb-4">
                        {cart.map(item => {
                          const price = item.price;
                          const discount = (price * item.discount) / 100;
                          const afterDiscount = price - discount;
                          const cgst = (afterDiscount * item.cgst) / 100;
                          const sgst = (afterDiscount * item.sgst) / 100;
                          const itemTotal = (afterDiscount + cgst + sgst) * item.quantity;

                          return (
                            <div key={item.id} className="border border-gray-200 dark:border-slate-700 rounded-lg p-3">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-medium text-sm text-gray-900 dark:text-white flex-1">
                                  {item.productName}
                                </h4>
                                <button
                                  onClick={() => removeFromCart(item.id)}
                                  className="text-red-500 hover:text-red-700 ml-2"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    className="w-6 h-6 rounded bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 flex items-center justify-center text-sm"
                                  >
                                    -
                                  </button>
                                  <span className="w-8 text-center font-semibold text-sm">{item.quantity}</span>
                                  <button
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    className="w-6 h-6 rounded bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 flex items-center justify-center text-sm"
                                  >
                                    +
                                  </button>
                                </div>
                                <span className="font-bold text-amber-600">₹{itemTotal.toFixed(2)}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Cart Total */}
                      <div className="border-t border-gray-200 dark:border-slate-700 pt-4 space-y-2">
                        <div className="flex justify-between text-2xl font-bold text-gray-900 dark:text-white">
                          <span>Total:</span>
                          <span className="text-amber-600">₹{calculateTotal().toFixed(2)}</span>
                        </div>
                        <button
                          onClick={clearCart}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors text-sm"
                        >
                          Clear Cart
                        </button>
                        <button
                          className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-lg shadow-lg transition-all"
                        >
                          Complete Order
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      case 'orders':
        const paginatedOrders = getPaginatedOrders();
        const totalPages = getTotalPages();
        const filteredCount = getFilteredOrders().length;

        return (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Order History</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {filteredCount} {filteredCount === 1 ? 'order' : 'orders'} found
                  </p>
                </div>
              </div>

              {/* Filters */}
              <div className="mt-4 flex flex-wrap gap-3">
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Date Range</label>
                  <select
                    value={filterDate}
                    onChange={(e) => { setFilterDate(e.target.value); setCurrentPage(1); }}
                    className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Payment Method</label>
                  <select
                    value={filterPayment}
                    onChange={(e) => { setFilterPayment(e.target.value); setCurrentPage(1); }}
                    className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="all">All Methods</option>
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="upi">UPI</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-6">
              {loadingOrders ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
                </div>
              ) : allOrders.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📦</div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Orders Yet</h3>
                  <p className="text-gray-600 dark:text-gray-400">Orders will appear here once customers make purchases</p>
                </div>
              ) : filteredCount === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Orders Found</h3>
                  <p className="text-gray-600 dark:text-gray-400">Try adjusting your filters</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {paginatedOrders.map(order => (
                      <div key={order.id} className="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                        {/* Collapsed View */}
                        <div 
                          className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50"
                          onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <h4 className="font-semibold text-gray-900 dark:text-white">{order.customerName}</h4>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  Order #{order.id}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 mt-1">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  📞 {order.customerMobile}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-500">
                                  {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {order.orderItems.length} {order.orderItems.length === 1 ? 'item' : 'items'}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <p className="text-xl font-bold text-amber-600">₹{order.total.toFixed(2)}</p>
                                <span className="inline-block px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 text-xs font-medium rounded capitalize">
                                  {order.paymentMethod}
                                </span>
                              </div>
                              <svg 
                                className={`w-5 h-5 text-gray-400 transition-transform ${expandedOrder === order.id ? 'rotate-180' : ''}`}
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                        </div>

                        {/* Expanded View */}
                        {expandedOrder === order.id && (
                          <div className="px-4 pb-4 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50">
                            {/* Order Items */}
                            <div className="mt-4">
                              <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Order Items:</h5>
                              <div className="space-y-2">
                                {order.orderItems.map(item => (
                                  <div key={item.id} className="flex justify-between items-center text-sm bg-white dark:bg-slate-800 p-2 rounded">
                                    <div className="flex-1">
                                      <span className="text-gray-900 dark:text-white font-medium">{item.productName}</span>
                                      <span className="text-gray-500 dark:text-gray-400 ml-2">× {item.quantity}</span>
                                      <span className="text-gray-400 dark:text-gray-500 text-xs ml-2">@ ₹{item.price.toFixed(2)}</span>
                                    </div>
                                    <span className="text-gray-700 dark:text-gray-300 font-medium">₹{item.total.toFixed(2)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Order Summary */}
                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                  <span>Subtotal:</span>
                                  <span>₹{order.subtotal.toFixed(2)}</span>
                                </div>
                                {order.discount > 0 && (
                                  <div className="flex justify-between text-green-600 dark:text-green-400">
                                    <span>Discount:</span>
                                    <span>-₹{order.discount.toFixed(2)}</span>
                                  </div>
                                )}
                                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                  <span>Tax (CGST + SGST):</span>
                                  <span>₹{order.tax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-gray-900 dark:text-white text-base pt-2 border-t border-gray-200 dark:border-slate-700">
                                  <span>Total:</span>
                                  <span>₹{order.total.toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-6 flex justify-between items-center">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Page {currentPage} of {totalPages}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {renderTabContent()}
      </div>
    </div>
  )
}

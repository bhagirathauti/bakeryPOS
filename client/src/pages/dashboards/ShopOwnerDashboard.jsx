import React, { useState, useEffect } from 'react'
import ShopProfile from '../../components/shopowner/ShopProfile'
import AddProductModal from '../../components/products/AddProductModal'
import AddCashierModal from '../../components/cashiers/AddCashierModal'
import axios from '../../utils/axios'

export default function ShopOwnerDashboard({ user, activeTab }) {
  const [profile, setProfile] = useState(null)
  const [lastSavedProfile, setLastSavedProfile] = useState(null)
  function onProfileChange(obj) {
    setProfile(obj)
  }

  useEffect(() => {
    if (profile && profile.shopName && profile.mobile && profile.address && profile.ownerName) {
      setLastSavedProfile(profile)
    }
  }, [profile])

  // Tab content rendering

  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [errorProducts, setErrorProducts] = useState('');

  const [showAddCashier, setShowAddCashier] = useState(false);
  const [cashiers, setCashiers] = useState([]);
  const [loadingCashiers, setLoadingCashiers] = useState(false);
  const [errorCashiers, setErrorCashiers] = useState('');

  const [allOrders, setAllOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterPayment, setFilterPayment] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const ordersPerPage = 10;

  async function fetchProducts() {
    if (!profile || !profile.id) return;
    setLoadingProducts(true);
    setErrorProducts('');
    try {
      const API_BASE = 'http://localhost:4000';
      const { data } = await axios.get(`${API_BASE}/api/products`, { params: { shopId: profile.id } });
      setProducts(data);
    } catch (e) {
      setErrorProducts('Could not load products');
    } finally {
      setLoadingProducts(false);
    }
  }

  useEffect(() => {
    if ((activeTab === 'products' || activeTab === 'sales') && profile && profile.id) {
      fetchProducts();
    }
    if (activeTab === 'cashiers' && profile && profile.id) {
      fetchCashiers();
    }
    if (activeTab === 'orders' && profile && profile.id) {
      fetchAllOrders();
    }
    // eslint-disable-next-line
  }, [activeTab, profile && profile.id]);
  console.log(profile)

  async function handleAddProduct(product) {
    try {
      const API_BASE = 'http://localhost:4000';
      const payload = { shopId: profile.id, ...product };
      const res = await axios.post(`${API_BASE}/api/products`, payload);
      await fetchProducts();
    } catch (e) {
      if (e.response) {
        alert('Failed to add product: ' + (e.response.data.error || 'Unknown error'));
      } else {
        alert('Failed to add product');
      }
    }
  }

  async function handleDeleteProduct(productId) {
    if (!window.confirm('Delete this product?')) return;
    try {
      const API_BASE = 'http://localhost:4000';
      await axios.delete(`${API_BASE}/api/products/${productId}`);
      await fetchProducts();
    } catch (e) {
      alert('Failed to delete product');
    }
  }

  async function handleEditProduct(product) {
    setEditProduct(product);
  }

  async function handleUpdateProduct(updated) {
    try {
      const API_BASE = 'http://localhost:4000';
      // Ensure numeric fields are numbers
      const payload = {
        productName: updated.productName,
        price: Number(updated.price),
        discount: Number(updated.discount) || 0,
        cgst: Number(updated.cgst) || 0,
        sgst: Number(updated.sgst) || 0,
        stock: Number(updated.stock) || 0,
      };
      await axios.put(`${API_BASE}/api/products/${editProduct.id}`, payload);
      setEditProduct(null);
      await fetchProducts();
    } catch (e) {
      alert('Failed to update product');
    }
  }

  // Cashier management functions
  async function fetchCashiers() {
    if (!profile || !profile.id) return;
    setLoadingCashiers(true);
    setErrorCashiers('');
    try {
      const API_BASE = 'http://localhost:4000';
      const { data } = await axios.get(`${API_BASE}/api/cashiers`, { params: { shopId: profile.id } });
      setCashiers(data);
    } catch (e) {
      setErrorCashiers('Could not load cashiers');
    } finally {
      setLoadingCashiers(false);
    }
  }

  async function handleAddCashier(cashierData) {
    try {
      const API_BASE = 'http://localhost:4000';
      const payload = { shopId: profile.id, ...cashierData };
      await axios.post(`${API_BASE}/api/cashiers`, payload);
      await fetchCashiers();
    } catch (e) {
      if (e.response && e.response.data && e.response.data.error === 'user_exists') {
        throw new Error('A user with this email already exists');
      }
      throw new Error('Failed to add cashier');
    }
  }

  async function handleDeleteCashier(cashierId) {
    if (!window.confirm('Remove this cashier? They will no longer be able to access your shop.')) return;
    try {
      const API_BASE = 'http://localhost:4000';
      await axios.delete(`${API_BASE}/api/cashiers/${cashierId}`);
      await fetchCashiers();
    } catch (e) {
      alert('Failed to remove cashier');
    }
  }

  async function fetchAllOrders() {
    if (!profile || !profile.id) return;
    setLoadingOrders(true);
    try {
      const API_BASE = 'http://localhost:4000';
      const { data } = await axios.get(`${API_BASE}/api/orders`, {
        params: { shopId: profile.id }
      });
      setAllOrders(data);
    } catch (err) {
      console.error('Fetch all orders error:', err);
    } finally {
      setLoadingOrders(false);
    }
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

  function renderTabContent() {
    switch (activeTab) {
      case 'profile':
        return (
          <ShopProfile
            onProfileChange={onProfileChange}
            user={user}
            lastSavedProfile={lastSavedProfile}
          />
        );
      case 'products':
        return (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-xl p-6 shadow-lg">
                <div className="text-sm font-medium opacity-90">Total Products</div>
                <div className="text-3xl font-bold mt-2">{products.length}</div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg">
                <div className="text-sm font-medium opacity-90">Active</div>
                <div className="text-3xl font-bold mt-2">{products.length}</div>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg">
                <div className="text-sm font-medium opacity-90">Categories</div>
                <div className="text-3xl font-bold mt-2">-</div>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Product Inventory</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your bakery products</p>
                </div>
                <button
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                  onClick={() => setShowAddProduct(true)}
                >
                  <span className="text-lg">+</span>
                  Add Product
                </button>
              </div>
              <div className="p-6">
                {loadingProducts ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
                  </div>
                ) : errorProducts ? (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-800 dark:text-red-200">
                    {errorProducts}
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🍰</div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Products Yet</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">Start by adding your first bakery product</p>
                    <button
                      className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium"
                      onClick={() => setShowAddProduct(true)}
                    >
                      Add Your First Product
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-slate-700">
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Product Name</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Price</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Stock</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Discount</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">CGST</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">SGST</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                        {products.map(p => (
                          <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                            <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-white">{p.productName}</td>
                            <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">₹{p.price.toFixed(2)}</td>
                            <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.stock <= 0 ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200' : p.stock < 10 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200' : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'}`}>
                                {p.stock} units
                              </span>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">{p.discount}%</td>
                            <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">{p.cgst}%</td>
                            <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">{p.sgst}%</td>
                            <td className="px-4 py-4 text-sm text-right space-x-2">
                              <button 
                                className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-200 rounded-lg font-medium transition-colors" 
                                onClick={() => handleEditProduct(p)}
                              >
                                Edit
                              </button>
                              <button 
                                className="px-3 py-1.5 bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-700 dark:text-red-200 rounded-lg font-medium transition-colors" 
                                onClick={() => handleDeleteProduct(p.id)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
            <AddProductModal
              open={showAddProduct}
              onClose={() => setShowAddProduct(false)}
              onAdd={handleAddProduct}
            />
            {editProduct && (
              <AddProductModal
                open={true}
                onClose={() => setEditProduct(null)}
                onAdd={handleUpdateProduct}
                initial={editProduct}
              />
            )}
          </div>
        );
      case 'sales':
        return (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Sales Analytics</h3>
              <p className="text-gray-600 dark:text-gray-400">Sales tracking and reports will appear here</p>
            </div>
          </div>
        );
      case 'cashiers':
        return (
          <div className="space-y-6">
            {/* Stats Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
                <div className="text-sm font-medium opacity-90">Total Cashiers</div>
                <div className="text-3xl font-bold mt-2">{cashiers.length}</div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg">
                <div className="text-sm font-medium opacity-90">Active</div>
                <div className="text-3xl font-bold mt-2">{cashiers.length}</div>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg">
                <div className="text-sm font-medium opacity-90">This Month</div>
                <div className="text-3xl font-bold mt-2">{cashiers.filter(c => {
                  const created = new Date(c.createdAt);
                  const now = new Date();
                  return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
                }).length}</div>
              </div>
            </div>

            {/* Cashiers Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Cashier Management</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your shop's cashier accounts</p>
                </div>
                <button
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                  onClick={() => setShowAddCashier(true)}
                >
                  <span className="text-lg">+</span>
                  Add Cashier
                </button>
              </div>
              <div className="p-6">
                {loadingCashiers ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
                  </div>
                ) : errorCashiers ? (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-800 dark:text-red-200">
                    {errorCashiers}
                  </div>
                ) : cashiers.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">�</div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Cashiers Yet</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">Add cashiers to help manage your shop</p>
                    <button
                      className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium"
                      onClick={() => setShowAddCashier(true)}
                    >
                      Add Your First Cashier
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-slate-700">
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Email</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Role</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Added On</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                        {cashiers.map(c => (
                          <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                            <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-white">{c.email}</td>
                            <td className="px-4 py-4 text-sm">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                                💵 Cashier
                              </span>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                              {new Date(c.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-4 text-sm text-right">
                              <button 
                                className="px-3 py-1.5 bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-700 dark:text-red-200 rounded-lg font-medium transition-colors" 
                                onClick={() => handleDeleteCashier(c.id)}
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
            <AddCashierModal
              open={showAddCashier}
              onClose={() => setShowAddCashier(false)}
              onAdd={handleAddCashier}
            />
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
      case 'landing':
        return (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🌐</div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Shop Landing Page</h3>
              <p className="text-gray-600 dark:text-gray-400">Customize your shop's public page</p>
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

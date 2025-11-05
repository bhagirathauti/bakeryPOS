import React, { useState, useEffect } from 'react'
import ShopProfile from '../../components/shopowner/ShopProfile'
import AddProductModal from '../../components/products/AddProductModal'
import InventoryModal from '../../components/products/InventoryModal'
import AddCashierModal from '../../components/shopowner/AddCashierModal'
import axios from '../../utils/axios'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import jsPDF from 'jspdf'
import OrderDetailsModal from '../../components/OrderDetailsModal'
import { computeOrderTotals } from '../../utils/orderCalculations'

export default function ShopOwnerDashboard({ user, activeTab, onProfileStatusChange }) {
  const [profile, setProfile] = useState(null)
  const [lastSavedProfile, setLastSavedProfile] = useState(null)
  function onProfileChange(obj) {
    setProfile(obj)
  }

  useEffect(() => {
    if (profile && profile.shopName && profile.mobile && profile.address && profile.ownerName) {
      setLastSavedProfile(profile)
      // Notify parent that profile is complete
      if (onProfileStatusChange) {
        onProfileStatusChange(true);
      }
    } else {
      // Notify parent that profile is incomplete
      if (onProfileStatusChange) {
        onProfileStatusChange(false);
      }
    }
  }, [profile, onProfileStatusChange])

  // Fetch profile on component mount
  useEffect(() => {
    async function fetchProfile() {
      if (!user || !user.id) return;
      
      // Reset profile first to clear any previous user's data
      setProfile(null);
      
      const API_BASE = 'http://localhost:4000';
      try {
        const res = await fetch(`${API_BASE}/api/shop/profile?userId=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data && (data.shopName || data.mobile || data.address || data.ownerName)) {
            setProfile({
              id: data.id,
              shopName: data.shopName || '',
              mobile: data.mobile || '',
              address: data.address || '',
              ownerName: data.ownerName || '',
              profilePic: data.profilePic || null
            });
          } else {
            // No profile data - keep profile as null
            setProfile(null);
          }
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        setProfile(null);
      }
    }
    
    fetchProfile();
  }, [user]);

  // Tab content rendering

  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [errorProducts, setErrorProducts] = useState('');
  const [inventoryProduct, setInventoryProduct] = useState(null);

  const [showAddCashier, setShowAddCashier] = useState(false);
  const [cashiers, setCashiers] = useState([]);
  const [loadingCashiers, setLoadingCashiers] = useState(false);
  const [errorCashiers, setErrorCashiers] = useState('');

  const [allOrders, setAllOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterPayment, setFilterPayment] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [filterCashier, setFilterCashier] = useState('all');
  const [viewOrderModal, setViewOrderModal] = useState(null);
  const [ordersPerPage, setOrdersPerPage] = useState(10);

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
    if ((activeTab === 'sales' || activeTab === 'orders' || activeTab === 'customers') && profile && profile.id) {
      fetchAllOrders();
    }
    if (activeTab === 'cashiers' && profile && profile.id) {
      fetchCashiers();
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
      };
      // First update non-stock fields via PUT
      await axios.put(`${API_BASE}/api/products/${editProduct.id}`, payload);
      // If the edit form included a stock value, call the inventory increment endpoint with the delta
      if (updated.stock !== undefined && updated.stock !== '' && updated.stock !== null) {
        const delta = Number(updated.stock) || 0;
        if (delta !== 0) {
          // Use the stockReason from the modal, fallback to 'manual_adjustment' if not provided
          const reason = updated.stockReason || 'manual_adjustment';
          await axios.post(`${API_BASE}/api/products/${editProduct.id}/inventory`, { delta, reason, userId: user?.id });
        }
      }
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

    // Filter by cashier
    if (filterCashier !== 'all') {
      filtered = filtered.filter(order => order.cashierId === Number(filterCashier));
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

  function getSalesData() {
    // Calculate key metrics
    const totalRevenue = allOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const totalOrders = allOrders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Today's sales
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = allOrders.filter(order => {
      const orderDate = new Date(order.createdAt);
      orderDate.setHours(0, 0, 0, 0);
      return orderDate.getTime() === today.getTime();
    });
    const todayRevenue = todayOrders.reduce((sum, order) => sum + (order.total || 0), 0);

    // Daily sales for last 7 days
    const dailySales = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const dayOrders = allOrders.filter(order => {
        const orderDate = new Date(order.createdAt);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === date.getTime();
      });
      
      dailySales.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: dayOrders.reduce((sum, order) => sum + (order.total || 0), 0),
        orders: dayOrders.length
      });
    }

    // Top products by quantity and revenue
    const productStats = {};
    allOrders.forEach(order => {
      if (order.orderItems && Array.isArray(order.orderItems)) {
        order.orderItems.forEach(item => {
          const productId = item.productId;
          // Use productName directly from orderItem (it's stored there)
          const productName = item.productName || `Product ${productId}`;
          
          if (!productStats[productId]) {
            productStats[productId] = {
              name: productName,
              quantity: 0,
              revenue: 0
            };
          }
          
          productStats[productId].quantity += item.quantity || 0;
          productStats[productId].revenue += (item.quantity || 0) * (item.price || 0);
        });
      }
    });

    const topProducts = Object.values(productStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Payment methods distribution
    const paymentStats = {};
    const paymentColors = {
      'cash': '#10b981',
      'card': '#3b82f6',
      'upi': '#8b5cf6',
      'other': '#f59e0b'
    };

    allOrders.forEach(order => {
      const method = order.paymentMethod || 'other';
      paymentStats[method] = (paymentStats[method] || 0) + 1;
    });

    const paymentMethods = Object.entries(paymentStats).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: paymentColors[name] || '#6b7280'
    }));

    // Cashier sales breakdown
    const cashierStats = {};
    allOrders.forEach(order => {
      const cashierId = order.cashierId;
      if (!cashierId) return;

      if (!cashierStats[cashierId]) {
        // Get cashier name from order's cashier data
        let cashierName = `Cashier ${cashierId}`;
        if (order.cashier) {
          if (order.cashier.CashierProfile && order.cashier.CashierProfile.cashierName) {
            cashierName = order.cashier.CashierProfile.cashierName;
          } else {
            cashierName = order.cashier.email;
          }
        }
        
        cashierStats[cashierId] = {
          name: cashierName,
          revenue: 0,
          orders: 0
        };
      }

      cashierStats[cashierId].revenue += order.total || 0;
      cashierStats[cashierId].orders += 1;
    });

    const cashierSales = Object.values(cashierStats)
      .sort((a, b) => b.revenue - a.revenue);

    return {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      todayRevenue,
      todayOrders: todayOrders.length,
      dailySales,
      topProducts,
      paymentMethods,
      cashierSales
    };
  }

  function getCustomersData() {
    const customerMap = {};
    
    allOrders.forEach(order => {
      const mobile = order.customerMobile;
      const name = order.customerName;
      
      if (!mobile) return; // Skip orders without customer mobile
      
      if (!customerMap[mobile]) {
        customerMap[mobile] = {
          name: name,
          mobile: mobile,
          totalSpent: 0,
          orderCount: 0,
          lastOrderDate: order.createdAt
        };
      }
      
      customerMap[mobile].totalSpent += order.total || 0;
      customerMap[mobile].orderCount += 1;
      
      // Keep the most recent order date
      if (new Date(order.createdAt) > new Date(customerMap[mobile].lastOrderDate)) {
        customerMap[mobile].lastOrderDate = order.createdAt;
        customerMap[mobile].name = name; // Update name to most recent
      }
    });
    
    // Convert to array and sort by total spent (descending)
    return Object.values(customerMap).sort((a, b) => b.totalSpent - a.totalSpent);
  }

  function downloadOrderPDF(order) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 15;

    // Shop Header with border
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.roundedRect(10, 10, pageWidth - 20, 35, 2, 2);

    yPosition = 18;
    doc.setFontSize(22);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(218, 165, 32); // Amber color
    doc.text(profile?.shopName || 'Shop Name', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 7;
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text(profile?.address || 'Shop Address', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 5;
    doc.text(`Contact: ${profile?.mobile || 'N/A'} | Email: ${user?.email || 'N/A'}`, pageWidth / 2, yPosition, { align: 'center' });
    
    // Invoice Title
    yPosition = 55;
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('TAX INVOICE', pageWidth / 2, yPosition, { align: 'center' });
    
    // Order Details Box
    yPosition = 65;
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    
    // Left side - Customer info
    doc.setFont(undefined, 'bold');
    doc.text('BILL TO:', 15, yPosition);
    doc.setFont(undefined, 'normal');
    yPosition += 5;
    doc.text(order.customerName, 15, yPosition);
    yPosition += 4;
    doc.text(`Mobile: ${order.customerMobile}`, 15, yPosition);
    
    // Right side - Invoice info
    yPosition = 65;
    doc.setFont(undefined, 'bold');
    doc.text('Invoice #:', pageWidth - 70, yPosition);
    doc.setFont(undefined, 'normal');
    doc.text(order.id.toString(), pageWidth - 15, yPosition, { align: 'right' });
    
    yPosition += 5;
    doc.setFont(undefined, 'bold');
    doc.text('Date:', pageWidth - 70, yPosition);
    doc.setFont(undefined, 'normal');
    doc.text(new Date(order.createdAt).toLocaleDateString('en-IN'), pageWidth - 15, yPosition, { align: 'right' });
    
    yPosition += 5;
    doc.setFont(undefined, 'bold');
    doc.text('Time:', pageWidth - 70, yPosition);
    doc.setFont(undefined, 'normal');
    doc.text(new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }), pageWidth - 15, yPosition, { align: 'right' });
    
    yPosition += 5;
    doc.setFont(undefined, 'bold');
    doc.text('Payment:', pageWidth - 70, yPosition);
    doc.setFont(undefined, 'normal');
    doc.text(order.paymentMethod.toUpperCase(), pageWidth - 15, yPosition, { align: 'right' });
    
    // Items Table
    yPosition += 10;
    doc.setDrawColor(0, 0, 0);
    doc.setFillColor(240, 240, 240);
    doc.rect(10, yPosition - 5, pageWidth - 20, 8, 'FD');
    
    doc.setFont(undefined, 'bold');
    doc.setFontSize(9);
    doc.text('ITEM', 12, yPosition);
    doc.text('QTY', 90, yPosition, { align: 'center' });
    doc.text('RATE', 110, yPosition, { align: 'center' });
    doc.text('DISC%', 130, yPosition, { align: 'center' });
    doc.text('CGST%', 150, yPosition, { align: 'center' });
    doc.text('SGST%', 170, yPosition, { align: 'center' });
    doc.text('AMOUNT', pageWidth - 12, yPosition, { align: 'right' });
    
    yPosition += 5;
    doc.setLineWidth(0.3);
    doc.line(10, yPosition, pageWidth - 10, yPosition);
    
    // Items
    yPosition += 5;
    doc.setFont(undefined, 'normal');
    doc.setFontSize(8);
    
    order.orderItems.forEach((item, index) => {
      // Check if we need a new page
      if (yPosition > 260) {
        doc.addPage();
        yPosition = 20;
      }
      
      // Alternate row background
      if (index % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(10, yPosition - 4, pageWidth - 20, 6, 'F');
      }
      
      doc.text(item.productName.substring(0, 30), 12, yPosition);
      doc.text(item.quantity.toString(), 90, yPosition, { align: 'center' });
      doc.text(`Rs.${item.price.toFixed(2)}`, 110, yPosition, { align: 'center' });
      doc.text(item.discount > 0 ? `${item.discount.toFixed(1)}%` : '-', 130, yPosition, { align: 'center' });
      doc.text(`${item.cgst.toFixed(1)}%`, 150, yPosition, { align: 'center' });
      doc.text(`${item.sgst.toFixed(1)}%`, 170, yPosition, { align: 'center' });
      doc.text(`Rs.${item.total.toFixed(2)}`, pageWidth - 12, yPosition, { align: 'right' });
      yPosition += 6;
    });
    
    // Bottom line
    yPosition += 2;
    doc.setLineWidth(0.5);
    doc.line(10, yPosition, pageWidth - 10, yPosition);
    
    // Summary Section
    yPosition += 8;
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    
    // Calculate totals using shared helper
    const { subtotal: computedSubtotal, totalDiscount, cgst: totalCGST, sgst: totalSGST, totalTax } = computeOrderTotals(order.orderItems || []);
    
    // Right aligned summary
    const summaryX = 130;
    
  doc.text('Subtotal:', summaryX, yPosition);
  // Prefer server-provided subtotal if present, otherwise use computed
  const subtotalToShow = (order.subtotal != null) ? order.subtotal : computedSubtotal;
  doc.text(`Rs.${subtotalToShow.toFixed(2)}`, pageWidth - 12, yPosition, { align: 'right' });
    
    if (totalDiscount > 0) {
      yPosition += 5;
      doc.setTextColor(34, 139, 34); // Green for discount
      doc.text('Total Discount:', summaryX, yPosition);
      doc.text(`-Rs.${totalDiscount.toFixed(2)}`, pageWidth - 12, yPosition, { align: 'right' });
      doc.setTextColor(0, 0, 0);
    }
    
  yPosition += 5;
  doc.text('CGST:', summaryX, yPosition);
  doc.text(`Rs.${totalCGST.toFixed(2)}`, pageWidth - 12, yPosition, { align: 'right' });

  yPosition += 5;
  doc.text('SGST:', summaryX, yPosition);
  doc.text(`Rs.${totalSGST.toFixed(2)}`, pageWidth - 12, yPosition, { align: 'right' });

  yPosition += 5;
  doc.setFont(undefined, 'bold');
  doc.text('Total Tax:', summaryX, yPosition);
  const taxToShow = (order.tax != null) ? order.tax : totalTax;
  doc.text(`Rs.${taxToShow.toFixed(2)}`, pageWidth - 12, yPosition, { align: 'right' });
    
    // Total with background
    yPosition += 7;
    doc.setFillColor(218, 165, 32); // Amber
    doc.roundedRect(summaryX - 5, yPosition - 5, pageWidth - summaryX - 7, 10, 2, 2, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text('GRAND TOTAL:', summaryX, yPosition + 2);
    doc.text(`Rs.${order.total.toFixed(2)}`, pageWidth - 12, yPosition + 2, { align: 'right' });
    
    // Footer
    yPosition += 15;
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.setFont(undefined, 'italic');
    doc.text('Thank you for your business!', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 4;
    doc.setFont(undefined, 'normal');
    doc.setFontSize(7);
    doc.text('This is a computer generated invoice and does not require signature', pageWidth / 2, yPosition, { align: 'center' });
    
    // Save PDF
    doc.save(`Invoice_${order.id}_${order.customerName.replace(/\s+/g, '_')}.pdf`);
  }

  function renderTabContent() {
    // Check if profile is complete (except for profile tab itself)
    const isProfileComplete = profile && profile.shopName && profile.mobile && profile.address && profile.ownerName;
    
    console.log('ShopOwnerDashboard - activeTab:', activeTab, 'isProfileComplete:', isProfileComplete, 'profile:', profile);
    
    if (!isProfileComplete && activeTab !== 'profile') {
      return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔒</div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Complete Your Profile First</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Please complete your shop profile to access other features. All required fields must be filled.
            </p>
          </div>
        </div>
      );
    }

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
                                className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900 dark:hover:bg-amber-800 text-amber-700 dark:text-amber-200 rounded-lg font-medium transition-colors"
                                onClick={() => setInventoryProduct(p)}
                                title="Inventory"
                              >
                                Inventory
                              </button>
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
            {inventoryProduct && (
              <InventoryModal product={inventoryProduct} onClose={() => setInventoryProduct(null)} />
            )}
          </div>
        );
      case 'sales':
        // Process sales data
        const salesData = getSalesData();
        
        return (
          <div className="space-y-6">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg">
                <div className="text-sm font-medium opacity-90">Total Revenue</div>
                <div className="text-3xl font-bold mt-2">₹{salesData.totalRevenue.toFixed(2)}</div>
                <div className="text-xs mt-1 opacity-75">All time</div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg">
                <div className="text-sm font-medium opacity-90">Total Orders</div>
                <div className="text-3xl font-bold mt-2">{salesData.totalOrders}</div>
                <div className="text-xs mt-1 opacity-75">Completed orders</div>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
                <div className="text-sm font-medium opacity-90">Avg Order Value</div>
                <div className="text-3xl font-bold mt-2">₹{salesData.avgOrderValue.toFixed(2)}</div>
                <div className="text-xs mt-1 opacity-75">Per transaction</div>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-6 shadow-lg">
                <div className="text-sm font-medium opacity-90">Today's Sales</div>
                <div className="text-3xl font-bold mt-2">₹{salesData.todayRevenue.toFixed(2)}</div>
                <div className="text-xs mt-1 opacity-75">{salesData.todayOrders} orders</div>
              </div>
            </div>

            {/* Daily Sales Trend Chart */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Daily Sales Trend (Last 7 Days)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData.dailySales}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} name="Revenue (₹)" />
                  <Line type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={2} name="Orders" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Top Products and Payment Methods */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Products Bar Chart */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Top Selling Products</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salesData.topProducts}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                    />
                    <Legend />
                    <Bar dataKey="quantity" fill="#8b5cf6" name="Quantity Sold" />
                    <Bar dataKey="revenue" fill="#3b82f6" name="Revenue (₹)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Payment Methods Pie Chart */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Payment Methods Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={salesData.paymentMethods}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {salesData.paymentMethods.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Cashier Performance Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Sales by Cashier</h3>
              {salesData.cashierSales.length === 0 ? (
                <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                  No cashier sales data available yet
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-slate-700">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Cashier</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Total Orders</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Total Revenue</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Avg Order Value</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">% of Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                      {salesData.cashierSales.map((cashier, idx) => {
                        const percentOfTotal = salesData.totalRevenue > 0 
                          ? (cashier.revenue / salesData.totalRevenue * 100).toFixed(1)
                          : 0;
                        const avgOrderValue = cashier.orders > 0 
                          ? (cashier.revenue / cashier.orders).toFixed(2)
                          : 0;
                        
                        return (
                          <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                            <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-white">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-semibold text-xs">
                                  {cashier.name.charAt(0).toUpperCase()}
                                </div>
                                {cashier.name}
                              </div>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                {cashier.orders} orders
                              </span>
                            </td>
                            <td className="px-4 py-4 text-sm font-semibold text-green-600 dark:text-green-400">
                              ₹{cashier.revenue.toFixed(2)}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                              ₹{avgOrderValue}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-gray-200 dark:bg-slate-700 rounded-full h-2 max-w-[100px]">
                                  <div 
                                    className="bg-gradient-to-r from-amber-500 to-amber-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${Math.min(percentOfTotal, 100)}%` }}
                                  ></div>
                                </div>
                                <span className="font-medium">{percentOfTotal}%</span>
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

            {/* Loading State */}
            {loadingOrders && (
              <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                Loading sales data...
              </div>
            )}
          </div>
        );
      case 'customers':
        const customersData = getCustomersData();
        
        return (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-xl p-6 shadow-lg">
                <div className="text-sm font-medium opacity-90">Total Customers</div>
                <div className="text-3xl font-bold mt-2">{customersData.length}</div>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg">
                <div className="text-sm font-medium opacity-90">Total Revenue</div>
                <div className="text-3xl font-bold mt-2">₹{customersData.reduce((sum, c) => sum + c.totalSpent, 0).toFixed(2)}</div>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
                <div className="text-sm font-medium opacity-90">Avg Spend/Customer</div>
                <div className="text-3xl font-bold mt-2">₹{customersData.length > 0 ? (customersData.reduce((sum, c) => sum + c.totalSpent, 0) / customersData.length).toFixed(2) : '0.00'}</div>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-6 shadow-lg">
                <div className="text-sm font-medium opacity-90">Total Orders</div>
                <div className="text-3xl font-bold mt-2">{customersData.reduce((sum, c) => sum + c.orderCount, 0)}</div>
              </div>
            </div>

            {/* Customers Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Customer Directory</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">View all your customers and their purchase history</p>
              </div>
              <div className="p-6">
                {loadingOrders ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
                  </div>
                ) : customersData.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">👥</div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Customers Yet</h3>
                    <p className="text-gray-600 dark:text-gray-400">Customer data will appear here once orders are created</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-slate-700">
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Customer Name</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Mobile Number</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Total Orders</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Total Spent</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Last Order</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                        {customersData.map((customer, idx) => (
                          <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                            <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-white">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-semibold text-xs">
                                  {customer.name.charAt(0).toUpperCase()}
                                </div>
                                {customer.name}
                              </div>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                              <div className="flex items-center gap-2">
                                <span className="text-gray-400">📱</span>
                                {customer.mobile}
                              </div>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                {customer.orderCount} {customer.orderCount === 1 ? 'order' : 'orders'}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-sm font-semibold text-green-600 dark:text-green-400">
                              ₹{customer.totalSpent.toFixed(2)}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                              {new Date(customer.lastOrderDate).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
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
              <div className="mt-4 flex flex-wrap gap-3 items-end">
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
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Cashier</label>
                  <select
                    value={filterCashier}
                    onChange={(e) => { setFilterCashier(e.target.value); setCurrentPage(1); }}
                    className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="all">All Cashiers</option>
                    {cashiers.map(cashier => (
                      <option key={cashier.id} value={cashier.id}>
                        {cashier.CashierProfile?.cashierName || cashier.email}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Orders Per Page</label>
                  <select
                    value={ordersPerPage}
                    onChange={(e) => { setOrdersPerPage(Number(e.target.value)); setCurrentPage(1); }}
                    className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={20}>20</option>
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
                  {/* Orders Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Order ID</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Customer</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Date & Time</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Items</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Cashier</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Payment</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Total</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                        {paginatedOrders.map(order => (
                          <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className="text-sm font-medium text-gray-900 dark:text-white">#{order.id}</span>
                            </td>
                            <td className="px-4 py-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{order.customerName}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">{order.customerMobile}</div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-white">{new Date(order.createdAt).toLocaleDateString()}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-900 dark:text-white">{order.orderItems.length} {order.orderItems.length === 1 ? 'item' : 'items'}</span>
                            </td>
                            <td className="px-4 py-4">
                              <span className="text-sm text-gray-900 dark:text-white">
                                {order.cashier?.CashierProfile?.cashierName || order.cashier?.email || 'N/A'}
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 capitalize">
                                {order.paymentMethod}
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-right">
                              <span className="text-sm font-bold text-amber-600 dark:text-amber-500">₹{order.total.toFixed(2)}</span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-center">
                              <button
                                onClick={() => setViewOrderModal(order)}
                                className="inline-flex items-center p-2 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 transition-colors"
                                title="View Details"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-6 flex justify-between items-center px-4">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Showing {((currentPage - 1) * ordersPerPage) + 1} to {Math.min(currentPage * ordersPerPage, filteredCount)} of {filteredCount} orders
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Previous
                        </button>
                        <span className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                          Page {currentPage} of {totalPages}
                        </span>
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

            {/* Order Details Modal */}
            <OrderDetailsModal order={viewOrderModal} onClose={() => setViewOrderModal(null)} onDownload={downloadOrderPDF} />
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

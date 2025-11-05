import React from 'react'

export default function OrderDetailsModal({ order, onClose, onDownload }) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Order #{order.id} Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Order Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Date:</span>
              <span className="ml-2 text-gray-900 dark:text-white font-medium">{new Date(order.createdAt).toLocaleString('en-IN')}</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Customer:</span>
              <span className="ml-2 text-gray-900 dark:text-white font-medium">{order.customerName || order.customerMobile || 'Walk-in'}</span>
            </div>
            {order.customerPhone && (
              <div>
                <span className="text-gray-500 dark:text-gray-400">Phone:</span>
                <span className="ml-2 text-gray-900 dark:text-white font-medium">{order.customerPhone}</span>
              </div>
            )}
            <div>
              <span className="text-gray-500 dark:text-gray-400">Payment:</span>
              <span className="ml-2 text-gray-900 dark:text-white font-medium capitalize">{order.paymentMethod}</span>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Items:</h4>
            <div className="space-y-2">
              {order.orderItems.map(item => (
                <div key={item.id} className="flex justify-between items-center text-sm bg-gray-50 dark:bg-slate-900/50 p-4 rounded-lg">
                  <div className="flex-1">
                    <div className="text-gray-900 dark:text-white font-medium">{item.productName}</div>
                    <div className="text-gray-500 dark:text-gray-400 text-xs mt-1">₹{item.price.toFixed(2)} × {item.quantity} = ₹{item.total.toFixed(2)}</div>
                  </div>
                  <span className="text-gray-700 dark:text-gray-300 font-medium">₹{item.total.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
            <div className="space-y-3">
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
              <div className="flex justify-between font-bold text-gray-900 dark:text-white text-lg pt-3 border-t border-gray-200 dark:border-slate-700">
                <span>Total:</span>
                <span>₹{order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Download PDF Button */}
          <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
            <button onClick={() => onDownload && onDownload(order)} className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Invoice PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

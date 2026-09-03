import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { Package, MapPin, LayoutGrid, List } from 'lucide-react';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState({});
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await api.get('/orders/history');
      let historyOrders = [];
      if (response.data?.success) {
        historyOrders = response.data.history;
      }
      historyOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(historyOrders);
    } catch (error) {
      toast.error('Failed to fetch order history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/30 dark:border-amber-900/50';
      case 'assigned': return 'text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950/30 dark:border-blue-900/50';
      case 'picked': return 'text-purple-600 bg-purple-50 border-purple-200 dark:text-purple-400 dark:bg-purple-950/30 dark:border-purple-900/50';
      case 'delivered': return 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/30 dark:border-emerald-900/50';
      default: return 'text-gray-600 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-900/50 dark:border-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-black transition-colors duration-300">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full transition-colors duration-300">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Order History</h1>
          <p className="text-gray-500 dark:text-gray-400">View your past deliveries</p>
        </div>
        
        {orders.length > 0 && (
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md flex items-center gap-2 text-sm font-medium transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md flex items-center gap-2 text-sm font-medium transition-all ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="card text-center py-20 px-8 flex flex-col items-center justify-center border-dashed border-2 bg-gray-50/50 dark:bg-gray-900/20">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <Package className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">No Past Orders</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-8">You haven't completed any deliveries yet. They will appear here once delivered.</p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3" : "space-y-4"}>
          {orders.map((order) => (
            <div 
              key={order._id} 
              className={`card bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-black/50 transition-all duration-300 group cursor-pointer overflow-hidden p-0 ${viewMode === 'grid' ? 'hover:-translate-y-1' : ''}`}
              onClick={(e) => {
                if (e.target.closest('button')) return;
                setExpandedOrders(prev => ({ ...prev, [order._id]: !prev[order._id] }));
              }}
            >
              <div className="p-6">
                <div className={`flex ${viewMode === 'grid' ? 'flex-col gap-5' : 'flex-col sm:flex-row sm:items-center justify-between gap-4'}`}>
                  
                  {/* Status & Date */}
                  <div className={`flex ${viewMode === 'grid' ? 'justify-between items-start w-full' : 'items-center gap-4 min-w-[200px]'}`}>
                    <div className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(order.status)}`}>
                      {order.status}
                    </div>
                    <span className="text-xs font-medium text-gray-400 bg-gray-50 dark:bg-gray-950 px-2 py-1 rounded-md border border-gray-100 dark:border-gray-800">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {/* Package Details Header */}
                  <div className={`${viewMode === 'grid' ? 'w-full' : 'flex-1 min-w-0 flex items-center justify-between'}`}>
                    <div>
                      {viewMode === 'grid' && (
                        <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1 flex justify-between items-center group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors">
                          Package Details
                          <span className="text-xs font-normal opacity-0 group-hover:opacity-100 transition-opacity">Click to {expandedOrders[order._id] ? 'collapse' : 'expand'}</span>
                        </h4>
                      )}
                      <p className={`text-gray-900 dark:text-white font-medium truncate ${viewMode === 'grid' ? 'text-base pr-4' : 'text-sm'}`}>
                        {viewMode === 'list' && (
                          <span className="text-gray-500 dark:text-gray-400 mr-2 font-normal hidden md:inline">Package:</span>
                        )}
                        {order.packageDetails}
                      </p>
                    </div>
                    
                    {viewMode === 'list' && (
                      <span className="text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-md ml-4 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap hidden sm:block">
                        {expandedOrders[order._id] ? 'Collapse' : 'Expand'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Expandable Details Container */}
                {expandedOrders[order._id] && (
                  <div id={`details-${order._id}`} className="space-y-4 pt-4 mt-4 border-t border-gray-100 dark:border-gray-800 animate-in fade-in slide-in-from-top-2 duration-200">
                    
                    <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
                      <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 border-b border-gray-200 dark:border-gray-800 pb-2">Full Description</h5>
                      <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">
                        {order.packageDetails}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <div className="w-0.5 h-6 bg-gray-300 dark:bg-gray-700"></div>
                        <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                      </div>
                      <div className="flex-1 space-y-3">
                        <p className="text-gray-700 dark:text-gray-300 flex flex-col">
                          <span className="text-xs text-gray-500 dark:text-gray-500 mb-0.5">Pickup</span>
                          <span className="font-medium text-gray-900 dark:text-white mb-1">{order.pickupAddress || 'Address not provided'}</span>
                        </p>
                        <p className="text-gray-700 dark:text-gray-300 flex flex-col">
                          <span className="text-xs text-gray-500 dark:text-gray-500 mb-0.5">Dropoff</span>
                          <span className="font-medium text-gray-900 dark:text-white mb-1">{order.dropAddress || 'Address not provided'}</span>
                        </p>
                      </div>
                    </div>
                    
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;

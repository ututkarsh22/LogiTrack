import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { MapPin, Package, ArrowRight, Loader2 } from 'lucide-react';

const CreateOrder = () => {
  const [formData, setFormData] = useState({
    pickupLocation: '',
    dropLocation: '',
    packageDetails: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const payload = {
      pickupLocation: formData.pickupLocation,
      dropLocation: formData.dropLocation,
      packageDetails: formData.packageDetails
    };

    try {
      const response = await api.post('/orders/take-order', payload);
      if (response.data.success) {
        toast.success('Order created successfully! OTP generated.');
        navigate('/customer/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create New Order</h1>
        <p className="text-gray-500 dark:text-gray-400">Enter pickup details to find nearby agents</p>
      </div>

      <div className="card max-w-2xl mx-auto p-8 md:p-10 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-black/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
        <form onSubmit={handleSubmit} className="space-y-10">
          
          {/* Pickup Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center text-red-600 dark:text-red-400">1</div>
              Pickup Location
            </h3>
            
            <div className="relative">
              <MapPin className="absolute left-4 top-3.5 h-5 w-5 text-red-500" />
              <input
                type="text"
                name="pickupLocation"
                placeholder="Enter pickup address (e.g., 123 Main St, NY)"
                value={formData.pickupLocation}
                onChange={handleChange}
                className="input-field pl-12 bg-gray-50/50 dark:bg-gray-950/50 hover:bg-white dark:hover:bg-gray-900 focus:bg-white dark:focus:bg-gray-900 transition-colors"
                required
              />
            </div>
          </div>

          <div className="relative flex items-center justify-center -my-6 z-10">
            <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-center">
              <div className="h-4 w-0.5 bg-gray-300 dark:bg-gray-700"></div>
            </div>
          </div>

          {/* Drop Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center text-orange-600 dark:text-orange-400">2</div>
              Drop Location
            </h3>
            
            <div className="relative">
              <MapPin className="absolute left-4 top-3.5 h-5 w-5 text-orange-500" />
              <input
                type="text"
                name="dropLocation"
                placeholder="Enter drop address (e.g., 456 Post Ave, NY)"
                value={formData.dropLocation}
                onChange={handleChange}
                className="input-field pl-12 bg-gray-50/50 dark:bg-gray-950/50 hover:bg-white dark:hover:bg-gray-900 focus:bg-white dark:focus:bg-gray-900 transition-colors"
                required
              />
            </div>
          </div>

          <div className="h-px bg-gray-100 dark:bg-gray-800 w-full" />

          {/* Package Details */}
          <div className="space-y-5">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-700 dark:text-gray-300 font-mono text-sm">3</div>
              Package Info
            </h3>
            
            <div className="relative">
              <Package className="absolute left-4 top-4 h-5 w-5 text-gray-400 dark:text-gray-500" />
              <textarea
                name="packageDetails"
                placeholder="Describe your package (size, weight, contents, fragile etc.)"
                value={formData.packageDetails}
                onChange={handleChange}
                className="input-field pl-12 min-h-[120px] resize-y bg-gray-50/50 dark:bg-gray-950/50 hover:bg-white dark:hover:bg-gray-900 focus:bg-white dark:focus:bg-gray-900 transition-colors"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary group flex items-center justify-center gap-2 py-4 text-lg shadow-xl shadow-red-600/20 active:shadow-sm"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Finding Nearest Agents...
              </>
            ) : (
              <>
                Request Rapid Delivery
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateOrder;

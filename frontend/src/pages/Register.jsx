import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { Mail, Lock, User, Briefcase, ArrowRight, Package } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer'
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/auth/register', formData);
      if (response.data.success) {
        toast.success(response.data.message);
        navigate('/login');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex relative overflow-hidden bg-white dark:bg-black transition-colors duration-300">
      {/* Left panel: Image and Brand */}
      <div className="hidden lg:flex w-1/2 relative bg-gray-900 overflow-hidden items-center justify-center">
        <div className="absolute inset-0">
          <img src="/bg-logistics.png" alt="Logistics Background" className="w-full h-full object-cover opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
        </div>
        
        <div className="relative z-10 text-center text-white px-12">
          <div className="flex justify-center mb-8">
            <div className="p-5 bg-red-600/20 rounded-2xl backdrop-blur-md border border-red-500/30 shadow-2xl">
              <Package className="w-16 h-16 text-red-500" />
            </div>
          </div>
          <h2 className="text-4xl font-bold mb-6 tracking-tight">Join LogiTrack</h2>
          <p className="text-lg text-gray-300 max-w-md mx-auto leading-relaxed">
            Create an account today to experience next-generation logistics and reliable deliveries at your fingertips.
          </p>
        </div>
      </div>

      {/* Right panel: Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 relative bg-gray-50 dark:bg-black">
        {/* Subtle background decoration for right side */}
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-red-600/10 dark:bg-red-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-orange-600/10 dark:bg-orange-600/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          {/* Logo for mobile */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="p-3 bg-red-600/10 rounded-xl">
              <Package className="w-8 h-8 text-red-600" />
            </div>
            <span className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">LogiTrack</span>
          </div>

          <div className="mb-8 text-center lg:text-left">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create Account</h1>
            <p className="text-gray-500 dark:text-gray-400">Join our growing community today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative group">
              <User className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 dark:text-gray-500 group-focus-within:text-red-500 transition-colors" />
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                className="input-field pl-12 h-12"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="relative group">
              <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 dark:text-gray-500 group-focus-within:text-red-500 transition-colors" />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                className="input-field pl-12 h-12"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="relative group">
              <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 dark:text-gray-500 group-focus-within:text-red-500 transition-colors" />
              <input
                type="password"
                name="password"
                placeholder="Password"
                className="input-field pl-12 h-12"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 dark:text-gray-500 group-focus-within:text-red-500 transition-colors" />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                className="input-field pl-12 h-12"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <div className="relative group">
              <Briefcase className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 dark:text-gray-500 group-focus-within:text-red-500 transition-colors" />
              <select
                name="role"
                className="input-field pl-12 h-12 appearance-none"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="customer" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">Customer</option>
                <option value="agent" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">Delivery Agent</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary group flex items-center justify-center gap-2 h-12 text-lg shadow-lg shadow-red-600/20 mt-6"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
              {!loading && <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <p className="mt-8 text-center text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-semibold transition-colors">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

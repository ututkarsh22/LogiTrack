import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, ShieldCheck, LayoutDashboard, Zap, ArrowRight, Github, Linkedin, Mail } from 'lucide-react';

const Landing = () => {
  const features = [
    {
      icon: <Truck className="w-6 h-6 text-red-600" />,
      title: 'Real-time Tracking',
      description: 'Monitor your shipments and delivery routes in real-time with an interactive map interface.'
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-red-600" />,
      title: 'Secure OTP Auth',
      description: 'Ensure secure deliveries with our robust OTP-based authentication system for customers.'
    },
    {
      icon: <LayoutDashboard className="w-6 h-6 text-red-600" />,
      title: 'Management Dashboard',
      description: 'A comprehensive dashboard for effortless order management and tracking history.'
    },
    {
      icon: <Zap className="w-6 h-6 text-red-600" />,
      title: 'Instant Dispatch',
      description: 'Assigns the nearest delivery agent in seconds for lightning-fast, hyper-local fulfillment.'
    }
  ];

  const developers = [
    {
      name: 'Aditya Verma',
      role: 'Backend Developer',
      avatar: 'AV',
      color: 'bg-blue-600',
      description: 'Architecting robust APIs, managing database schemas, and ensuring scalable system infrastructure.',
      links: { github: '#', linkedin: '#' }
    },
    {
      name: 'Utkarsh Trivedi',
      role: 'Frontend Developer',
      avatar: 'UT',
      color: 'bg-green-600',
      description: 'Crafting responsive user interfaces, implementing dynamic web designs, and optimizing client-side performance.',
      links: { github: '#', linkedin: '#' }
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 transition-colors duration-300">
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-red-600/5 dark:bg-red-600/10 rounded-l-full blur-[120px] pointer-events-none transform translate-x-1/3 -translate-y-1/4" />
        <div className="absolute bottom-0 left-0 w-1/2 h-full bg-orange-600/5 dark:bg-orange-600/10 rounded-r-full blur-[120px] pointer-events-none transform -translate-x-1/3 translate-y-1/4" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* Value Proposition */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-semibold mb-6 border border-red-100 dark:border-red-900/30">
                <Zap className="w-4 h-4" />
                <span>Hyper-Local Delivery</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 text-gray-900 dark:text-white leading-tight">
                Rapid City Deliveries <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500">Made Simple</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                LogiTrack is your platform for instant, reliable short-distance deliveries. Experience blazing fast assignments and real-time tracking for quick local orders.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/register" className="btn-primary sm:w-auto flex items-center justify-center gap-2 text-base px-8 py-3.5 shadow-lg shadow-red-600/30">
                  Get Started
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/login" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium rounded-xl px-8 py-3.5 flex items-center justify-center transition-all duration-200 text-base sm:w-auto">
                  Sign In
                </Link>
              </div>
            </div>

            {/* Illustration */}
            <div className="relative">
              <div className="aspect-square md:aspect-video lg:aspect-square relative rounded-3xl overflow-hidden shadow-2xl shadow-red-900/20 border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm p-4">
                <img 
                  src="/hero-saas.png" 
                  alt="LogiTrack Dashboard Illustration" 
                  className="w-full h-full object-cover rounded-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white dark:bg-gray-950 border-y border-gray-100 dark:border-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Everything you need to scale</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Powerful tools designed to simplify your logistics operations, giving you absolute control and visibility over every delivery.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-8 hover:-translate-y-1 hover:shadow-xl hover:shadow-red-600/5 transition-all duration-300">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-xl flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Us / Mission Section */}
      <section id="about" className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-red-50 dark:bg-red-950/20 -skew-y-3 transform origin-top-left -z-10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6">Our Mission</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
              We are dedicated to <strong className="text-red-600 dark:text-red-400">simplifying hyper-local logistics</strong> for businesses and individuals alike. Our goal is to build a fast, secure, and highly efficient network for rapid short-distance deliveries that you can count on.
            </p>
          </div>

          {/* Developers */}
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-12">Meet the Developers</h3>
            <div className="grid md:grid-cols-2 gap-10 max-w-4xl mx-auto">
              {developers.map((dev, index) => (
                <div key={index} className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                  <div className={`w-20 h-20 ${dev.color} rounded-full flex items-center justify-center text-white text-2xl font-bold mb-6 shadow-inner`}>
                    {dev.avatar}
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{dev.name}</h4>
                  <p className="text-red-600 dark:text-red-400 font-medium text-sm mb-4">{dev.role}</p>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 flex-grow">{dev.description}</p>
                  <div className="flex gap-4">
                    <a href={dev.links.github} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                      <Github className="w-5 h-5" />
                    </a>
                    <a href={dev.links.linkedin} className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      <Linkedin className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Truck className="h-6 w-6 text-red-500" />
                <span className="text-xl font-bold text-white tracking-tight">Logi<span className="text-red-500">Track</span></span>
              </div>
              <p className="text-gray-400 max-w-sm">
                Next-generation logistics and tracking platform for modern businesses.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#about" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
                <li><Link to="/login" className="text-gray-400 hover:text-white transition-colors">Login</Link></li>
                <li><Link to="/register" className="text-gray-400 hover:text-white transition-colors">Register</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-2">
                <li>
                  <a href="mailto:contact@logitrack.com" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                    <Mail className="w-4 h-4" /> contact@logitrack.com
                  </a>
                </li>
                <li className="flex gap-4 mt-4">
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <Github className="w-5 h-5" />
                  </a>
                  <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                    <Linkedin className="w-5 h-5" />
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} LogiTrack. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

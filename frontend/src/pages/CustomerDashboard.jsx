import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { Package, MapPin, Loader2, Navigation, Headphones, CheckCircle2, Truck, Box, ChevronRight, Lock, IndianRupee } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Custom marker icons
const pickupIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const dropIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const agentIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to control map view when selected order changes
const MapController = ({ selectedOrder, activeMapOrder }) => {
  const map = useMap();

  useEffect(() => {
    if (selectedOrder?.pickupLocation && selectedOrder?.dropLocation) {
      const bounds = L.latLngBounds(
        [selectedOrder.pickupLocation.lat, selectedOrder.pickupLocation.lng],
        [selectedOrder.dropLocation.lat, selectedOrder.dropLocation.lng]
      );
      map.flyToBounds(bounds, { padding: [50, 50], maxZoom: 14, duration: 1.2 });
    } else if (activeMapOrder?.agent?.location) {
      map.flyTo([activeMapOrder.agent.location.lat, activeMapOrder.agent.location.lng], 14, { duration: 1.2 });
    }
  }, [selectedOrder, activeMapOrder, map]);

  return null;
};

// Component to fetch and display route from OSRM
const RouteLayer = ({ pickup, drop }) => {
  const [routeCoords, setRouteCoords] = useState([]);

  useEffect(() => {
    if (!pickup || !drop) {
      setRouteCoords([]);
      return;
    }

    const fetchRoute = async () => {
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${pickup.lng},${pickup.lat};${drop.lng},${drop.lat}?overview=full&geometries=geojson`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.routes && data.routes.length > 0) {
          const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]); // [lng,lat] -> [lat,lng]
          setRouteCoords(coords);
        } else {
          // Fallback: straight line
          setRouteCoords([[pickup.lat, pickup.lng], [drop.lat, drop.lng]]);
        }
      } catch {
        // Fallback: straight line
        setRouteCoords([[pickup.lat, pickup.lng], [drop.lat, drop.lng]]);
      }
    };

    fetchRoute();
  }, [pickup, drop]);

  if (routeCoords.length === 0) return null;

  return (
    <>
      {/* Shadow / glow line underneath */}
      <Polyline
        positions={routeCoords}
        pathOptions={{ color: '#93c5fd', weight: 10, opacity: 0.4, lineCap: 'round', lineJoin: 'round' }}
      />
      {/* Main route line */}
      <Polyline
        positions={routeCoords}
        pathOptions={{ color: '#2563eb', weight: 5, opacity: 0.85, lineCap: 'round', lineJoin: 'round' }}
      />
    </>
  );
};

const CustomerDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Order Creation State
  const [formData, setFormData] = useState({
    pickupLocation: '',
    dropLocation: '',
    packageCategory: 'Medium' // Default matching the UI
  });
  const [creatingOrder, setCreatingOrder] = useState(false);

  // Fare Calculation State
  const [fareData, setFareData] = useState(null); // { distanceKm, fare }
  const [calculatingFare, setCalculatingFare] = useState(false);

  // Map Route State - tracks which order's route to display
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  // Reset fare when addresses change
  useEffect(() => {
    setFareData(null);
  }, [formData.pickupLocation, formData.dropLocation]);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders/all-orders');
      let allOrders = [];
      if (response.data?.success) {
        // Exclude delivered logic to focus entirely on active tasks for this view
        allOrders = response.data.order.filter(o => o.status !== 'delivered');
      }
      allOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(allOrders);
    } catch (error) {
      toast.error('Failed to fetch active orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateFare = async () => {
    if (!formData.pickupLocation || !formData.dropLocation) {
      return toast.error("Please fill in both pickup and drop locations");
    }
    setCalculatingFare(true);
    setFareData(null);
    try {
      const response = await api.post('/orders/calculate-fare', {
        pickupLocation: formData.pickupLocation,
        dropLocation: formData.dropLocation,
      });
      if (response.data.success) {
        setFareData({
          distanceKm: response.data.distanceKm,
          fare: response.data.fare,
        });
        toast.success('Fare calculated!');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to calculate fare');
    } finally {
      setCalculatingFare(false);
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!formData.pickupLocation || !formData.dropLocation) {
      return toast.error("Please fill in both pickup and drop locations");
    }
    setCreatingOrder(true);
    try {
      const payload = {
        pickupLocation: formData.pickupLocation,
        dropLocation: formData.dropLocation,
        packageDetails: `[${formData.packageCategory}] Standard Shipping Request`
      };
      const response = await api.post('/orders/take-order', payload);
      if (response.data.success) {
        toast.success('Order created successfully!');
        // Show the newly created order's route on map
        setSelectedOrder(response.data.order);
        setFormData({ pickupLocation: '', dropLocation: '', packageCategory: 'Medium' });
        setFareData(null);
        // Refresh active orders immediately
        fetchOrders();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create order');
    } finally {
      setCreatingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)] bg-gray-50/50 dark:bg-black transition-colors duration-300">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  // Find the first tracking-eligible order for the map
  const activeMapOrder = orders.find(o => (o.status === 'picked' || o.status === 'in-transit') && o.agent?.location);

  return (
    <div className="flex-1 bg-gray-50/50 dark:bg-[#0a0f18] transition-colors duration-300 font-sans">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column - Dispatch Center Form */}
          <div className="lg:col-span-4 flex flex-col">
            <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-8 md:p-10 shadow-sm border border-gray-100/80 dark:border-gray-800">
              <p className="text-[10px] font-bold text-orange-600 dark:text-orange-500 tracking-widest uppercase mb-2">DISPATCH CENTER</p>
              <h2 className="text-[28px] font-bold text-gray-900 dark:text-white mb-8 tracking-tight">New Order</h2>

              <form onSubmit={handleCreateOrder} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">PICKUP ADDRESS</label>
                  <input 
                    type="text" 
                    value={formData.pickupLocation} 
                    onChange={(e) => setFormData({...formData, pickupLocation: e.target.value})} 
                    className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-xl px-5 py-4 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/40 transition-all placeholder:text-gray-400 font-sans" 
                    placeholder="123 Architecture Way, Metro" 
                    required 
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">DROP-OFF DESTINATION</label>
                  <input 
                    type="text" 
                    value={formData.dropLocation} 
                    onChange={(e) => setFormData({...formData, dropLocation: e.target.value})} 
                    className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-xl px-5 py-4 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/40 transition-all placeholder:text-gray-400 font-sans" 
                    placeholder="888 Kinetic Blvd, Harbor Side" 
                    required 
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">PACKAGE CATEGORY</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'Small', icon: Package, label: 'SMALL' },
                      { id: 'Medium', icon: Box, label: 'MEDIUM' },
                      { id: 'Large', icon: Truck, label: 'LARGE' }
                    ].map((cat) => (
                      <button 
                        type="button" 
                        key={cat.id} 
                        onClick={() => setFormData({...formData, packageCategory: cat.id})} 
                        className={`flex flex-col items-center justify-center py-5 rounded-xl border transition-all duration-300 ${formData.packageCategory === cat.id ? 'bg-[#0f172a] border-[#0f172a] text-white shadow-xl shadow-slate-900/10' : 'bg-gray-50/50 dark:bg-gray-950 border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900'}`}
                      >
                        <cat.icon className="h-6 w-6 mb-2" strokeWidth={1.5} />
                        <span className="text-[10px] font-bold tracking-widest">{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-6 space-y-3">
                  <button 
                    type="submit" 
                    disabled={creatingOrder} 
                    className="w-full bg-[#ea580c] hover:bg-[#d04e0a] text-white font-bold tracking-widest uppercase text-sm py-4 rounded-xl shadow-[0_8px_20px_-6px_rgba(234,88,12,0.4)] transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    {creatingOrder ? <Loader2 className="h-5 w-5 animate-spin"/> : 'BOOK NOW'}
                  </button>
                  <button 
                    type="button"
                    onClick={handleCalculateFare}
                    disabled={calculatingFare}
                    className="w-full bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 font-bold tracking-widest uppercase text-sm py-4 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    {calculatingFare ? <Loader2 className="h-5 w-5 animate-spin"/> : 'CALCULATE FARE'}
                  </button>
                </div>

                {/* Fare Result Display */}
                {fareData && (
                  <div className="mt-2 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-5 animate-[fadeIn_0.3s_ease-out]">
                    <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 tracking-widest uppercase mb-3">FARE ESTIMATE</p>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium mb-1">Distance</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{fareData.distanceKm} km</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium mb-1">Estimated Cost</p>
                        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 justify-end">
                          <IndianRupee className="h-5 w-5" strokeWidth={2.5} />
                          {fareData.fare}
                        </p>
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-3 font-medium">Rate: ₹10 per km • Rounded to nearest rupee</p>
                  </div>
                )}
              </form>
            </div>

            {/* Support Card Highlight */}
            <div className="bg-[#0f172a] rounded-[2rem] p-8 mt-6 relative overflow-hidden flex items-center shadow-xl">
              <div className="relative z-10">
                <p className="text-[10px] font-bold text-blue-300 tracking-widest uppercase mb-2">SUPPORT ACTIVE</p>
                <h3 className="text-xl font-bold text-white tracking-tight">24/7 Logistics Help</h3>
              </div>
              <Headphones className="absolute right-6 -bottom-4 h-24 w-24 text-blue-500/20 -rotate-12" />
            </div>
          </div>

          {/* Right Column - Map & Active Orders List */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            
            {/* Map Tracking Area */}
            <div className="h-[400px] md:h-[480px] w-full bg-gray-200 dark:bg-gray-800 rounded-[2rem] overflow-hidden relative shadow-sm border border-gray-100 dark:border-gray-800/80">
              {/* Overlay Badges */}
              <div className="absolute top-6 left-6 z-[400] bg-[#0f172a] text-white text-[10px] font-bold px-4 py-2.5 rounded-full flex items-center gap-2 shadow-lg tracking-widest">
                <div className={`w-2 h-2 rounded-full ${selectedOrder || activeMapOrder ? 'bg-orange-500 animate-pulse' : 'bg-gray-500'}`}></div>
                {selectedOrder ? 'ORDER ROUTE' : activeMapOrder ? 'LIVE TRACKING' : 'MAP VIEW'}
              </div>

              {/* Selected order route info badge */}
              {selectedOrder && (
                <div className="absolute top-6 right-6 z-[400] flex items-center gap-2">
                  <div className="bg-white dark:bg-gray-900 text-[10px] font-bold px-4 py-2.5 rounded-full flex items-center gap-2 shadow-lg tracking-widest border border-gray-100 dark:border-gray-800">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-gray-700 dark:text-gray-300">PICKUP</span>
                    <span className="text-gray-300 dark:text-gray-600">→</span>
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span className="text-gray-700 dark:text-gray-300">DROP</span>
                  </div>
                  <button 
                    onClick={() => setSelectedOrder(null)}
                    className="bg-white dark:bg-gray-900 text-gray-500 hover:text-gray-900 dark:hover:text-white text-[10px] font-bold px-3 py-2.5 rounded-full shadow-lg border border-gray-100 dark:border-gray-800 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              )}

              {activeMapOrder && activeMapOrder.agent && !selectedOrder && (
                <div className="absolute bottom-6 left-6 z-[400] bg-white dark:bg-gray-900 rounded-2xl p-3 pr-4 shadow-2xl shadow-black/10 flex items-center gap-4 border border-gray-50 dark:border-gray-800 min-w-[280px]">
                  <div className="h-12 w-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 overflow-hidden border border-white dark:border-gray-800 shadow-sm flex items-center justify-center flex-shrink-0">
                    <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${activeMapOrder.agent.user?.name || 'Agent'}`} alt="Agent" className="h-[120%] w-[120%] object-cover mt-2" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white capitalize">{activeMapOrder.agent.user?.name || 'Agent Courier'}</h4>
                    <p className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1.5 tracking-widest mt-1">
                      IN TRANSIT <span className="text-gray-300 dark:text-gray-600 font-normal">•</span> EN ROUTE
                    </p>
                  </div>
                  <button className="h-10 w-10 bg-[#0f172a] hover:bg-[#1e293b] rounded-xl flex flex-shrink-0 items-center justify-center text-white transition-colors shadow-md active:scale-95">
                    <Navigation className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Selected order route info card */}
              {selectedOrder && (
                <div className="absolute bottom-6 left-6 z-[400] bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-2xl shadow-black/10 border border-gray-50 dark:border-gray-800 min-w-[280px]">
                  <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 tracking-widest uppercase mb-2">ROUTE • #{selectedOrder._id?.substring(0,6).toUpperCase()}</p>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white dark:border-gray-900 shadow"></div>
                      <div className="w-0.5 h-4 bg-blue-300 dark:bg-blue-700"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white dark:border-gray-900 shadow"></div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <p className="font-medium text-gray-900 dark:text-white truncate text-[11px]">{selectedOrder.pickupAddress || 'Pickup'}</p>
                      <p className="font-medium text-gray-900 dark:text-white truncate text-[11px]">{selectedOrder.dropAddress || 'Drop-off'}</p>
                    </div>
                  </div>
                  {selectedOrder.fare > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-gray-400 tracking-widest">FARE</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-0.5">
                        <IndianRupee className="h-3 w-3" strokeWidth={2.5} />{selectedOrder.fare}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Map Instantiation - Default: India (Delhi) */}
              <MapContainer 
                center={[20.5937, 78.9629]} 
                zoom={5} 
                scrollWheelZoom={true}
                zoomControl={false}
                className="h-full w-full"
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                />

                {/* Map controller for auto-panning */}
                <MapController selectedOrder={selectedOrder} activeMapOrder={activeMapOrder} />

                {/* Route polyline for selected order */}
                {selectedOrder?.pickupLocation && selectedOrder?.dropLocation && (
                  <RouteLayer pickup={selectedOrder.pickupLocation} drop={selectedOrder.dropLocation} />
                )}

                {/* Pickup marker */}
                {selectedOrder?.pickupLocation && (
                  <Marker position={[selectedOrder.pickupLocation.lat, selectedOrder.pickupLocation.lng]} icon={pickupIcon}>
                    <Popup className="font-sans font-bold text-xs shadow-xl tracking-wider">
                      <span className="text-green-600">📍 Pickup</span><br/>{selectedOrder.pickupAddress || 'Pickup Location'}
                    </Popup>
                  </Marker>
                )}

                {/* Drop marker */}
                {selectedOrder?.dropLocation && (
                  <Marker position={[selectedOrder.dropLocation.lat, selectedOrder.dropLocation.lng]} icon={dropIcon}>
                    <Popup className="font-sans font-bold text-xs shadow-xl tracking-wider">
                      <span className="text-red-600">📍 Drop-off</span><br/>{selectedOrder.dropAddress || 'Drop Location'}
                    </Popup>
                  </Marker>
                )}

                {/* Agent location marker (when tracking) */}
                {activeMapOrder?.agent?.location && !selectedOrder && (
                  <Marker position={[activeMapOrder.agent.location.lat, activeMapOrder.agent.location.lng]} icon={agentIcon}>
                    <Popup className="font-sans font-bold text-xs shadow-xl tracking-wider">Courier Location</Popup>
                  </Marker>
                )}
              </MapContainer>
            </div>

            {/* Active Orders List Section */}
            <div className="flex flex-col">
              <div className="flex items-end justify-between mb-6 px-1">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-1">ARCHIVE</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Active Orders</h3>
                </div>
                <button className="text-[10px] font-bold text-[#ea580c] hover:text-[#c24106] tracking-widest uppercase transition-colors">
                  VIEW ALL ORDERS
                </button>
              </div>

              {orders.length === 0 ? (
                <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-12 text-center border border-gray-100 dark:border-gray-800/80 shadow-sm flex flex-col items-center">
                  <div className="h-16 w-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    <Package className="h-8 w-8 text-gray-300 dark:text-gray-600" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No active deliveries</h4>
                  <p className="text-sm text-gray-500">Submit a new request from the dispatch center to get started.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div 
                      key={order._id} 
                      onClick={() => setSelectedOrder(selectedOrder?._id === order._id ? null : order)}
                      className={`bg-white dark:bg-gray-900 rounded-[1.25rem] p-5 sm:px-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer ${selectedOrder?._id === order._id ? 'border-blue-500 dark:border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-100 dark:border-gray-800/50'}`}
                    >
                      <div className="flex items-center justify-between gap-4 sm:gap-6">
                        {/* Left: Icon & Title */}
                        <div className="flex items-center gap-4 sm:gap-5 min-w-[200px]">
                          <div className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${order.status === 'delivered' ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400' : 'bg-orange-100/50 dark:bg-orange-500/10 text-[#ea580c] group-hover:bg-[#ea580c] group-hover:text-white'}`}>
                            {order.status === 'delivered' ? <CheckCircle2 className="h-5 w-5" strokeWidth={2.5}/> : <Truck className="h-5 w-5" strokeWidth={2.5}/>}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                              #{order._id.substring(0,6).toUpperCase()}
                            </h4>
                            <p className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${order.status === 'pending' || order.status === 'assigned' ? 'text-[#ea580c]' : 'text-gray-500'}`}>
                              {order.status === 'pending' || order.status === 'assigned' ? 'PREPARING' : order.status} 
                              <span className="text-gray-300 dark:text-gray-600 font-normal mt-0.5">•</span> 
                              {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          </div>
                        </div>

                        {/* Middle: Destination */}
                        <div className="hidden lg:block flex-1 min-w-0 pr-8">
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">DESTINATION</p>
                          <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                            {order.dropAddress || 'Address not provided'}
                          </p>
                        </div>

                        {/* Right: Amount & Action */}
                        <div className="flex items-center gap-6">
                          <div className="text-right hidden sm:block">
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">AMOUNT</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-0.5 justify-end">
                              <IndianRupee className="h-3.5 w-3.5" strokeWidth={2.5} />
                              {order.fare || 0}
                            </p>
                          </div>
                          <div className="text-gray-300 dark:text-gray-600 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                            <ChevronRight className="h-5 w-5" />
                          </div>
                        </div>
                      </div>

                      {/* OTP Display Section */}
                      {order.status === 'assigned' && order.pickupOtp && (
                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800/50 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                              <Lock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">PICKUP OTP</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Share with agent at pickup</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {String(order.pickupOtp).split('').map((digit, i) => (
                              <span key={i} className="inline-flex items-center justify-center h-9 w-8 rounded-lg bg-[#0f172a] text-white text-sm font-bold tracking-wider shadow-sm">
                                {digit}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {(order.status === 'picked' || order.status === 'in-transit') && order.deliverOtp && (
                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800/50 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                              <Lock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">DELIVERY OTP</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Share with agent at drop-off</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {String(order.deliverOtp).split('').map((digit, i) => (
                              <span key={i} className="inline-flex items-center justify-center h-9 w-8 rounded-lg bg-[#0f172a] text-white text-sm font-bold tracking-wider shadow-sm">
                                {digit}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;

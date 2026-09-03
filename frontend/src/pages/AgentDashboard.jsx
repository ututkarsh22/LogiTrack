import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { MapPin, Loader2, Navigation, Package, Target, CheckCircle2, Radar, IndianRupee } from 'lucide-react';
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

const agentMarkerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to control map view
const AgentMapController = ({ agentLocation, assignedOrder }) => {
  const map = useMap();

  useEffect(() => {
    if (assignedOrder?.pickupLocation && assignedOrder?.dropLocation) {
      // If we have an order, fit bounds to show pickup, drop, and agent
      const points = [
        [assignedOrder.pickupLocation.lat, assignedOrder.pickupLocation.lng],
        [assignedOrder.dropLocation.lat, assignedOrder.dropLocation.lng],
      ];
      if (agentLocation?.lat && agentLocation?.lng) {
        points.push([agentLocation.lat, agentLocation.lng]);
      }
      const bounds = L.latLngBounds(points);
      map.flyToBounds(bounds, { padding: [60, 60], maxZoom: 14, duration: 1.2 });
    } else if (agentLocation?.lat && agentLocation?.lng) {
      map.flyTo([agentLocation.lat, agentLocation.lng], 14, { duration: 1.2 });
    }
  }, [assignedOrder, agentLocation, map]);

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
          const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
          setRouteCoords(coords);
        } else {
          setRouteCoords([[pickup.lat, pickup.lng], [drop.lat, drop.lng]]);
        }
      } catch {
        setRouteCoords([[pickup.lat, pickup.lng], [drop.lat, drop.lng]]);
      }
    };

    fetchRoute();
  }, [pickup, drop]);

  if (routeCoords.length === 0) return null;

  return (
    <>
      <Polyline
        positions={routeCoords}
        pathOptions={{ color: '#93c5fd', weight: 10, opacity: 0.4, lineCap: 'round', lineJoin: 'round' }}
      />
      <Polyline
        positions={routeCoords}
        pathOptions={{ color: '#2563eb', weight: 5, opacity: 0.85, lineCap: 'round', lineJoin: 'round' }}
      />
    </>
  );
};

const AgentDashboard = () => {
  const [locationStr, setLocationStr] = useState('');
  const [agentStatus, setAgentStatus] = useState(null);
  const [assignedOrder, setAssignedOrder] = useState(null);

  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  const [pickupOtp, setPickupOtp] = useState('');
  const [deliveryOtp, setDeliveryOtp] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [verifyingDeliveryOtp, setVerifyingDeliveryOtp] = useState(false);

  const [detailsExpanded, setDetailsExpanded] = useState(false);

  // ✅ NEW: prevent flicker
  const [initialLoading, setInitialLoading] = useState(true);

  // ✅ Fetch agent + order
  const getAgentStatus = async () => {
    try {
      const res = await api.get('agent/status');

      if (res.data.success) {
        const agent = res.data.agent;
        setAgentStatus(agent);

        if (agent.orderId) {
          if (typeof agent.orderId === 'object') {
            setAssignedOrder(agent.orderId);
          } else {
            const orderRes = await api.get(`/order/${agent.orderId}`);
            setAssignedOrder(orderRes.data.order);
          }
        } else {
          setAssignedOrder(null);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch agent status');
    } finally {
      setInitialLoading(false); // 🔥 FIX
    }
  };

  useEffect(() => {
    getAgentStatus();
  }, []);

  // ✅ Pickup OTP
  const verifyOtpSubmit = async (e) => {
    e.preventDefault();

    if (pickupOtp.length !== 4) {
      toast.error('Enter 4-digit OTP');
      return;
    }

    setVerifyingOtp(true);
    try {
      const res = await api.post('/agent/verify-pickup-otp', {
        orderId: assignedOrder?._id,
        otp: pickupOtp
      });

      if (res.data.success) {
        toast.success(res.data.message);
        setAssignedOrder(res.data.order);
        setPickupOtp('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setVerifyingOtp(false);
    }
  };

  // ✅ Delivery OTP
  const verifyDeliveryOtpSubmit = async (e) => {
    e.preventDefault();

    if (deliveryOtp.length !== 4) {
      toast.error('Enter 4-digit OTP');
      return;
    }

    setVerifyingDeliveryOtp(true);
    try {
      const res = await api.post('/agent/verify-delivery-otp', {
        orderId: assignedOrder?._id,
        otp: deliveryOtp
      });

      if (res.data.success) {
        toast.success(res.data.message);
        setAssignedOrder(null);
        setPickupOtp('');
        setDeliveryOtp('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setVerifyingDeliveryOtp(false);
    }
  };

  // ✅ Update location
  const updateLocation = async (e, coords = null) => {
    if (e) e.preventDefault();

    if (!coords && !locationStr.trim()) {
      toast.error('Enter location');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/agent/location', {
        location: coords || locationStr
      });

      if (res.data.success) {
        toast.success('Location synced');
        if (res.data.agent) {
          setAgentStatus(res.data.agent);
        }

        if (res.data.assignedOrder) {
          setAssignedOrder(res.data.assignedOrder);
          toast.success('New order assigned!');
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  // ✅ LOADING SCREEN (NO FLICKER)
  if (initialLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  // Get status label and color
  const getStatusInfo = (status) => {
    switch (status) {
      case 'assigned': return { label: 'PICKUP PENDING', color: 'text-orange-600 bg-orange-100 dark:bg-orange-500/10 dark:text-orange-400' };
      case 'picked': return { label: 'EN ROUTE', color: 'text-blue-600 bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400' };
      case 'in-transit': return { label: 'IN TRANSIT', color: 'text-purple-600 bg-purple-100 dark:bg-purple-500/10 dark:text-purple-400' };
      default: return { label: status?.toUpperCase(), color: 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400' };
    }
  };

  return (
    <div className="flex-1 w-full">

      {/* ✅ ORDER UI */}
      {assignedOrder ? (
        <div className="w-full flex flex-col lg:flex-row h-[calc(100vh-64px)]">

          {/* MAP */}
          <div className="flex-1 bg-gray-100 dark:bg-gray-900 relative overflow-hidden">
            {/* Overlay Badges */}
            <div className="absolute top-6 left-6 z-[400] bg-[#0f172a] text-white text-[10px] font-bold px-4 py-2.5 rounded-full flex items-center gap-2 shadow-lg tracking-widest">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
              DELIVERY ROUTE
            </div>

            {/* Route legend badge */}
            <div className="absolute top-6 right-6 z-[400] bg-white dark:bg-gray-900 text-[10px] font-bold px-4 py-2.5 rounded-full flex items-center gap-2 shadow-lg tracking-widest border border-gray-100 dark:border-gray-800">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-gray-700 dark:text-gray-300">PICKUP</span>
              <span className="text-gray-300 dark:text-gray-600">→</span>
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span className="text-gray-700 dark:text-gray-300">DROP</span>
              {agentStatus?.location && (
                <>
                  <span className="text-gray-300 dark:text-gray-600">•</span>
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  <span className="text-gray-700 dark:text-gray-300">YOU</span>
                </>
              )}
            </div>

            {/* Route info card */}
            <div className="absolute bottom-6 left-6 z-[400] bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-2xl shadow-black/10 border border-gray-50 dark:border-gray-800 min-w-[260px] max-w-[320px]">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 tracking-widest uppercase">ACTIVE DELIVERY</p>
                <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full tracking-widest ${getStatusInfo(assignedOrder.status).color}`}>
                  {getStatusInfo(assignedOrder.status).label}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="flex flex-col items-center gap-0.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white dark:border-gray-900 shadow"></div>
                  <div className="w-0.5 h-4 bg-blue-300 dark:bg-blue-700"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white dark:border-gray-900 shadow"></div>
                </div>
                <div className="flex-1 space-y-2 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate text-[11px]">{assignedOrder.pickupAddress || 'Pickup'}</p>
                  <p className="font-medium text-gray-900 dark:text-white truncate text-[11px]">{assignedOrder.dropAddress || 'Drop-off'}</p>
                </div>
              </div>
              {assignedOrder.fare > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-400 tracking-widest">FARE</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-0.5">
                    <IndianRupee className="h-3 w-3" strokeWidth={2.5} />{assignedOrder.fare}
                  </span>
                </div>
              )}
            </div>

            {/* GPS Sync Button */}
            <button
              onClick={() => {
                setGpsLoading(true);
                navigator.geolocation.getCurrentPosition(
                  (pos) => {
                    setGpsLoading(false);
                    updateLocation(null, {
                      lat: pos.coords.latitude,
                      lng: pos.coords.longitude
                    });
                  },
                  () => {
                    setGpsLoading(false);
                    toast.error('GPS failed');
                  }
                );
              }}
              className="absolute bottom-6 right-6 z-[400] bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg shadow-blue-600/30 transition-all active:scale-95"
            >
              {gpsLoading ? <Loader2 className="animate-spin h-5 w-5" /> : <Target className="h-5 w-5" />}
            </button>

            {/* Leaflet Map */}
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

              <AgentMapController agentLocation={agentStatus?.location} assignedOrder={assignedOrder} />

              {/* Route polyline */}
              {assignedOrder?.pickupLocation && assignedOrder?.dropLocation && (
                <RouteLayer pickup={assignedOrder.pickupLocation} drop={assignedOrder.dropLocation} />
              )}

              {/* Pickup marker */}
              {assignedOrder?.pickupLocation && (
                <Marker position={[assignedOrder.pickupLocation.lat, assignedOrder.pickupLocation.lng]} icon={pickupIcon}>
                  <Popup className="font-sans font-bold text-xs shadow-xl tracking-wider">
                    <span className="text-green-600">📍 Pickup</span><br/>{assignedOrder.pickupAddress || 'Pickup Location'}
                  </Popup>
                </Marker>
              )}

              {/* Drop marker */}
              {assignedOrder?.dropLocation && (
                <Marker position={[assignedOrder.dropLocation.lat, assignedOrder.dropLocation.lng]} icon={dropIcon}>
                  <Popup className="font-sans font-bold text-xs shadow-xl tracking-wider">
                    <span className="text-red-600">📍 Drop-off</span><br/>{assignedOrder.dropAddress || 'Drop Location'}
                  </Popup>
                </Marker>
              )}

              {/* Agent location marker */}
              {agentStatus?.location && (
                <Marker position={[agentStatus.location.lat, agentStatus.location.lng]} icon={agentMarkerIcon}>
                  <Popup className="font-sans font-bold text-xs shadow-xl tracking-wider">
                    <span className="text-orange-600">📍 Your Location</span>
                  </Popup>
                </Marker>
              )}
            </MapContainer>
          </div>

          {/* SIDEBAR */}
          <div className="w-full lg:w-[400px] bg-white dark:bg-gray-900 p-6 flex flex-col justify-between border-l border-gray-100 dark:border-gray-800">

            <div className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                <Package className="text-blue-500" /> Delivery Mission
              </h2>

              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">ORDER STATUS</span>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full tracking-widest ${getStatusInfo(assignedOrder.status).color}`}>
                    {getStatusInfo(assignedOrder.status).label}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 tracking-widest">PICKUP</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{assignedOrder?.pickupAddress}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0"></div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 tracking-widest">DROP-OFF</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{assignedOrder?.dropAddress}</p>
                    </div>
                  </div>
                  {assignedOrder?.fare > 0 && (
                    <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-200 dark:border-gray-800">
                      <span className="text-[10px] font-bold text-gray-400 tracking-widest">DELIVERY FARE</span>
                      <span className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-0.5">
                        <IndianRupee className="h-3.5 w-3.5" strokeWidth={2.5} />{assignedOrder.fare}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => setDetailsExpanded(!detailsExpanded)}
                className="text-blue-500 text-sm hover:text-blue-600 transition-colors"
              >
                {detailsExpanded ? 'Hide Details' : 'Show Details'}
              </button>

              {detailsExpanded && (
                <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-950 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                  {assignedOrder?.packageDetails}
                </p>
              )}
            </div>

            {/* ACTIONS */}
            <div>
              {assignedOrder?.status === 'assigned' && (
                <form onSubmit={verifyOtpSubmit} className="space-y-3">
                  <input
                    className="w-full text-center text-2xl border border-gray-200 dark:border-gray-700 p-3 rounded-lg bg-white dark:bg-gray-950 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    maxLength="4"
                    value={pickupOtp}
                    onChange={(e) => setPickupOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="OTP"
                  />
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-bold tracking-wider uppercase text-sm transition-colors active:scale-[0.98]">
                    {verifyingOtp ? 'Verifying...' : 'Confirm Pickup'}
                  </button>
                </form>
              )}

              {(assignedOrder?.status === 'picked' || assignedOrder?.status === 'in-transit') && (
                <form onSubmit={verifyDeliveryOtpSubmit} className="space-y-3">
                  <input
                    className="w-full text-center text-2xl border border-gray-200 dark:border-gray-700 p-3 rounded-lg bg-white dark:bg-gray-950 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    maxLength="4"
                    value={deliveryOtp}
                    onChange={(e) => setDeliveryOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="OTP"
                  />
                  <button className="w-full bg-orange-600 hover:bg-orange-700 text-white p-3 rounded-lg font-bold tracking-wider uppercase text-sm transition-colors active:scale-[0.98]">
                    {verifyingDeliveryOtp ? 'Verifying...' : 'Complete Delivery'}
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>

      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Driver Terminal</h1>
              <p className="text-gray-500 dark:text-gray-400">Manage your routes, status, and active deliveries</p>
            </div>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="card bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-lg transition-shadow duration-300">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-red-500" /> Update Current Location
              </h3>
              
              <form onSubmit={updateLocation} className="space-y-4">
                <div className="relative">
                  <MapPin className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    placeholder="Enter your current address or area"
                    className="input-field pl-12"
                    value={locationStr}
                    onChange={(e) => setLocationStr(e.target.value)}
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading || gpsLoading}
                  className="btn-primary flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Navigation className="h-5 w-5" />}
                  Sync Location
                </button>
                <div className="relative flex items-center gap-4 py-2">
                  <div className="flex-1 border-t border-gray-100 dark:border-gray-800"></div>
                  <span className="text-xs uppercase tracking-widest text-gray-500 font-bold bg-white dark:bg-gray-900 px-2 rounded-full border border-gray-100 dark:border-gray-800">Or</span>
                  <div className="flex-1 border-t border-gray-100 dark:border-gray-800"></div>
                </div>
                <button
                  type="button"
                  disabled={loading || gpsLoading}
                  onClick={() => {
                    if (!navigator.geolocation) {
                      toast.error('Geolocation is not supported by your browser');
                      return;
                    }
                    setGpsLoading(true);
                    navigator.geolocation.getCurrentPosition(
                      (position) => {
                        setGpsLoading(false);
                        const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
                        setLocationStr(`${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`);
                        updateLocation(null, coords);
                      },
                      (error) => {
                        setGpsLoading(false);
                        toast.error('Failed to get location: ' + error.message);
                      },
                      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
                    );
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-medium transition-all duration-200 bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 active:scale-[0.98] border border-gray-200 dark:border-gray-700"
                >
                  {gpsLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Target className="h-5 w-5" />}
                  Use Device GPS
                </button>
              </form>

              {agentStatus?.location && (
                <div className="mt-6 bg-gray-50 dark:bg-gray-950 rounded-xl p-4 border border-gray-200 dark:border-gray-800 font-mono text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Synced Latitude:</span>
                      <span className="text-red-500 dark:text-red-400 font-medium">{agentStatus.location.lat.toFixed(6)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Synced Longitude:</span>
                      <span className="text-red-500 dark:text-red-400 font-medium">{agentStatus.location.lng.toFixed(6)}</span>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800 text-center text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      {agentStatus.isAvailable ? 'Location active and searching for orders.' : 'You are currently assigned to an order.'}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Map card - shows agent location or India default */}
            <div className="card bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-0 overflow-hidden rounded-2xl" style={{ minHeight: '420px' }}>
              {agentStatus?.location ? (
                <div className="h-full w-full relative" style={{ minHeight: '420px' }}>
                  {/* Map badge */}
                  <div className="absolute top-4 left-4 z-[400] bg-[#0f172a] text-white text-[10px] font-bold px-3 py-2 rounded-full flex items-center gap-2 shadow-lg tracking-widest">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    YOUR LOCATION
                  </div>
                  <MapContainer
                    center={[agentStatus.location.lat, agentStatus.location.lng]}
                    zoom={14}
                    scrollWheelZoom={true}
                    zoomControl={false}
                    className="h-full w-full"
                    style={{ minHeight: '420px' }}
                  >
                    <TileLayer
                      url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    />
                    <AgentMapController agentLocation={agentStatus.location} assignedOrder={null} />
                    <Marker position={[agentStatus.location.lat, agentStatus.location.lng]} icon={agentMarkerIcon}>
                      <Popup className="font-sans font-bold text-xs shadow-xl tracking-wider">
                        <span className="text-orange-600">📍 Your Location</span>
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-12 px-6 h-full" style={{ minHeight: '420px' }}>
                  <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                    <div className="absolute inset-0 bg-red-100 dark:bg-red-500/20 rounded-full animate-ping opacity-75"></div>
                    <div className="relative w-16 h-16 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg border border-gray-100 dark:border-gray-700 z-10">
                      <Radar className="h-8 w-8 text-red-600 dark:text-red-500" />
                    </div>
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Scanning For Orders</h4>
                  <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto">Sync your location to see it on the map and start receiving order assignments within a 10km radius.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentDashboard;
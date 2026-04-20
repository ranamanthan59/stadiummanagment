'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { 
  MapPin, 
  Clock, 
  Utensils, 
  Droplets, 
  Navigation, 
  Bell,
  Search,
  ChevronRight,
  Info,
  Users,
  X,
  Layers,
  ShieldAlert,
  Zap,
  ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AttendeeApp() {
  const { data: facilities } = useSWR('/api/facilities', fetcher, { refreshInterval: 5000 });
  const { data: notifications } = useSWR('/api/notifications', fetcher, { refreshInterval: 5000 });
  const { data: zones } = useSWR('/api/zones', fetcher, { refreshInterval: 5000 });

  const [filter, setFilter] = useState('All');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [mapLayer, setMapLayer] = useState('Heatmap'); // Heatmap, Facilities, Safety
  const [selectedElement, setSelectedElement] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);

  const filteredFacilities = facilities?.filter((f: any) => 
    filter === 'All' || f.type === filter
  ) || [];

  const recommendedFacility = facilities?.reduce((prev: any, curr: any) => {
    return (prev.queueLength * prev.avgServiceTime < curr.queueLength * curr.avgServiceTime) ? prev : curr;
  }, facilities?.[0]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;

    const q = searchQuery.toLowerCase();
    
    // Find matching zone
    const matchingZone = zones?.find((z: any) => 
      z.name.toLowerCase().includes(q) || q.includes(z.name.toLowerCase())
    );

    // Filter gates
    const gates = facilities?.filter((f: any) => f.type === 'Gate') || [];
    
    // Logic: Map stands to preferred gates if possible, otherwise pick least busy
    let suggestedGates = gates;
    
    if (q.includes('north')) {
      suggestedGates = gates.filter((g: any) => g.name.toLowerCase().includes('north') || g.name.includes('1') || g.name.includes('2'));
    } else if (q.includes('south')) {
      suggestedGates = gates.filter((g: any) => g.name.toLowerCase().includes('south') || g.name.includes('3') || g.name.includes('4'));
    } else if (q.includes('east')) {
      suggestedGates = gates.filter((g: any) => g.name.toLowerCase().includes('east') || g.name.includes('2') || g.name.includes('3'));
    } else if (q.includes('west')) {
      suggestedGates = gates.filter((g: any) => g.name.toLowerCase().includes('west') || g.name.includes('1') || g.name.includes('4'));
    }

    // From the suggested subset (or all), pick the one with shortest queue
    const bestGate = (suggestedGates.length > 0 ? suggestedGates : gates).reduce((prev: any, curr: any) => {
      return (prev.queueLength < curr.queueLength) ? prev : curr;
    }, gates[0]);

    setSearchResult({
      zone: matchingZone,
      bestGate: bestGate,
      trafficStatus: matchingZone?.status || (matchingZone ? (matchingZone.currentCrowd / matchingZone.capacity > 0.8 ? 'Overcrowded' : matchingZone.currentCrowd / matchingZone.capacity > 0.5 ? 'Crowded' : 'Normal') : 'Normal')
    });
  };

  const getZoneColor = (zoneName: string) => {
    const zone = zones?.find((z:any) => z.name.toLowerCase().includes(zoneName.toLowerCase()));
    if (!zone) return '#e5e7eb';
    const density = (zone.currentCrowd / zone.capacity) * 100;
    if (density > 85) return '#ef4444'; 
    if (density > 60) return '#f97316'; 
    return '#10b981'; 
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <header className="bg-indigo-600 text-white p-6 sticky top-0 z-10 rounded-b-3xl shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-indigo-200 text-xs font-medium">Welcome to</p>
            <h1 className="text-2xl font-bold">Wembley Stadium</h1>
          </div>
          <button 
            onClick={() => setShowNotifications(true)}
            className="relative p-2 hover:bg-white/10 rounded-full transition"
          >
            <Bell className="w-6 h-6" />
            {notifications?.length > 0 && (
              <span className="absolute top-1 right-1 bg-red-500 text-[10px] w-4 h-4 flex items-center justify-center rounded-full border-2 border-indigo-600 font-bold">
                {notifications.length}
              </span>
            )}
          </button>
        </div>
        
        <AnimatePresence>
          {notifications?.some((n:any) => n.type === 'Alert' || n.type === 'Emergency') && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setShowNotifications(true)}
              className="bg-orange-500 p-3 rounded-xl flex items-center gap-3 text-sm cursor-pointer hover:bg-orange-600 transition"
            >
              <Info className="w-5 h-5 flex-shrink-0" />
              <p className="font-medium">Active safety alerts. Tap to view.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <AnimatePresence>
        {showMap && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed inset-0 bg-white dark:bg-gray-900 z-[60] flex flex-col"
          >
            <header className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={() => setShowMap(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-bold">Stadium Map</h2>
              </div>
              <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                {['Heatmap', 'Facilities', 'Safety'].map((layer) => (
                  <button
                    key={layer}
                    onClick={() => setMapLayer(layer)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                      mapLayer === layer ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600' : 'text-gray-500'
                    }`}
                  >
                    {layer}
                  </button>
                ))}
              </div>
            </header>

            <div className="flex-1 relative overflow-hidden bg-gray-50 dark:bg-black flex items-center justify-center">
              <svg viewBox="0 0 400 300" className="w-full max-w-2xl px-4">
                <rect x="100" y="75" width="200" height="150" rx="75" fill="#34d399" opacity="0.2" />
                <g onClick={() => setSelectedElement({ name: 'North Stand', type: 'Zone' })} className="cursor-pointer">
                  <path d="M50,50 Q200,-20 350,50 L330,70 Q200,10 70,70 Z" fill={mapLayer === 'Heatmap' ? getZoneColor('North') : '#6366f1'} />
                </g>
                <g onClick={() => setSelectedElement({ name: 'South Stand', type: 'Zone' })} className="cursor-pointer">
                  <path d="M50,250 Q200,320 350,250 L330,230 Q200,290 70,230 Z" fill={mapLayer === 'Heatmap' ? getZoneColor('South') : '#6366f1'} />
                </g>
                <g onClick={() => setSelectedElement({ name: 'East Stand', type: 'Zone' })} className="cursor-pointer">
                  <path d="M350,70 Q420,150 350,230 L330,210 Q380,150 330,90 Z" fill={mapLayer === 'Heatmap' ? getZoneColor('East') : '#6366f1'} />
                </g>
                <g onClick={() => setSelectedElement({ name: 'West Stand', type: 'Zone' })} className="cursor-pointer">
                  <path d="M50,70 Q-20,150 50,230 L70,210 Q20,150 70,90 Z" fill={mapLayer === 'Heatmap' ? getZoneColor('West') : '#6366f1'} />
                </g>
                {mapLayer === 'Facilities' && facilities?.map((f:any, i:number) => (
                  <circle key={f._id} cx={150 + (i*30)%100} cy={100 + (i*20)%100} r="6" fill="#f59e0b" className="animate-pulse" onClick={() => setSelectedElement(f)} />
                ))}
                {mapLayer === 'Safety' && (
                  <path d="M200,150 L380,150" stroke="#ef4444" strokeWidth="3" strokeDasharray="5,3" />
                )}
              </svg>

              <AnimatePresence>
                {selectedElement && (
                  <motion.div initial={{ y: 20 }} animate={{ y: 0 }} className="absolute bottom-10 left-6 right-6 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl">
                    <div className="flex justify-between">
                      <h4 className="font-bold">{selectedElement.name}</h4>
                      <X className="w-5 h-5 cursor-pointer" onClick={() => setSelectedElement(null)} />
                    </div>
                    <button className="w-full mt-4 py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2">
                      <Navigation className="w-4 h-4" /> Route Here
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSearch && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSearch(false)} className="fixed inset-0 bg-indigo-900/60 z-40 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="fixed inset-x-4 top-20 z-50 bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-2xl max-w-lg mx-auto">
              <div className="flex justify-between mb-6">
                <h2 className="text-xl font-bold">Find My Section</h2>
                <X className="w-6 h-6 cursor-pointer" onClick={() => setShowSearch(false)} />
              </div>
              <form onSubmit={handleSearch} className="relative mb-6">
                <input type="text" placeholder="Enter Section..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-gray-100 dark:bg-gray-700 rounded-2xl outline-none" />
                <Search className="absolute left-4 top-4 text-gray-400" />
              </form>
              {searchResult && (
                <div className="space-y-4">
                  <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl">
                    <p className="text-xs font-bold text-indigo-600 uppercase">Target</p>
                    <h4 className="font-bold">{searchResult.zone?.name || searchQuery}</h4>
                  </div>
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
                    <p className="text-xs font-bold text-emerald-600 uppercase">Best Gate</p>
                    <h4 className="font-bold">{searchResult.bestGate?.name || 'Gate A'}</h4>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showNotifications && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setShowNotifications(false)} className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 z-50 rounded-t-[32px] p-8 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between mb-6">
                <h2 className="text-2xl font-bold">Alerts</h2>
                <X className="w-6 h-6 cursor-pointer" onClick={() => setShowNotifications(false)} />
              </div>
              <div className="space-y-4">
                {notifications?.map((notif: any) => (
                  <div key={notif._id} className="p-4 rounded-2xl border-l-4 bg-blue-50 dark:bg-blue-900/20 border-blue-500">
                    <p className="font-bold text-sm uppercase">{notif.type}</p>
                    <p className="text-sm">{notif.message}</p>
                  </div>
                )) || <p className="text-center text-gray-400">No active alerts</p>}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="p-6 space-y-8">
        {recommendedFacility && (
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase">Least Busy</span>
              <h3 className="text-xl font-bold mt-3">{recommendedFacility.name}</h3>
              <p className="text-indigo-100 text-sm">{recommendedFacility.queueLength * recommendedFacility.avgServiceTime} mins wait</p>
              <button className="mt-4 bg-white text-indigo-600 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                <Navigation className="w-4 h-4" /> Navigate
              </button>
            </div>
            <MapPin className="absolute -bottom-4 -right-4 w-32 h-32 text-white/10 rotate-12" />
          </div>
        )}

        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {['All', 'Food', 'Washroom', 'Gate'].map((cat) => (
            <button key={cat} onClick={() => setFilter(cat)} className={`px-5 py-2 rounded-full text-sm font-semibold flex-shrink-0 ${filter === cat ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-500 border border-gray-200'}`}>
              {cat}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-bold">Nearby Facilities</h3>
          {filteredFacilities.map((f: any) => (
            <div key={f._id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl">
                  {f.type === 'Food' ? <Utensils /> : f.type === 'Washroom' ? <Droplets /> : <MapPin />}
                </div>
                <div>
                  <h4 className="font-bold">{f.name}</h4>
                  <p className="text-xs text-gray-500">{f.queueLength * f.avgServiceTime} min wait • {f.queueLength} people</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </div>
          ))}
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 px-8 py-4 flex justify-between items-center rounded-t-3xl shadow-lg z-50">
        <div className="flex flex-col items-center gap-1 text-indigo-600">
          <MapPin className="w-6 h-6" />
          <span className="text-[10px] font-bold">Home</span>
        </div>
        <button onClick={() => setShowMap(true)} className={`flex flex-col items-center gap-1 transition-colors ${showMap ? 'text-indigo-600' : 'text-gray-400'}`}>
          <Navigation className="w-6 h-6" />
          <span className="text-[10px] font-bold">Map</span>
        </button>
        <button onClick={() => setShowSearch(true)} className="bg-indigo-600 p-4 rounded-2xl -mt-12 shadow-lg shadow-indigo-200 ring-4 ring-white dark:ring-gray-900 hover:bg-indigo-700 transition">
          <Search className="w-6 h-6 text-white" />
        </button>
        <button onClick={() => setShowNotifications(true)} className={`flex flex-col items-center gap-1 transition-colors ${showNotifications ? 'text-indigo-600' : 'text-gray-400'}`}>
          <Bell className="w-6 h-6" />
          <span className="text-[10px] font-bold">Alerts</span>
        </button>
        <Link href="/admin" className="flex flex-col items-center gap-1 text-gray-400">
          <Users className="w-6 h-6" />
          <span className="text-[10px] font-bold">Admin</span>
        </Link>
      </nav>
    </div>
  );
}

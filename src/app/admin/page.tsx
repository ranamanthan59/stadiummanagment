'use client';

import React, { useEffect, useState } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { 
  Users, 
  MapPin, 
  AlertTriangle, 
  Clock, 
  RefreshCw, 
  Bell,
  Utensils,
  LogOut,
  ChevronRight,
  Edit2,
  Check,
  X
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { StatsCard } from '@/components/StatsCard';

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error('Network response was not ok');
  return res.json();
});

export default function AdminDashboard() {
  const [isMounted, setIsMounted] = useState(false);
  const { data: zones, mutate: mutateZones } = useSWR('/api/zones', fetcher, { refreshInterval: 5000 });
  const { data: facilities, mutate: mutateFacilities } = useSWR('/api/facilities', fetcher, { refreshInterval: 5000 });
  const { data: notifications, mutate: mutateNotifications } = useSWR('/api/notifications', fetcher, { refreshInterval: 5000 });
  
  const [isSimulating, setIsSimulating] = useState(false);
  const [editingZone, setEditingZone] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleUpdateCrowd = async (id: string) => {
    try {
      await fetch(`/api/zones/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentCrowd: editValue }),
      });
      mutateZones();
      setEditingZone(null);
    } catch (error) {
      console.error('Failed to update crowd:', error);
    }
  };

  const runSimulation = async () => {
    setIsSimulating(true);
    await fetch('/api/simulate', { method: 'POST' });
    mutateZones();
    mutateFacilities();
    mutateNotifications();
    setIsSimulating(false);
  };

  const totalCrowd = zones?.reduce((acc: number, z: any) => acc + z.currentCrowd, 0) || 0;
  const totalCapacity = zones?.reduce((acc: number, z: any) => acc + z.capacity, 0) || 1;
  const avgDensity = Math.round((totalCrowd / totalCapacity) * 100);

  const chartData = zones?.map((z: any) => ({
    name: z.name,
    crowd: z.currentCrowd,
    capacity: z.capacity,
    density: Math.round((z.currentCrowd / z.capacity) * 100)
  })) || [];

  if (!isMounted) {
    return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-gray-500">Loading Dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-indigo-700 text-white hidden md:flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MapPin className="w-8 h-8" />
            StadiumPro
          </h1>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-2">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 bg-indigo-800 rounded-lg">
            <Users className="w-5 h-5" /> Dashboard
          </Link>
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 hover:bg-indigo-600 rounded-lg transition">
            <MapPin className="w-5 h-5" /> Zones
          </Link>
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 hover:bg-indigo-600 rounded-lg transition">
            <Utensils className="w-5 h-5" /> Facilities
          </Link>
          <Link href="/admin/notifications" className="flex items-center gap-3 px-4 py-3 hover:bg-indigo-600 rounded-lg transition">
            <Bell className="w-5 h-5" /> Notifications
          </Link>
        </nav>
        <div className="p-4 border-t border-indigo-600">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 w-full hover:bg-indigo-600 rounded-lg transition">
            <LogOut className="w-5 h-5" /> Logout
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white dark:bg-gray-800 shadow-sm px-8 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Admin Control Center</h2>
          <div className="flex gap-4">
            <button 
              onClick={runSimulation}
              disabled={isSimulating}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSimulating ? 'animate-spin' : ''}`} />
              Trigger Data Update
            </button>
          </div>
        </header>

        <div className="p-8 space-y-8">
          {/* Stats Overview ... unchanged ... */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard 
              title="Total Attendance" 
              value={totalCrowd.toLocaleString()} 
              icon={Users} 
              description={`${avgDensity}% of total capacity`}
              colorClass="bg-blue-500"
            />
            <StatsCard 
              title="Avg. Wait Time" 
              value="12 min" 
              icon={Clock} 
              description="Across all facilities"
              colorClass="bg-emerald-500"
            />
            <StatsCard 
              title="Active Alerts" 
              value={notifications?.filter((n:any) => n.type === 'Alert').length || 0} 
              icon={AlertTriangle} 
              description="Critical zones require attention"
              colorClass="bg-orange-500"
            />
            <StatsCard 
              title="Operational Gates" 
              value={facilities?.filter((f:any) => f.type === 'Gate').length || 0} 
              icon={MapPin} 
              description="All systems green"
              colorClass="bg-purple-500"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Crowd Density Chart */}
            <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold mb-6 text-gray-800 dark:text-white">Crowd Density by Zone</h3>
              <div className="h-80 w-full" style={{ minHeight: '320px', minWidth: '0' }}>
                {isMounted && chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        fontSize={10} 
                        tick={{ fill: '#9ca3af' }}
                        axisLine={{ stroke: '#e5e7eb' }}
                        interval={0}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis 
                        fontSize={12} 
                        tick={{ fill: '#9ca3af' }}
                        axisLine={{ stroke: '#e5e7eb' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          borderRadius: '8px', 
                          border: 'none', 
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                        }} 
                      />
                      <Bar dataKey="crowd" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.density > 90 ? '#ef4444' : entry.density > 70 ? '#f97316' : '#6366f1'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-gray-400 italic">
                    {chartData.length === 0 ? 'No zone data available' : 'Initializing chart...'}
                  </div>
                )}
              </div>
            </div>
          </div>


          {/* Facilities Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">Facility Status & Queues</h3>
            </div>
            {/* ... existing table code ... */}
          </div>

          {/* Manual Zone Entry Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">Zone Management (Manual Entry)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300 text-xs uppercase font-medium">
                  <tr>
                    <th className="px-6 py-4">Zone Name</th>
                    <th className="px-6 py-4">Capacity</th>
                    <th className="px-6 py-4">Current Crowd</th>
                    <th className="px-6 py-4">Density</th>
                    <th className="px-6 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {zones?.map((z: any) => (
                    <tr key={z._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{z.name}</td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{z.capacity}</td>
                      <td className="px-6 py-4 text-gray-900 dark:text-white">
                        {editingZone === z._id ? (
                          <input
                            type="number"
                            className="w-24 px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600"
                            value={editValue}
                            onChange={(e) => setEditValue(parseInt(e.target.value) || 0)}
                          />
                        ) : (
                          z.currentCrowd
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                            <div 
                              className={`h-1.5 rounded-full ${
                                (z.currentCrowd / z.capacity) > 0.9 ? 'bg-red-500' : 
                                (z.currentCrowd / z.capacity) > 0.7 ? 'bg-orange-500' : 'bg-emerald-500'
                              }`} 
                              style={{ width: `${Math.min(100, (z.currentCrowd / z.capacity) * 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500">{Math.round((z.currentCrowd / z.capacity) * 100)}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {editingZone === z._id ? (
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleUpdateCrowd(z._id)}
                              className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => setEditingZone(null)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => {
                              setEditingZone(z._id);
                              setEditValue(z.currentCrowd);
                            }}
                            className="p-1 text-indigo-600 hover:bg-indigo-50 rounded"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

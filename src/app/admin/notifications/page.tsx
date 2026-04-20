'use client';

import React, { useEffect, useState } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { 
  Users, 
  MapPin, 
  Bell,
  Utensils,
  LogOut,
  ChevronLeft,
  Trash2,
  AlertTriangle,
  Info,
  AlertCircle
} from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error('Network response was not ok');
  return res.json();
});

export default function NotificationsPage() {
  const [isMounted, setIsMounted] = useState(false);
  const { data: notifications, mutate: mutateNotifications } = useSWR('/api/notifications', fetcher, { refreshInterval: 5000 });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-gray-500">Loading Notifications...</div>;
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'Emergency': return <AlertCircle className="w-6 h-6 text-red-500" />;
      case 'Alert': return <AlertTriangle className="w-6 h-6 text-orange-500" />;
      default: return <Info className="w-6 h-6 text-blue-500" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'Emergency': return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
      case 'Alert': return 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800';
      default: return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
    }
  };

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
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 hover:bg-indigo-600 rounded-lg transition">
            <Users className="w-5 h-5" /> Dashboard
          </Link>
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 hover:bg-indigo-600 rounded-lg transition">
            <MapPin className="w-5 h-5" /> Zones
          </Link>
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 hover:bg-indigo-600 rounded-lg transition">
            <Utensils className="w-5 h-5" /> Facilities
          </Link>
          <Link href="/admin/notifications" className="flex items-center gap-3 px-4 py-3 bg-indigo-800 rounded-lg">
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
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition">
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </Link>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">All Notifications</h2>
          </div>
          <div className="flex gap-4">
            <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
              {notifications?.length || 0} Total
            </span>
          </div>
        </header>

        <div className="p-8 max-w-4xl mx-auto">
          <div className="space-y-4">
            {notifications && notifications.length > 0 ? (
              notifications.map((notif: any) => (
                <div 
                  key={notif._id} 
                  className={`p-6 rounded-xl border-l-4 shadow-sm flex items-start gap-4 transition hover:shadow-md ${getBgColor(notif.type)}`}
                >
                  <div className="mt-1">{getIcon(notif.type)}</div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white">{notif.type.toUpperCase()}</h4>
                        <p className="text-gray-700 dark:text-gray-300 mt-1">{notif.message}</p>
                      </div>
                      <span className="text-xs text-gray-500 font-medium">
                        {new Date(notif.createdAt || Date.now()).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  <button className="p-2 text-gray-400 hover:text-red-500 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">No notifications</h3>
                <p className="text-gray-500">Everything is quiet for now.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Bell, User, BarChart3, LogOut, Compass } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import client from '../api/client';

const TOAST_MESSAGES = {
  like: 'Someone liked your post!',
  comment: 'New comment on your post!',
  follow: 'You have a new follower!',
  post_approved: 'Your post was approved!',
  post_rejected: 'Your post was rejected.',
};

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const socket = useSocket();
  const queryClient = useQueryClient();

  const [unreadCount, setUnreadCount] = useState(0);
  const [toastNotif, setToastNotif] = useState(null);

  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    try {
      const res = await client.get('/notifications');
      const count = parseInt(res.headers['x-unread-count'] ?? '0', 10);
      setUnreadCount(isNaN(count) ? 0 : count);
    } catch {
      // no-op
    }
  }, [user]);

  useEffect(() => {
    if (location.pathname === '/notifications') {
      setUnreadCount(0);
      setToastNotif(null);
      client
        .patch('/notifications/read')
        .then(() => queryClient.invalidateQueries({ queryKey: ['notifications'] }))
        .catch(console.error);
    } else {
      fetchUnreadCount();
    }
  }, [location.pathname, fetchUnreadCount, queryClient]);

  useEffect(() => {
    if (!socket) return;

    const handleNotification = (notif) => {
      setUnreadCount((prev) => prev + 1);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      setToastNotif(notif);
      setTimeout(() => setToastNotif(null), 5000);
    };

    socket.on('notification', handleNotification);
    return () => socket.off('notification', handleNotification);
  }, [socket, queryClient]);

  const navItems = [
    { icon: Home, label: 'Feed', path: '/' },
    { icon: Compass, label: 'Explore', path: '/explore' },
    { icon: Bell, label: 'Notifications', path: '/notifications', badge: unreadCount },
    { icon: User, label: 'Profile', path: `/profile/${user?._id || user?.id}` },
    ...(user?.role === 'admin' ? [{ icon: BarChart3, label: 'Admin', path: '/admin' }] : []),
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <aside className="w-64 glass-effect border-r hidden md:flex flex-col fixed h-screen">
        <div className="p-8">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-brand to-purple-500 bg-clip-text text-transparent">
            social-feed
          </h1>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto scrollbar-hide">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-brand text-white shadow-lg shadow-brand/20'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="relative">
                  <Icon size={22} />
                  {item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2 mt-auto">
          {user && (
            <Link
              to={`/profile/${user._id || user.id}`}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors w-full group"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                <img
                  src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username || 'default'}`}
                  alt={user.displayName || user.username}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 overflow-hidden truncate">
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                  {user.displayName || user.username}
                </p>
                <p className="text-[10px] uppercase font-bold tracking-wider text-brand truncate">
                  {user.role}
                </p>
              </div>
            </Link>
          )}

          <button
            onClick={logout}
            className="flex items-center gap-4 w-full px-4 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-all font-medium"
          >
            <LogOut size={22} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 md:ml-64 p-4 md:p-8">
        <div className="max-w-2xl mx-auto pb-24 md:pb-0">
          <Outlet />
        </div>
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-effect border-t px-6 py-3 flex justify-between items-center z-50">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`relative p-2 rounded-full ${isActive ? 'text-brand' : 'text-slate-500'}`}
            >
              <Icon size={24} />
              {item.badge > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {toastNotif && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-2xl p-4 flex items-center gap-3 w-80">
            <div className="p-2 rounded-full bg-brand/10 text-brand">
              <Bell size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                New Notification
              </p>
              <p className="text-xs text-slate-500 truncate mt-0.5">
                {TOAST_MESSAGES[toastNotif.type] ?? 'You have a new system alert.'}
              </p>
            </div>
            <button
              onClick={() => setToastNotif(null)}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;

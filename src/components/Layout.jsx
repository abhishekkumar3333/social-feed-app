import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Bell, User, PlusSquare, BarChart3, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useState, useEffect } from 'react';

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const socket = useSocket();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (socket) {
      const handleNotification = () => {
        setUnreadCount(prev => prev + 1);
      };

      socket.on('notification', handleNotification);

      return () => {
        socket.off('notification', handleNotification);
      };
    }
  }, [socket]);

  useEffect(() => {
    if (location.pathname === '/notifications') {
      setUnreadCount(0);
    }
  }, [location.pathname]);

  const navItems = [
    { icon: Home, label: 'Feed', path: '/' },
    { icon: Bell, label: 'Notifications', path: '/notifications', badge: unreadCount },
    { icon: User, label: 'Profile', path: `/profile/${user?._id}` },
    ...(user?.role === 'admin' ? [{ icon: BarChart3, label: 'Admin', path: '/admin' }] : []),
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <aside className="w-64 glass-effect border-r hidden md:flex flex-col fixed h-screen">
        <div className="p-8">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-brand to-purple-500 bg-clip-text text-transparent">
            social-feed          </h1>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${isActive
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

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={logout}
            className="flex items-center gap-4 w-full px-4 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-all font-medium"
          >
            <LogOut size={22} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8">
        <div className="max-w-2xl mx-auto pb-24 md:pb-0">
          <Outlet />
        </div>
      </main>

      {/* Bottom Nav (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-effect border-t px-6 py-3 flex justify-between items-center z-50">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link key={item.path} to={item.path} className={`relative p-2 rounded-full ${isActive ? 'text-brand' : 'text-slate-500'}`}>
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
    </div>
  );
};

export default Layout;

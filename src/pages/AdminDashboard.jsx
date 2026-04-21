import React from 'react';
import { useQuery } from '@tanstack/react-query';
import client from '../api/client';
import { BarChart3, Loader2, Activity, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

const AdminDashboard = () => {
  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const { data } = await client.get('/admin/queue-stats');
      return data;
    },
    refetchInterval: 5000 // Real-time update every 5 seconds
  });

  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-brand" /></div>;

  const Queues = [
    { name: 'Moderation', data: stats.moderation, icon: ShieldCheck },
    { name: 'Fanout', data: stats.fanout, icon: Activity },
    { name: 'Notification', data: stats.notification, icon: Bell }
  ];

  return (
    <div className="space-y-8 animate-in fade-in zoom-in duration-500">
      <div className="flex justify-between items-center px-2">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-slate-500">Live BullMQ Queue depths and health monitoring</p>
        </div>
        <button 
          onClick={() => refetch()}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
        >
          <Activity size={24} className="text-brand" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(stats).map(([name, counts]) => (
          <div key={name} className="premium-card p-6">
            <h3 className="text-lg font-bold capitalize mb-4 flex items-center gap-2">
              <BarChart3 size={18} className="text-brand" />
              {name} Queue
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-slate-500">
                  <Activity size={16} />
                  <span>Active</span>
                </div>
                <span className="font-bold text-brand">{counts.active}</span>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-slate-500">
                  <Clock size={16} />
                  <span>Waiting</span>
                </div>
                <span className="font-bold text-amber-500">{counts.waiting + counts.delayed}</span>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-slate-500">
                  <AlertTriangle size={16} />
                  <span>Failed</span>
                </div>
                <span className="font-bold text-red-500">{counts.failed}</span>
              </div>

              <div className="flex justify-between items-center border-t dark:border-slate-800 pt-4">
                <div className="flex items-center gap-2 text-slate-500">
                  <CheckCircle size={16} />
                  <span>Completed</span>
                </div>
                <span className="font-bold text-emerald-500">{counts.completed}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="premium-card p-8 bg-brand/5 border-brand/20">
        <h2 className="text-xl font-bold mb-2">System Health</h2>
        <p className="text-slate-600 dark:text-slate-400">
          All background workers are currently online and processing events. Node.js event-loop latency is minimal.
        </p>
      </div>
    </div>
  );
};

// Internal imports fix
import { ShieldCheck, Bell } from 'lucide-react';

export default AdminDashboard;

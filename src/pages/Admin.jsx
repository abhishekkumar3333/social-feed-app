import React from 'react';
import { useQuery } from '@tanstack/react-query';
import client from '../api/client';
import { BarChart3, Activity, Loader2, AlertCircle } from 'lucide-react';

const Admin = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const { data } = await client.get('/admin/queues');
      return data;
    },
    refetchInterval: 5000,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-brand" size={40} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-2xl flex gap-3">
        <AlertCircle />
        <span>You do not have permission to view this page or backend is down.</span>
      </div>
    );
  }

  const QueueCard = ({ title, stats }) => (
    <div className="premium-card p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 capitalize">{title} Queue</h3>
        <Activity className="text-emerald-500" size={20} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {Object.entries(stats).map(([key, value]) => (
          <div key={key} className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
            <span className="block text-xs uppercase tracking-wider text-slate-400 mb-1">{key}</span>
            <span className="text-xl font-bold">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
      <header className="flex items-center gap-4">
        <div className="p-3 bg-brand/10 text-brand rounded-2xl">
          <BarChart3 size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Admin Insights</h1>
          <p className="text-slate-500">Monitor your background moderation and fanout pipelines</p>
        </div>
      </header>

      <div className="grid md:grid-cols-2 gap-6">
        <QueueCard title="Moderation" stats={data.moderation} />
        <QueueCard title="Fanout" stats={data.fanout} />
        <QueueCard title="Notification" stats={data.notification} />
      </div>

      <div className="premium-card p-6">
        <h3 className="text-lg font-bold mb-4">Pipeline Status</h3>
        <div className="flex items-center gap-2 text-emerald-500 font-medium">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Real-time monitoring active</span>
        </div>
      </div>
    </div>
  );
};

export default Admin;

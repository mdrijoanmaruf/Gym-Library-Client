"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { 
  FiVideo, 
  FiImage, 
  FiUsers, 
  FiActivity, 
  FiArrowRight, 
  FiPlayCircle, 
  FiSettings,
  FiTrendingUp
} from "react-icons/fi";
import Link from "next/link";

export default function AdminDashboardHome() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({
    videos: 0,
    gifs: 0,
    users: 0,
    loading: true
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const [videosRes, gifsRes] = await Promise.all([
          fetch("/api/media?type=video&limit=1"),
          fetch("/api/media?type=gif&limit=1")
        ]);
        
        const videosData = await videosRes.json().catch(() => ({ total: 0 }));
        const gifsData = await gifsRes.json().catch(() => ({ total: 0 }));
        
        setStats({
          videos: videosData.total || 0,
          gifs: gifsData.total || 0,
          users: 3, // Mock user count for now
          loading: false
        });
      } catch (err) {
        setStats(prev => ({ ...prev, loading: false }));
      }
    }
    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Total Videos",
      value: stats.loading ? "..." : stats.videos,
      icon: FiVideo,
      color: "from-orange-500 to-amber-400",
      bg: "bg-orange-500/10",
      border: "border-orange-500/20",
      text: "text-orange-400"
    },
    {
      title: "Total GIFs",
      value: stats.loading ? "..." : stats.gifs,
      icon: FiImage,
      color: "from-blue-500 to-cyan-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      text: "text-blue-400"
    },
    {
      title: "Registered Users",
      value: stats.loading ? "..." : stats.users,
      icon: FiUsers,
      color: "from-emerald-500 to-teal-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      text: "text-emerald-400"
    },
    {
      title: "System Status",
      value: "Online",
      icon: FiActivity,
      color: "from-purple-500 to-pink-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
      text: "text-purple-400"
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl p-8 lg:p-10 border border-white/10"
        style={{
          background: "linear-gradient(135deg, rgba(20,20,25,0.95) 0%, rgba(10,10,15,0.95) 100%)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.5)"
        }}
      >
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-orange-500/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight mb-2">
              Welcome back, {session?.user?.name?.split(' ')[0] || "Admin"}! 👋
            </h2>
            <p className="text-zinc-400 text-sm max-w-xl leading-relaxed">
              Here's what's happening with GymLibrary today. You can manage your entire media library, monitor user activity, and configure system settings right from this dashboard.
            </p>
          </div>
          <div className="shrink-0 flex gap-3">
            <Link 
              href="/admin-dashboard/videos"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-orange-500 text-black hover:bg-orange-400 hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,140,0,0.3)]"
            >
              <FiPlayCircle className="w-4 h-4" />
              Manage Videos
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div 
            key={i} 
            className="group relative bg-white/[0.02] border border-white/10 p-6 rounded-3xl shadow-xl overflow-hidden hover:bg-white/[0.04] transition-colors"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bg} rounded-full blur-[50px] -mr-10 -mt-10 transition-opacity opacity-50 group-hover:opacity-100`} />
            
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-400 mb-2">{stat.title}</p>
                <h3 className="text-4xl font-black text-white tracking-tight">
                  {stat.value}
                </h3>
              </div>
              <div className={`w-12 h-12 rounded-2xl ${stat.bg} border ${stat.border} flex items-center justify-center shadow-inner`}>
                <stat.icon className={`w-6 h-6 ${stat.text}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Quick Actions */}
        <div className="lg:col-span-2 bg-white/[0.02] border border-white/10 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FiTrendingUp className="w-5 h-5 text-orange-500" />
              Quick Actions
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/admin-dashboard/videos" className="flex items-center p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center mr-4">
                <FiVideo className="w-5 h-5 text-orange-500" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-white mb-0.5">Video Library</h4>
                <p className="text-[11px] text-zinc-500">Edit titles, order, and features</p>
              </div>
              <FiArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
            </Link>
            
            <Link href="/admin-dashboard/users" className="flex items-center p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mr-4">
                <FiUsers className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-white mb-0.5">User Management</h4>
                <p className="text-[11px] text-zinc-500">View and manage accounts</p>
              </div>
              <FiArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
            </Link>

            <Link href="/admin-dashboard/settings" className="flex items-center p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mr-4">
                <FiSettings className="w-5 h-5 text-purple-500" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-white mb-0.5">System Settings</h4>
                <p className="text-[11px] text-zinc-500">Configure global preferences</p>
              </div>
              <FiArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
            </Link>
          </div>
        </div>

        {/* System Info */}
        <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 to-transparent pointer-events-none" />
          <h3 className="text-lg font-bold text-white mb-6 relative z-10">System Status</h3>
          
          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5">
              <span className="text-xs font-semibold text-zinc-400">Database</span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-emerald-500">Connected</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5">
              <span className="text-xs font-semibold text-zinc-400">API Server</span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-emerald-500">Online</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5">
              <span className="text-xs font-semibold text-zinc-400">Storage</span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-emerald-500">Healthy</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

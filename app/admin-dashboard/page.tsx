export default function AdminDashboardHome() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Dashboard Home</h2>
        <p className="text-zinc-400 text-sm mt-1">Welcome back to the GymLibrary Admin Panel.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <h3 className="text-lg font-semibold text-white">Total Videos</h3>
          <p className="text-3xl font-bold text-orange-500 mt-2">--</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <h3 className="text-lg font-semibold text-white">Total Users</h3>
          <p className="text-3xl font-bold text-orange-500 mt-2">--</p>
        </div>
      </div>
    </div>
  );
}

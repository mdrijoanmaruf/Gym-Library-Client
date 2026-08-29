"use client";

import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FiGrid,
  FiUsers,
  FiVideo,
  FiSettings,
  FiMenu,
  FiX,
  FiHome,
  FiLogOut,
} from "react-icons/fi";
import { useSession, signOut } from "next-auth/react";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();

  const role = (session?.user as any)?.role as string | undefined;
  const is_admin = (session?.user as any)?.is_admin as boolean | undefined;

  // Guard: redirect non-admins away
  useEffect(() => {
    if (status === "loading") return;
    
    // Check if the user is authenticated and has admin rights
    if (status === "unauthenticated" || role !== "admin") {
      router.replace("/");
    }
  }, [status, role, router]);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const navItems = [
    { href: "/admin-dashboard", label: "Dashboard", Icon: FiGrid, exact: true },
    { href: "/admin-dashboard/users", label: "Users & Security", Icon: FiUsers },
    { href: "/admin-dashboard/videos", label: "Manage Videos", Icon: FiVideo },
    { href: "/admin-dashboard/settings", label: "Settings", Icon: FiSettings },
  ];

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  // Block render until session is loaded
  if (status === "loading" || status === "unauthenticated" || role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative flex">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-64 bg-zinc-950 border-r border-zinc-800 transition-transform duration-300 ease-in-out flex flex-col ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo Header */}
        <div className="h-20 px-6 flex items-center justify-between border-b border-zinc-800 shrink-0">
          <Link href="/admin-dashboard" className="flex items-center gap-3">
            <div>
              <h1 className="text-white font-bold text-[14px] tracking-widest uppercase">
                GymLibrary
              </h1>
              <p className="text-orange-500 text-[10px] tracking-[0.2em] uppercase mt-0.5">
                Admin Panel
              </p>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <p className="px-4 mb-3 text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">
            Menu
          </p>
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              const { Icon } = item;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-[13px] tracking-wide transition-all duration-200 ${
                      isActive
                        ? "bg-orange-500/10 text-orange-500 border border-orange-500/20"
                        : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                    }`}
                  >
                    <Icon className={`w-4.5 h-4.5 ${isActive ? "text-orange-500" : "text-zinc-500"}`} />
                    <span className="flex-1">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Quick Links (Bottom) */}
        <div className="p-4 border-t border-zinc-800 shrink-0">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-2 w-full">
            <Link
              href="/"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs tracking-wide text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all w-full"
            >
              <FiHome className="w-4 h-4 text-zinc-500" />
              Back to Website
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2 mt-1 rounded-lg text-xs tracking-wide text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all w-full"
            >
              <FiLogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="lg:ml-64 flex-1 min-h-screen flex flex-col relative z-10 w-full">
        {/* Top Header */}
        <header className="h-20 bg-black/80 backdrop-blur-md border-b border-zinc-800 sticky top-0 z-30 px-6 lg:px-8 flex items-center justify-between shadow-sm w-full">
          {/* Left Side */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <FiMenu className="w-5 h-5" />
            </button>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* User Info */}
            {session?.user && (
              <div className="flex items-center gap-3 pl-4 py-1">
                {session?.user?.image ? (
                  <img
                    src={session?.user?.image}
                    alt="Admin"
                    className="w-9 h-9 rounded-full border border-zinc-700"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-orange-500 to-orange-400 flex items-center justify-center text-white font-bold text-sm shadow-md">
                    {session?.user?.name?.charAt(0).toUpperCase() || "A"}
                  </div>
                )}
                <div className="text-right hidden sm:block">
                  <p className="text-[13px] font-semibold text-white tracking-wide">
                    {session?.user?.name}
                  </p>
                  <p className="text-[10px] text-orange-500 uppercase tracking-widest">
                    Administrator
                  </p>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

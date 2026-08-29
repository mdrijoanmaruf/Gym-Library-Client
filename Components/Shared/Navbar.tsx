"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { FiArrowRight, FiX, FiChevronRight, FiShield, FiGrid, FiLogOut, FiHome, FiVideo, FiActivity, FiMail } from "react-icons/fi";

const NAV_LINKS = [
  { label: "Home", href: "/", Icon: FiHome },
  { label: "Gym", href: "/gym", Icon: FiVideo },
  { label: "My Workout", href: "/my-workout", Icon: FiActivity },
  { label: "Contact", href: "/contact", Icon: FiMail },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const drawerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdownOpen]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node))
        setMobileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [mobileOpen]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  if (pathname.startsWith("/admin-dashboard")) return null;

  return (
    <>
      <style>{`
        /* shimmer */
        @keyframes shimmer {
          0%   { transform: translateX(-120%); }
          100% { transform: translateX(120%); }
        }
        .cta-btn:hover .shimmer { animation: shimmer 0.65s ease forwards; }

        /* nav fade-in */
        @keyframes navFadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .nav-link { animation: navFadeIn 0.5s ease both; }
        .nav-link:nth-child(1) { animation-delay: 0.06s; }
        .nav-link:nth-child(2) { animation-delay: 0.12s; }
        .nav-link:nth-child(3) { animation-delay: 0.18s; }
        .nav-link:nth-child(4) { animation-delay: 0.24s; }

        /* drawer slide */
        @keyframes drawerIn {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        .drawer { animation: drawerIn 0.38s cubic-bezier(0.22, 1, 0.36, 1) both; }

        /* orange glow button */
        .orange-btn {
          background: linear-gradient(135deg, #ffb347 0%, #ff8c00 50%, #e55a00 100%);
          box-shadow:
            0 0 0 1px rgba(255,140,0,0.3),
            0 4px 20px rgba(255,140,0,0.4),
            0 8px 40px rgba(255,100,0,0.2),
            inset 0 1px 0 rgba(255,255,255,0.2);
          transition: box-shadow 0.25s, transform 0.15s;
        }
        .orange-btn:hover {
          box-shadow:
            0 0 0 1px rgba(255,160,0,0.5),
            0 4px 28px rgba(255,140,0,0.65),
            0 12px 60px rgba(255,100,0,0.3),
            inset 0 1px 0 rgba(255,255,255,0.25);
          transform: scale(1.04) translateY(-1px);
        }
        .orange-btn:active { transform: scale(0.97); }

        /* glossy navbar */
        .navbar-glass {
          background: rgba(8, 8, 12, 0.35);
          backdrop-filter: blur(24px) saturate(180%) brightness(1.05);
          -webkit-backdrop-filter: blur(24px) saturate(180%) brightness(1.05);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          box-shadow:
            0 1px 0 rgba(255,255,255,0.04),
            0 8px 32px rgba(0,0,0,0.5),
            inset 0 1px 0 rgba(255,255,255,0.03);
        }
        .navbar-clear {
          background: rgba(0, 0, 0, 0.08);
          backdrop-filter: blur(8px) saturate(140%);
          -webkit-backdrop-filter: blur(8px) saturate(140%);
          border-bottom: 1px solid transparent;
        }

        /* glossy pill for nav links */
        .nav-pill:hover {
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.08);
          backdrop-filter: blur(8px);
        }
        .nav-pill-active {
          background: rgba(255,140,0,0.1);
          border-color: rgba(255,140,0,0.2);
        }
      `}</style>

      {/* ── TOP GRADIENT LINE ── */}
      <div
        className="fixed top-0 left-0 right-0 z-[60] h-px"
        style={{ background: "linear-gradient(90deg, transparent 0%, rgba(255,140,0,0.8) 30%, rgba(255,200,100,1) 50%, rgba(255,140,0,0.8) 70%, transparent 100%)" }}
      />

      {/* ── NAVBAR ── */}
      <header
        className={`fixed top-px left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "navbar-glass" : "navbar-clear"}`}
      >
        <nav className="max-w-[1440px] mx-auto px-6 lg:px-12 flex items-center justify-between h-[78px]">

          {/* ── LOGO ── */}
          <Link href="/" className="shrink-0 group" aria-label="GymLibrary">
            <Image
              src="/logo.png"
              alt="GymLibrary"
              width={210}
              height={52}
              priority
              className="h-[52px] w-auto object-contain transition-all duration-300 group-hover:scale-[1.04]"
              style={{ filter: "drop-shadow(0 0 18px rgba(255,140,0,0.55)) drop-shadow(0 2px 8px rgba(0,0,0,0.4))" }}
            />
          </Link>

          {/* ── DESKTOP LINKS ── */}
          <ul className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <li key={link.href} className="nav-link">
                  <Link
                    href={link.href}
                    className={`
                      relative flex items-center gap-1.5 px-5 py-2.5 rounded-xl
                      text-[14.5px] font-medium tracking-wide
                      border transition-all duration-200
                      nav-pill
                      ${active
                        ? "text-orange-400 nav-pill-active border-orange-500/20"
                        : "text-zinc-400 hover:text-white border-transparent"
                      }
                    `}
                  >
                    {active && (
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-orange-400 shadow-[0_0_8px_3px_rgba(255,140,0,0.5)]" />
                    )}
                    <span className={`flex items-center gap-2 ${active ? "pl-3.5" : ""}`}>
                      <link.Icon className={`w-4 h-4 ${active ? "text-orange-400" : "text-zinc-400 group-hover:text-white transition-colors"}`} />
                      <span>{link.label}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
            

          </ul>

          {/* ── DESKTOP ACTIONS ── */}
          <div className="hidden lg:flex items-center gap-3">
            {session ? (
              <div className="relative" ref={dropdownRef} onMouseEnter={() => setDropdownOpen(true)} onMouseLeave={() => setDropdownOpen(false)}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={`flex items-center gap-3 px-2 py-2 pr-4 rounded-full border transition-all focus:outline-none text-left ${
                    dropdownOpen 
                      ? "border-orange-500/30 bg-orange-500/10" 
                      : "border-white/10 bg-white/[0.02] hover:bg-white/[0.06]"
                  }`}
                >
                  {session.user?.image ? (
                    <img src={session.user.image} alt={session.user.name || "User"} className="w-9 h-9 rounded-full border border-zinc-700 object-cover shrink-0" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-orange-500 to-orange-400 flex items-center justify-center text-white font-bold border border-orange-500/30 shadow-sm shrink-0">
                      {session.user?.name?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                  <div className="flex flex-col hidden sm:flex">
                    <span className="text-[14px] font-semibold text-white leading-tight">
                      {session.user?.name}
                    </span>
                    <span className="text-[11px] text-zinc-400 leading-tight mt-0.5 max-w-[130px] truncate">
                      {session.user?.email}
                    </span>
                  </div>
                </button>
                
                {/* Profile Dropdown Container with invisible padding to prevent hover loss */}
                {dropdownOpen && (
                  <div className="absolute top-full right-0 pt-2 w-56 z-50">
                    <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-200">
                      <div className="px-4 py-3 border-b border-white/10 bg-white/[0.02]">
                        <p className="text-[14px] font-semibold text-white truncate">{session.user?.name}</p>
                        <p className="text-[12px] text-zinc-400 truncate">{session.user?.email}</p>
                      </div>
                      
                      <div className="py-1">
                        {(session.user as any)?.role === "admin" && (
                          <Link
                            href="/admin-dashboard"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium text-orange-400 hover:bg-orange-500/20 transition-colors"
                          >
                            <FiShield className="w-4 h-4" />
                            Admin Panel
                          </Link>
                        )}
                        <Link
                          href="/my-workout"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
                        >
                          <FiGrid className="w-4 h-4 text-zinc-400" />
                          My Workouts
                        </Link>
                      </div>
                      
                      <div className="py-1 border-t border-white/10">
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            signOut({ callbackUrl: '/' });
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium text-red-400 hover:bg-red-500/20 transition-colors text-left"
                        >
                          <FiLogOut className="w-4 h-4 text-red-400/80" />
                          Log Out
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Ghost Log In */}
                <Link
                  href="/login"
                  className="
                    px-6 py-2.5 rounded-xl text-[14.5px] font-semibold tracking-wide
                    text-zinc-300 hover:text-white
                    border border-white/[0.09] hover:border-white/[0.18]
                    transition-all duration-200 hover:bg-white/[0.04]
                  "
                  style={{ backdropFilter: "blur(8px)" }}
                >
                  Log In
                </Link>

                {/* Orange CTA */}
                <Link
                  href="/register"
                  className="cta-btn relative px-6 py-2.5 rounded-xl text-[14.5px] font-bold tracking-wide text-[#1c0a00] overflow-hidden orange-btn"
                >
                  <span className="shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-[120%]" />
                  <span className="relative z-10 flex items-center gap-2">
                    Get Started
                    <FiArrowRight className="w-4 h-4" />
                  </span>
                </Link>
              </>
            )}
          </div>

          {/* ── HAMBURGER ── */}
          <button
            id="navbar-mobile-toggle"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            className="
              lg:hidden w-11 h-11 flex flex-col justify-center items-center gap-[5px] rounded-xl
              border border-white/[0.09] hover:border-orange-400/40
              transition-all duration-200 hover:bg-white/[0.04]
            "
            style={{ backdropFilter: "blur(8px)" }}
          >
            <span className={`block w-[18px] h-[1.5px] bg-zinc-300 rounded-full transition-all duration-300 ${mobileOpen ? "translate-y-[6.5px] rotate-45" : ""}`} />
            <span className={`block h-[1.5px] bg-zinc-300 rounded-full transition-all duration-300 ${mobileOpen ? "w-0 opacity-0" : "w-[18px]"}`} />
            <span className={`block w-[18px] h-[1.5px] bg-zinc-300 rounded-full transition-all duration-300 ${mobileOpen ? "-translate-y-[6.5px] -rotate-45" : ""}`} />
          </button>
        </nav>

        {/* bottom glass line when scrolled */}
        <div className={`h-px mx-12 transition-opacity duration-500 ${scrolled ? "opacity-100" : "opacity-0"}`}
          style={{ background: "linear-gradient(90deg, transparent, rgba(255,140,0,0.15) 30%, rgba(255,140,0,0.15) 70%, transparent)" }}
        />
      </header>

      {/* ── BACKDROP ── */}
      <div
        onClick={() => setMobileOpen(false)}
        className={`fixed inset-0 z-40 lg:hidden bg-black/65 backdrop-blur-sm transition-opacity duration-300 ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        aria-hidden="true"
      />

      {/* ── MOBILE DRAWER ── */}
      {mobileOpen && (
        <aside
          ref={drawerRef}
          className="drawer fixed top-0 right-0 bottom-0 z-50 w-[320px] lg:hidden flex flex-col"
          style={{
            background: "linear-gradient(160deg, rgba(14,12,18,0.97) 0%, rgba(10,8,14,0.98) 100%)",
            backdropFilter: "blur(40px) saturate(200%)",
            borderLeft: "1px solid rgba(255,255,255,0.06)",
            boxShadow: "-24px 0 80px rgba(0,0,0,0.85)",
          }}
        >
          {/* header */}
          <div className="flex items-center justify-between px-5 h-[78px] shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <Image
              src="/logo.png" alt="GymLibrary" width={160} height={40}
              className="h-[42px] w-auto object-contain"
              style={{ filter: "drop-shadow(0 0 12px rgba(255,140,0,0.45))" }}
            />
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-white/[0.08] text-zinc-500 hover:text-white hover:border-white/20 transition-all duration-200"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* links */}
          <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-1">
            {NAV_LINKS.map((link, i) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  style={{ animationDelay: `${i * 45}ms` }}
                  className={`
                    flex items-center justify-between px-4 py-3.5 rounded-xl
                    text-[15px] font-medium tracking-wide
                    border transition-all duration-200
                    ${active
                      ? "text-orange-400 bg-orange-500/10 border-orange-500/20"
                      : "text-zinc-400 hover:text-white border-transparent hover:bg-white/[0.05] hover:border-white/[0.08]"
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <link.Icon className={`w-5 h-5 ${active ? "text-orange-400" : "text-zinc-500"}`} />
                    <span>{link.label}</span>
                  </div>
                  <FiChevronRight className={`w-4 h-4 ${active ? "text-orange-400" : "text-zinc-600"}`} />
                </Link>
              );
            })}
            
            {(session?.user as any)?.role === "admin" && (
              <Link
                href="/admin-dashboard"
                onClick={() => setMobileOpen(false)}
                className={`
                  flex items-center justify-between px-4 py-3.5 rounded-xl
                  text-[15px] font-medium tracking-wide
                  border transition-all duration-200
                  text-orange-400 bg-orange-500/10 border-orange-500/20
                `}
              >
                <span className="flex items-center gap-2"><FiShield className="w-4 h-4" /> Admin Panel</span>
                <FiChevronRight className="w-4 h-4 text-orange-400" />
              </Link>
            )}
          </nav>

          {/* CTAs */}
          <div className="px-5 py-6 space-y-3 shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            {session ? (
              <>
                <div className="flex items-center gap-3 py-3 px-4 rounded-xl border border-white/[0.1] bg-white/[0.02]">
                  {session.user?.image ? (
                    <img src={session.user.image} alt="User" className="w-10 h-10 rounded-full border border-zinc-700 object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-500 to-orange-400 flex items-center justify-center text-white font-bold border border-orange-500/30">
                      {session.user?.name?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-[15px] font-medium text-white leading-tight">{session.user?.name}</span>
                    <span className="text-[12px] text-zinc-400 leading-tight mt-0.5 truncate max-w-[160px]">{session.user?.email}</span>
                  </div>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="block w-full text-center py-3 rounded-xl text-[15px] font-semibold text-zinc-400 border border-white/[0.1] hover:border-white/20 hover:text-white hover:bg-white/[0.05] transition-all duration-200"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full text-center py-3 rounded-xl text-[15px] font-semibold text-zinc-300 border border-white/[0.1] hover:border-white/20 hover:text-white hover:bg-white/[0.05] transition-all duration-200"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="cta-btn relative block w-full text-center py-3 rounded-xl text-[15px] font-bold text-[#1c0a00] overflow-hidden orange-btn"
                >
                  <span className="shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-[120%]" />
                  <span className="relative z-10 flex items-center justify-center gap-2">Get Started <FiArrowRight className="w-4 h-4" /></span>
                </Link>
              </>
            )}
          </div>

          {/* ambient glows */}
          <div className="absolute bottom-10 right-4 w-48 h-48 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(255,140,0,0.08) 0%, transparent 70%)", filter: "blur(30px)" }} />
          <div className="absolute top-1/3 -left-8 w-32 h-32 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(255,100,0,0.06) 0%, transparent 70%)", filter: "blur(20px)" }} />
        </aside>
      )}
    </>
  );
}

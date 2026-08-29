"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { FiGithub, FiTwitter, FiInstagram, FiYoutube, FiMail, FiGlobe } from "react-icons/fi";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Gym Library", href: "/gym" },
  { label: "My Workout", href: "/my-workout" },
  { label: "Contact", href: "/contact" },
];

const SOCIAL_LINKS = [
  { Icon: FiGithub, href: "https://github.com/mdrijoanmaruf", label: "GitHub" },
  { Icon: FiMail, href: "mailto:rijoanmaruf@gmail.com", label: "Email" },
  { Icon: FiGlobe, href: "https://rijoan.com", label: "Website" },
];

export default function Footer() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin-dashboard")) return null;

  return (
    <footer className="relative z-10 mt-auto border-t border-white/[0.06]">
      {/* Top gradient line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,140,0,0.5) 30%, rgba(255,200,100,0.9) 50%, rgba(255,140,0,0.5) 70%, transparent 100%)",
        }}
      />

      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-12">
        {/* Top Row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-10 border-b border-white/[0.06]">
          {/* Logo + Tagline */}
          <div className="space-y-3">
            <Link href="/" aria-label="GymLibrary">
              <Image
                src="/logo.png"
                alt="GymLibrary"
                width={180}
                height={44}
                className="h-[42px] w-auto object-contain"
                style={{
                  filter:
                    "drop-shadow(0 0 14px rgba(255,140,0,0.45)) drop-shadow(0 2px 6px rgba(0,0,0,0.3))",
                }}
              />
            </Link>
            <p className="text-zinc-400 text-sm max-w-xs leading-relaxed">
              Every exercise. Perfect form. One library.
              <br />
              Built for lifters who take training seriously.
            </p>
          </div>

          {/* Nav Links */}
          <nav>
            <ul className="flex flex-wrap gap-x-7 gap-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[14px] font-medium text-zinc-400 hover:text-orange-400 transition-colors duration-200 tracking-wide"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Social Icons */}
          <div className="flex items-center gap-3">
            {SOCIAL_LINKS.map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="w-9 h-9 flex items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-zinc-400 hover:text-orange-400 hover:border-orange-500/30 hover:bg-orange-500/10 transition-all duration-200"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Bottom Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-7">
          <p className="text-zinc-500 text-[13px]">
            © {new Date().getFullYear()} GymLibrary. All rights reserved.
          </p>
          <p className="text-zinc-500 text-[13px]">
            Developed by{" "}
            <a
              href="https://rijoan.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-400 hover:text-orange-300 transition-colors font-medium"
            >
              Md Rijoan Maruf
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 - Page Not Found | GymLibrary",
  description: "The page you are looking for does not exist.",
};

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
      {/* Decorative Glow Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-orange-500/20 rounded-full blur-[80px] pointer-events-none -z-10" />

      {/* Content */}
      <h1 className="text-[120px] md:text-[180px] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-600 leading-none">
        404
      </h1>
      
      <h2 className="text-2xl md:text-3xl font-bold text-white mt-4 mb-2 tracking-wide">
        Page Not Found
      </h2>
      
      <p className="text-zinc-400 text-[15px] max-w-[400px] mb-8 leading-relaxed">
        It looks like you've lifted too heavy and ended up in an unknown territory. Let's get you back to the gym.
      </p>

      {/* Return Home Button */}
      <Link
        href="/"
        className="group relative inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-[15px] font-bold text-black overflow-hidden bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 transition-all shadow-[0_0_20px_rgba(255,140,0,0.3)] hover:shadow-[0_0_30px_rgba(255,140,0,0.5)]"
      >
        <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
        <span className="relative z-10 flex items-center gap-2">
          <FiArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          Back to Home
        </span>
      </Link>
    </div>
  );
}

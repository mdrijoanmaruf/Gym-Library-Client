"use client";

import { useSession } from "next-auth/react";

export default function GymPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center text-zinc-400">
        Loading...
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400">
        Access Denied. Please log in.
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 px-6 lg:px-12 max-w-[1440px] mx-auto text-zinc-100 relative">
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full opacity-20 blur-[120px] pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(255,140,0,0.8) 0%, transparent 70%)" }}
      />
      <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 text-white relative z-10">
        Welcome to the <span className="text-orange-400">GYM</span>, {session.user?.name}!
      </h1>
      <p className="text-lg text-zinc-400 max-w-2xl relative z-10">
        This is your dashboard. Soon you will see all the exercises, categories, and media assets available to you.
      </p>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { FiMail, FiLock, FiUser, FiArrowRight } from "react-icons/fi";
import { FaGoogle } from "react-icons/fa";

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Hit our backend register endpoint
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // 2. Automatically sign them in
      const signInRes = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (signInRes?.error) {
        setError("Account created but failed to log in automatically.");
      } else {
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center pt-20 px-6 relative overflow-hidden">
      
      {/* Background glow for the form */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[600px] h-[500px] rounded-full opacity-20 blur-[120px]"
        style={{ background: "radial-gradient(circle, rgba(255,140,0,0.8) 0%, transparent 70%)", pointerEvents: "none" }}
      />

      {/* Form Card */}
      <div className="relative w-full max-w-[420px] p-8 sm:p-10 rounded-3xl"
        style={{
          background: "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
          backdropFilter: "blur(20px)"
        }}>
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">
            Create Account
          </h1>
          <p className="text-sm text-zinc-400">
            Join the #1 exercise reference platform today.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          {/* Name Input */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold text-zinc-300 ml-1">Full Name</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-zinc-500 group-focus-within:text-orange-400 transition-colors">
                <FiUser className="w-4 h-4" />
              </div>
              <input 
                type="text" 
                placeholder="Enter your name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3.5 rounded-xl text-[14px] text-white placeholder-zinc-500 outline-none transition-all duration-200"
                style={{
                  background: "rgba(0,0,0,0.4)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.2)"
                }}
                onFocus={(e) => e.target.style.borderColor = "rgba(255,140,0,0.5)"}
                onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
              />
            </div>
          </div>

          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold text-zinc-300 ml-1">Email Address</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-zinc-500 group-focus-within:text-orange-400 transition-colors">
                <FiMail className="w-4 h-4" />
              </div>
              <input 
                type="email" 
                placeholder="Enter your email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3.5 rounded-xl text-[14px] text-white placeholder-zinc-500 outline-none transition-all duration-200"
                style={{
                  background: "rgba(0,0,0,0.4)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.2)"
                }}
                onFocus={(e) => e.target.style.borderColor = "rgba(255,140,0,0.5)"}
                onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5 pb-2">
            <label className="text-[13px] font-semibold text-zinc-300 ml-1">Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-zinc-500 group-focus-within:text-orange-400 transition-colors">
                <FiLock className="w-4 h-4" />
              </div>
              <input 
                type="password" 
                placeholder="Enter your password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3.5 rounded-xl text-[14px] text-white placeholder-zinc-500 outline-none transition-all duration-200"
                style={{
                  background: "rgba(0,0,0,0.4)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.2)"
                }}
                onFocus={(e) => e.target.style.borderColor = "rgba(255,140,0,0.5)"}
                onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-[14px] text-[#1c0a00] tracking-wide transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100"
            style={{
              background: "linear-gradient(135deg, #ffb347 0%, #ff8c00 50%, #e55a00 100%)",
              boxShadow: "0 0 0 1px rgba(255,140,0,0.3), 0 4px 20px rgba(255,140,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)"
            }}
          >
            {loading ? "Creating Account..." : "Create Account"}
            {!loading && <FiArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-white/10" />
          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Or</span>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-white/10" />
        </div>

        {/* Google Button */}
        <button 
          type="button" 
          onClick={() => signIn("google")}
          className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl font-semibold text-[14px] text-zinc-200 transition-all duration-200 hover:-translate-y-[1px]"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
        >
          <FaGoogle className="w-4 h-4 text-white" />
          Continue with Google
        </button>

        {/* Footer Links */}
        <p className="mt-8 text-center text-[13px] text-zinc-500">
          Already have an account?{" "}
          <Link href="/login" className="text-orange-400 font-semibold hover:text-orange-300 hover:underline underline-offset-2 transition-colors">
            Log In
          </Link>
        </p>

      </div>
    </div>
  );
}

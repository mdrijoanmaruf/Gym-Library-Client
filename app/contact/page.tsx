"use client";

import { useState } from "react";
import { FiMail, FiPhone, FiMapPin, FiSend, FiMessageSquare, FiFileText } from "react-icons/fi";
import Swal from "sweetalert2";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) throw new Error("Failed to send message");
      
      Swal.fire({
        title: "Message Sent!",
        text: "We will get back to you soon.",
        icon: "success",
        confirmButtonColor: "#f97316"
      });
      setFormData({ name: "", email: "", message: "" });
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: "Error",
        text: "Something went wrong. Please try again.",
        icon: "error",
        confirmButtonColor: "#ef4444"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-24 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-600">Touch</span>
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Have a question, feedback, or need help with a custom exercise program? We'd love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Contact Info Cards */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Email Card */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl flex items-start gap-4 group hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 bg-orange-500/10 text-orange-400 rounded-xl flex items-center justify-center shrink-0 border border-orange-500/20 group-hover:scale-110 transition-transform">
                <FiMail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-white font-bold mb-1">Email Us</h3>
                <p className="text-sm text-zinc-400 hover:text-orange-400 transition-colors">
                  <a href="mailto:contact@bytewaveinternational.com">contact@bytewaveinternational.com</a>
                </p>
                <p className="text-sm text-zinc-400 hover:text-orange-400 transition-colors mt-1">
                  <a href="mailto:info@bytewaveinternational.com">info@bytewaveinternational.com</a>
                </p>
              </div>
            </div>

            {/* Phone Card */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl flex items-start gap-4 group hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 bg-orange-500/10 text-orange-400 rounded-xl flex items-center justify-center shrink-0 border border-orange-500/20 group-hover:scale-110 transition-transform">
                <FiPhone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-white font-bold mb-1">Call Us</h3>
                <p className="text-sm text-zinc-400 hover:text-orange-400 transition-colors">
                  <a href="tel:+8801813606468">+8801813606468</a>
                </p>
              </div>
            </div>

            {/* Address Card */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl flex items-start gap-4 group hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 bg-orange-500/10 text-orange-400 rounded-xl flex items-center justify-center shrink-0 border border-orange-500/20 group-hover:scale-110 transition-transform">
                <FiMapPin className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold mb-1">Visit Us</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Road 7, Block C<br />
                  Bashundhara R/A, Dhaka
                </p>
                <a href="#" className="inline-block mt-3 text-sm font-semibold text-orange-500 hover:text-orange-400 group-hover:underline">
                  Get Directions &rarr;
                </a>
              </div>
            </div>

          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-8 bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            
            {/* Form Header */}
            <div className="flex border-b border-white/10">
              <div className="flex-1 py-5 px-4 text-sm font-bold flex items-center justify-center gap-2 text-orange-400 border-b-2 border-orange-500 bg-orange-500/5">
                <FiMessageSquare className="w-4 h-4" /> Send a Message
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8 sm:p-10 space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Your Name</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Rijoan maruf"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Email Address</label>
                  <div className="relative">
                    <input 
                      type="email" 
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="rijoanmaruf@gmail.com"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Your Message</label>
                <div className="relative">
                  <textarea 
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={6}
                    placeholder="Tell us about your project..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all resize-none"
                  ></textarea>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-black hover:opacity-90 transition-opacity shadow-[0_0_30px_rgba(249,115,22,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                ) : (
                  <FiSend className="w-5 h-5" />
                )}
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
}

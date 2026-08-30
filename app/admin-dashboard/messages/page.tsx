"use client";

import { useState, useEffect } from "react";
import { FiMail, FiCheck, FiTrash2, FiMessageCircle } from "react-icons/fi";
import Swal from "sweetalert2";

interface Message {
  _id: string;
  name: string;
  email: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function MessagesAdminPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/messages");
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/messages/${id}`, { method: "PATCH" });
      if (res.ok) {
        setMessages((prev) => prev.map((m) => (m._id === id ? { ...m, isRead: true } : m)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteMessage = async (id: string) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#3f3f46",
      confirmButtonText: "Yes, delete it!",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(`/api/messages/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m._id !== id));
        Swal.fire({ title: "Deleted!", icon: "success", confirmButtonColor: "#f97316" });
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            Messages
            {messages.filter(m => !m.isRead).length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-500 text-black">
                {messages.filter(m => !m.isRead).length} New
              </span>
            )}
          </h2>
          <p className="text-zinc-400 mt-2">View and manage contact form submissions.</p>
        </div>
      </div>

      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-24 bg-white/5 border border-white/10 rounded-2xl">
            <FiMessageCircle className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
            <p className="text-zinc-400 font-medium">No messages found.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg._id} 
              className={`p-6 rounded-2xl border transition-all ${
                msg.isRead 
                  ? "bg-white/5 border-white/10" 
                  : "bg-orange-500/5 border-orange-500/30 shadow-[0_0_20px_rgba(249,115,22,0.1)]"
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-white text-lg">{msg.name}</h3>
                    {!msg.isRead && (
                      <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                    )}
                  </div>
                  <p className="text-orange-400 text-sm">
                    <a href={`mailto:${msg.email}`} className="hover:underline flex items-center gap-1.5">
                      <FiMail className="w-3.5 h-3.5" /> {msg.email}
                    </a>
                  </p>
                  <p className="text-xs text-zinc-500 font-medium">
                    {new Date(msg.createdAt).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {!msg.isRead && (
                    <button
                      onClick={() => markAsRead(msg._id)}
                      className="p-2 bg-orange-500/10 text-orange-400 hover:bg-orange-500 hover:text-black rounded-lg transition-colors border border-orange-500/20"
                      title="Mark as read"
                    >
                      <FiCheck className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteMessage(msg._id)}
                    className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-black rounded-lg transition-colors border border-red-500/20"
                    title="Delete message"
                  >
                    <FiTrash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="mt-6 p-4 bg-black/40 rounded-xl border border-white/5">
                <p className="text-zinc-300 whitespace-pre-wrap leading-relaxed text-sm">
                  {msg.message}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

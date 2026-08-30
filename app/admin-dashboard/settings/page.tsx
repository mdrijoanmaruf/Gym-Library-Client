"use client";

import { useState, useRef } from "react";
import { FiSave, FiUser, FiLock, FiBell, FiShield, FiGlobe, FiDatabase, FiUploadCloud } from "react-icons/fi";
import { useSession } from "next-auth/react";

export default function AdminSettingsPage() {
  const { data: session, update } = useSession();
  const [activeTab, setActiveTab] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const provider = (session?.user as any)?.provider;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert("Settings saved successfully!");
    }, 1000);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      // 1. Get presigned URL and image key from our backend proxy
      const urlRes = await fetch("/api/users/avatar/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType: file.type }),
      });
      
      if (!urlRes.ok) throw new Error("Failed to get upload URL");
      const { uploadUrl, publicUrl } = await urlRes.json();

      // 2. Upload file directly to Cloudflare R2
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!uploadRes.ok) throw new Error("Failed to upload to storage");

      // 3. Update user profile with the new public URL
      const updateRes = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: publicUrl }),
      });

      if (!updateRes.ok) throw new Error("Failed to update profile");

      await update({ image: publicUrl });

      alert("Avatar updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update avatar.");
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: FiUser },
    { id: "security", label: "Security", icon: FiLock },
    { id: "platform", label: "Platform", icon: FiGlobe },
    { id: "notifications", label: "Notifications", icon: FiBell },
  ];

  return (
    <div className="max-w-full mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">System Settings</h2>
        <p className="text-zinc-400 text-sm mt-1">Manage your account preferences and global platform configurations.</p>
      </div>

      <div className="flex flex-col gap-6">
        
        {/* Top Navigation */}
        <nav className="flex flex-row gap-3 overflow-x-auto pb-4 scrollbar-hide border-b border-white/10">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-5 py-3 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-orange-500/10 text-orange-400 border border-orange-500/20 shadow-[0_0_20px_rgba(255,140,0,0.1)]"
                  : "text-zinc-400 hover:bg-white/[0.04] hover:text-white border border-transparent"
              }`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? "text-orange-500" : "text-zinc-500"}`} />
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Content Area */}
        <main className="flex-1 bg-white/[0.02] border border-white/10 rounded-3xl p-4 lg:p-6 shadow-xl">
          <form onSubmit={handleSave}>
            
            {/* Profile Settings */}
            {activeTab === "profile" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center gap-4 mb-8">
                  {session?.user?.image ? (
                    <img src={session.user.image} alt="Avatar" className="w-20 h-20 rounded-full object-cover shadow-lg border-2 border-orange-500/30" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-orange-500 to-orange-400 flex items-center justify-center text-white text-2xl font-bold shadow-lg border-2 border-orange-500/30">
                      {session?.user?.name?.charAt(0).toUpperCase() || "A"}
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-bold text-white">Profile Picture</h3>
                    <p className="text-xs text-zinc-500 mt-1">PNG, JPG up to 5MB.</p>
                    <input 
                      type="file" 
                      accept="image/*" 
                      ref={fileInputRef} 
                      className="hidden" 
                      onChange={handleAvatarUpload}
                    />
                    <button 
                      type="button" 
                      disabled={uploadingAvatar}
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-3 flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors disabled:opacity-50"
                    >
                      {uploadingAvatar ? (
                        <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      ) : (
                        <FiUploadCloud className="w-3 h-3" />
                      )}
                      {uploadingAvatar ? "Uploading..." : "Change Avatar"}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Full Name</label>
                    <input 
                      type="text" 
                      defaultValue={session?.user?.name || ""}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-orange-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Email Address</label>
                    <input 
                      type="email" 
                      defaultValue={session?.user?.email || ""}
                      disabled
                      className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-zinc-500 cursor-not-allowed"
                    />
                    <p className="text-[10px] text-zinc-500 mt-1">Email cannot be changed directly.</p>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Bio / Notes</label>
                    <textarea 
                      rows={3}
                      placeholder="Add some notes about your administrative role..."
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-orange-500 focus:outline-none transition-colors resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === "security" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="mb-6 pb-6 border-b border-white/10">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <FiShield className="text-orange-500" />
                    Security
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">Manage your password and authentication methods.</p>
                </div>
                
                {provider === "google" ? (
                  <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 max-w-md">
                    <h4 className="text-sm font-bold text-blue-400 mb-1">Managed by Google</h4>
                    <p className="text-xs text-blue-300">
                      Your account is authenticated using Google. You cannot change your password here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 max-w-md">
                    <h4 className="text-sm font-bold text-white mb-4">Change Password</h4>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Current Password</label>
                      <input 
                        type="password" 
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-orange-500 focus:outline-none transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">New Password</label>
                      <input 
                        type="password" 
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-orange-500 focus:outline-none transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Confirm New Password</label>
                      <input 
                        type="password" 
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-orange-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Platform Settings */}
            {activeTab === "platform" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="mb-6 pb-6 border-b border-white/10">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <FiDatabase className="text-orange-500" />
                    Global Platform Config
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">These settings affect all users on GymLibrary.</p>
                </div>

                <div className="space-y-6">
                  {/* Toggle 1 */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-black/30 border border-white/5 hover:border-white/10 transition-colors">
                    <div>
                      <h4 className="text-sm font-bold text-white mb-0.5">Allow Public Registrations</h4>
                      <p className="text-xs text-zinc-500">Allow new users to sign up from the homepage.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                    </label>
                  </div>

                  {/* Toggle 2 */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-black/30 border border-white/5 hover:border-white/10 transition-colors">
                    <div>
                      <h4 className="text-sm font-bold text-white mb-0.5">Maintenance Mode</h4>
                      <p className="text-xs text-zinc-500">Disable access to the platform for all non-admin users.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                    </label>
                  </div>

                  {/* Settings Input */}
                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Support Email Address</label>
                    <input 
                      type="email" 
                      defaultValue="support@gymlibrary.com"
                      className="w-full max-w-md bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-orange-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Notifications */}
            {activeTab === "notifications" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="mb-6 pb-6 border-b border-white/10">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <FiBell className="text-orange-500" />
                    Alerts & Notifications
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">Control what you get notified about as an administrator.</p>
                </div>

                <div className="space-y-4">
                  {[
                    { id: 'n1', title: 'New User Registrations', desc: 'Get an email when a new user signs up.' },
                    { id: 'n2', title: 'System Errors', desc: 'Receive alerts for critical backend failures.' },
                    { id: 'n3', title: 'Weekly Reports', desc: 'Receive a summary of platform usage every Sunday.' },
                  ].map((notif) => (
                    <div key={notif.id} className="flex items-center gap-4 p-4 rounded-xl bg-black/30 border border-white/5">
                      <input 
                        type="checkbox" 
                        id={notif.id}
                        defaultChecked
                        className="w-5 h-5 rounded border-white/20 bg-black/50 text-orange-500 focus:ring-orange-500 focus:ring-offset-black accent-orange-500 cursor-pointer" 
                      />
                      <label htmlFor={notif.id} className="flex-1 cursor-pointer">
                        <h4 className="text-sm font-bold text-white mb-0.5">{notif.title}</h4>
                        <p className="text-xs text-zinc-500">{notif.desc}</p>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="mt-10 pt-6 border-t border-white/10 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-orange-500 to-amber-500 text-black hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(255,140,0,0.2)] disabled:opacity-50"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                ) : (
                  <FiSave className="w-4 h-4" />
                )}
                {saving ? "Saving..." : "Save Settings"}
              </button>
            </div>

          </form>
        </main>
      </div>

    </div>
  );
}

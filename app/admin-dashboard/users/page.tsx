"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  FiSearch,
  FiShield,
  FiUser,
  FiMail,
  FiCalendar,
  FiLoader,
  FiFilter,
  FiStar,
  FiLock,
  FiX,
} from "react-icons/fi";
import { Toast, Alert } from "@/lib/swal";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "moderator" | "user";
  is_admin: boolean;
  image?: string;
  createdAt: string;
  last_login?: string;
}

export default function UsersPage() {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  const superAdminEmail = "rijoanmaruf@gmail.com";

  useEffect(() => {
    if (status === "loading") return;
    if (status === "authenticated") {
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [status, roleFilter]);

  useEffect(() => {
    // Filter users based on search query
    if (searchQuery.trim() === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
      setCurrentPage(1); // Reset to first page when searching
    }
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const url =
        roleFilter === "all"
          ? "/api/auth/users"
          : `/api/auth/users?role=${roleFilter}`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        setUsers(data.users);
        setFilteredUsers(data.users);
      } else {
        Alert.fire({ icon: "error", title: "Failed to fetch users", text: data.error });
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      Alert.fire({ icon: "error", title: "Error", text: "Something went wrong." });
    } finally {
      setLoading(false);
    }
  };

  const toggleUserRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    
    // Safety confirm
    const confirm = await Alert.fire({
      title: `Make this user an ${newRole}?`,
      text: "They will have access to the dashboard if made an admin.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, update it!",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(`/api/auth/users/${userId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await res.json();

      if (data.success) {
        Toast.fire({ icon: "success", title: `User role updated to ${newRole}` });
        fetchUsers();
      } else {
        Alert.fire({ icon: "error", title: "Failed", text: data.error });
      }
    } catch (error) {
      console.error("Error updating role:", error);
      Alert.fire({ icon: "error", title: "Error", text: "Something went wrong." });
    }
  };

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-wide">Users Management</h1>
        <p className="text-[13px] text-white/50 mt-1 tracking-wide">
          Manage all registered users and their roles
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
        <div className="flex flex-col xl:flex-row gap-4 items-stretch xl:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 w-4 h-4 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-10 py-3 text-sm bg-black/20 border border-white/10 text-white placeholder-white/30 rounded-xl focus:outline-none focus:border-orange-500/50 focus:bg-black/40 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/80 transition-colors"
                aria-label="Clear search"
              >
                <FiX className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Role Tabs */}
          <div className="flex items-center gap-1.5 bg-black/20 rounded-xl p-1.5 border border-white/5 overflow-x-auto shrink-0">
            {[
              { value: "all", label: "All", Icon: FiFilter },
              { value: "user", label: "Users", Icon: FiUser },
              { value: "admin", label: "Admins", Icon: FiShield },
            ].map(({ value, label, Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setRoleFilter(value as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wider transition-all duration-300 whitespace-nowrap ${
                  roleFilter === value
                    ? "bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-md shadow-orange-500/20"
                    : "text-white/40 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          {/* Stats Pills & Result count */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl">
              <FiUser className="w-4 h-4 text-white/40" />
              <span className="text-[13px] font-semibold text-white/70">
                {users.filter((u) => u.role === "user").length} Users
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 bg-orange-500/10 border border-orange-500/20 rounded-xl">
              <FiShield className="w-4 h-4 text-orange-400" />
              <span className="text-[13px] font-semibold text-orange-400">
                {users.filter((u) => u.role === "admin").length} Admins
              </span>
            </div>
            <p className="text-xs text-white/40 tracking-wide hidden sm:block ml-2">
              {searchQuery || roleFilter !== "all" ? (
                <>
                  <span className="font-bold text-white">{filteredUsers.length}</span> of {users.length} users
                </>
              ) : (
                <>
                  <span className="font-bold text-white">{users.length}</span> total users
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl shadow-xl overflow-hidden backdrop-blur-md">
        {loading ? (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left">
              <thead className="bg-black/40 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-[11px] font-semibold text-white/40 uppercase tracking-widest">
                    User
                  </th>
                  <th className="px-6 py-4 text-[11px] font-semibold text-white/40 uppercase tracking-widest">
                    Email
                  </th>
                  <th className="px-6 py-4 text-[11px] font-semibold text-white/40 uppercase tracking-widest">
                    Role
                  </th>
                  <th className="px-6 py-4 text-[11px] font-semibold text-white/40 uppercase tracking-widest">
                    Joined Date
                  </th>
                  <th className="px-6 py-4 text-[11px] font-semibold text-white/40 uppercase tracking-widest text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10"></div>
                        <div className="space-y-2">
                          <div className="h-3 w-28 bg-white/10 rounded"></div>
                          <div className="h-2 w-16 bg-white/5 rounded"></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-3 w-40 bg-white/5 rounded"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-6 w-20 bg-white/5 rounded-full border border-white/10"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-3 w-24 bg-white/5 rounded"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end">
                        <div className="h-7 w-24 bg-white/5 rounded-lg border border-white/10"></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : currentUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-white/40">
            <FiSearch className="w-8 h-8 mb-3 opacity-20" />
            <p className="text-sm font-medium tracking-wide text-white/60">No users found</p>
            <p className="text-[11px] mt-1 tracking-wider uppercase">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left">
                <thead className="bg-black/40 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-[11px] font-semibold text-white/40 uppercase tracking-widest">
                      User
                    </th>
                    <th className="px-6 py-4 text-[11px] font-semibold text-white/40 uppercase tracking-widest">
                      Email
                    </th>
                    <th className="px-6 py-4 text-[11px] font-semibold text-white/40 uppercase tracking-widest">
                      Role
                    </th>
                    <th className="px-6 py-4 text-[11px] font-semibold text-white/40 uppercase tracking-widest">
                      Joined Date
                    </th>
                    <th className="px-6 py-4 text-[11px] font-semibold text-white/40 uppercase tracking-widest text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {currentUsers.map((user) => {
                    const isSuper = user.email === superAdminEmail;
                    return (
                      <tr
                        key={user._id}
                        className={`transition-colors duration-200 group ${
                          isSuper
                            ? "bg-orange-500/5 hover:bg-orange-500/10"
                            : user.role === "admin"
                            ? "hover:bg-white/5"
                            : "hover:bg-white/[0.02]"
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-4">
                            {user.image ? (
                              <img
                                src={user.image}
                                alt={user.name}
                                className={`w-10 h-10 rounded-full object-cover shrink-0 ${
                                  isSuper ? "ring-2 ring-orange-500 ring-offset-2 ring-offset-[#060e1c]" : "border border-white/10"
                                }`}
                              />
                            ) : (
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md ${
                                  isSuper
                                    ? "bg-gradient-to-tr from-orange-400 to-orange-500 ring-2 ring-orange-500 ring-offset-2 ring-offset-[#060e1c]"
                                    : user.role === "admin"
                                    ? "bg-gradient-to-tr from-blue-600 to-indigo-800"
                                    : "bg-gradient-to-tr from-gray-600 to-gray-800"
                                }`}
                              >
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-sm text-white tracking-wide flex items-center gap-2">
                                {user.name}
                                {isSuper && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold tracking-widest uppercase bg-orange-500/20 text-orange-400 border border-orange-500/30">
                                    <FiStar className="w-2.5 h-2.5" />
                                    Super Admin
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-[13px] text-white/60 group-hover:text-white/80 transition-colors">
                            <FiMail className="w-3.5 h-3.5 text-white/30" />
                            {user.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {isSuper ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-orange-500/20 text-orange-400 border border-orange-500/30 shadow-inner">
                              <FiStar className="w-3 h-3" />
                              Super Admin
                            </span>
                          ) : (
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide border shadow-inner ${
                                user.role === "admin"
                                  ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                  : "bg-white/5 text-white/60 border-white/10"
                              }`}
                            >
                              {user.role === "admin" ? (
                                <FiShield className="w-3 h-3" />
                              ) : (
                                <FiUser className="w-3 h-3" />
                              )}
                              <span className="capitalize">{user.role}</span>
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-[13px] text-white/60 group-hover:text-white/80 transition-colors">
                            <FiCalendar className="w-3.5 h-3.5 text-white/30" />
                            {formatDate(user.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isSuper ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold tracking-widest uppercase text-orange-400 bg-orange-500/10 border border-orange-500/20 rounded-lg cursor-not-allowed">
                                <FiLock className="w-3 h-3" />
                                Protected
                              </span>
                            ) : user.role === "admin" ? (
                              <button
                                type="button"
                                onClick={() => toggleUserRole(user._id, user.role)}
                                className="px-3 py-1.5 text-[11px] font-bold tracking-widest uppercase text-white/70 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white rounded-lg transition-all active:scale-95"
                              >
                                Remove Admin
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => toggleUserRole(user._id, user.role)}
                                className="px-3 py-1.5 text-[11px] font-bold tracking-widest uppercase text-black bg-gradient-to-r from-orange-400 to-orange-500 shadow-md shadow-orange-500/20 hover:shadow-orange-500/40 rounded-lg transition-all active:scale-95"
                              >
                                Make Admin
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-white/10 bg-black/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-white/40 tracking-wide">
                  Showing <span className="text-white/80 font-medium">{indexOfFirstUser + 1}</span> to{" "}
                  <span className="text-white/80 font-medium">
                    {Math.min(indexOfLastUser, filteredUsers.length)}
                  </span>{" "}
                  of <span className="text-white/80 font-medium">{filteredUsers.length}</span> users
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest border border-white/10 rounded-lg text-white/60 hover:bg-white/5 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    Prev
                  </button>
                  <div className="flex items-center gap-1">
                    {[...Array(totalPages)].map((_, index) => (
                      <button
                        type="button"
                        key={index + 1}
                        onClick={() => paginate(index + 1)}
                        className={`w-7 h-7 flex items-center justify-center text-xs rounded-lg font-medium transition-all ${
                          currentPage === index + 1
                            ? "bg-orange-500 text-black shadow-md shadow-orange-500/20"
                            : "border border-white/10 text-white/50 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest border border-white/10 rounded-lg text-white/60 hover:bg-white/5 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

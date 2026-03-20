"use client";

import { useAuthStore } from "@/lib/auth";
import { BarChart3, TrendingUp, Users, Code, MessageSquare } from "lucide-react";

export default function AdminAnalyticsPage() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === "ADMIN";

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-100 mb-2">Access Denied</h1>
          <p className="text-slate-400">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  // Mock data - in real app this would come from API
  const stats = {
    totalUsers: 1250,
    activeUsers: 890,
    totalProblems: 450,
    totalSubmissions: 15420,
    totalDiscussions: 320,
    userGrowth: 12.5,
    submissionGrowth: 8.3,
    problemGrowth: 15.2,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100">Analytics Dashboard</h1>
        <p className="text-slate-400 mt-2">Platform statistics and insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-surface-2 rounded-lg border border-surface-3 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Users</p>
              <p className="text-2xl font-bold text-slate-100">{stats.totalUsers.toLocaleString()}</p>
            </div>
            <Users className="w-8 h-8 text-blue-400" />
          </div>
          <div className="flex items-center mt-2">
            <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
            <span className="text-green-400 text-sm">+{stats.userGrowth}%</span>
          </div>
        </div>

        <div className="bg-surface-2 rounded-lg border border-surface-3 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Active Users</p>
              <p className="text-2xl font-bold text-slate-100">{stats.activeUsers.toLocaleString()}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-green-400" />
          </div>
          <div className="flex items-center mt-2">
            <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
            <span className="text-green-400 text-sm">+8.2%</span>
          </div>
        </div>

        <div className="bg-surface-2 rounded-lg border border-surface-3 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Problems</p>
              <p className="text-2xl font-bold text-slate-100">{stats.totalProblems.toLocaleString()}</p>
            </div>
            <Code className="w-8 h-8 text-purple-400" />
          </div>
          <div className="flex items-center mt-2">
            <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
            <span className="text-green-400 text-sm">+{stats.problemGrowth}%</span>
          </div>
        </div>

        <div className="bg-surface-2 rounded-lg border border-surface-3 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Submissions</p>
              <p className="text-2xl font-bold text-slate-100">{stats.totalSubmissions.toLocaleString()}</p>
            </div>
            <MessageSquare className="w-8 h-8 text-orange-400" />
          </div>
          <div className="flex items-center mt-2">
            <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
            <span className="text-green-400 text-sm">+{stats.submissionGrowth}%</span>
          </div>
        </div>
      </div>

      {/* Charts and Detailed Analytics */}
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-surface-2 rounded-lg border border-surface-3 p-6">
          <h2 className="text-xl font-semibold text-slate-100 mb-4">User Activity</h2>
          <div className="h-64 flex items-center justify-center text-slate-400">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Activity chart would be displayed here</p>
            </div>
          </div>
        </div>

        <div className="bg-surface-2 rounded-lg border border-surface-3 p-6">
          <h2 className="text-xl font-semibold text-slate-100 mb-4">Problem Difficulty Distribution</h2>
          <div className="h-64 flex items-center justify-center text-slate-400">
            <div className="text-center">
              <Code className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Difficulty distribution chart would be displayed here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useAuthStore } from "@/lib/auth";
import { Settings, Save } from "lucide-react";
import { useState } from "react";

export default function AdminSettingsPage() {
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

  const [settings, setSettings] = useState({
    siteName: "CodeQuest",
    siteDescription: "A competitive programming platform",
    maxSubmissionRate: 10,
    enableRegistration: true,
    enableDiscussions: true,
    maintenanceMode: false,
  });

  const handleSave = () => {
    // In real app, this would save to API
    alert("Settings saved successfully!");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Platform Settings</h1>
          <p className="text-slate-400 mt-2">Configure platform settings</p>
        </div>
        <button onClick={handleSave} className="btn-primary flex items-center gap-2">
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>

      <div className="space-y-8">
        {/* General Settings */}
        <div className="bg-surface-2 rounded-lg border border-surface-3 p-6">
          <h2 className="text-xl font-semibold text-slate-100 mb-6">General Settings</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Site Name
              </label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
                className="w-full px-3 py-2 bg-surface-3 border border-surface-4 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Site Description
              </label>
              <textarea
                value={settings.siteDescription}
                onChange={(e) => setSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 bg-surface-3 border border-surface-4 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Max Submissions per Minute
              </label>
              <input
                type="number"
                value={settings.maxSubmissionRate}
                onChange={(e) => setSettings(prev => ({ ...prev, maxSubmissionRate: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 bg-surface-3 border border-surface-4 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="bg-surface-2 rounded-lg border border-surface-3 p-6">
          <h2 className="text-xl font-semibold text-slate-100 mb-6">Feature Toggles</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-slate-100 font-medium">User Registration</div>
                <div className="text-slate-400 text-sm">Allow new users to register</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enableRegistration}
                  onChange={(e) => setSettings(prev => ({ ...prev, enableRegistration: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-surface-3 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-500/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-slate-100 font-medium">Discussions</div>
                <div className="text-slate-400 text-sm">Enable discussion forums</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enableDiscussions}
                  onChange={(e) => setSettings(prev => ({ ...prev, enableDiscussions: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-surface-3 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-500/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-slate-100 font-medium">Maintenance Mode</div>
                <div className="text-slate-400 text-sm">Put the site in maintenance mode</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) => setSettings(prev => ({ ...prev, maintenanceMode: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-red-900 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-500/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
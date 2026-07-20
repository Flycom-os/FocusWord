"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/app/providers/auth-provider";

const SEOPage = () => {
  const { hasPermission } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const hasAccess = hasPermission("media-files", 0);

    if (!hasAccess) {
      router.push("/admin-panel/settings");
      return;
    }

    setIsChecking(false);
  }, [hasPermission, router]);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
          <p>Checking access rights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">SEO Management</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">SEO Settings</h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="meta-title" className="block text-sm font-medium text-gray-700 mb-2">
              Meta Title
            </label>
            <input
              id="meta-title"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter meta title"
            />
          </div>

          <div>
            <label htmlFor="meta-desc" className="block text-sm font-medium text-gray-700 mb-2">
              Meta Description
            </label>
            <textarea
              id="meta-desc"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Enter meta description"
            />
          </div>

          <div>
            <label htmlFor="meta-keywords" className="block text-sm font-medium text-gray-700 mb-2">
              Keywords
            </label>
            <input
              id="meta-keywords"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter keywords separated by commas"
            />
          </div>
        </div>

        <div className="mt-6">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default SEOPage;

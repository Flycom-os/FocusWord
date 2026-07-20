"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/src/app/providers/auth-provider";

export default function TestPermissionsPage() {
  const { accessToken, user, hasPermission } = useAuth();
  const [cookieValue, setCookieValue] = useState<string>("");

  useEffect(() => {
    // Check cookie value for debugging
    const cookies = document.cookie.split(";");
    const authCookie = cookies.find((c) => c.trim().startsWith("auth-token="));
    setCookieValue(authCookie ? authCookie.split("=")[1] : "Not found");
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Permission Test</h1>

      <div className="bg-gray-100 p-4 rounded-lg mb-4">
        <h2 className="font-semibold mb-2">Authorization Information:</h2>
        <p>
          <strong>User:</strong> {user?.email || "Not authorized"}
        </p>
        <p>
          <strong>Token in localStorage:</strong>{" "}
          {accessToken ? `${accessToken.substring(0, 20)}...` : "None"}
        </p>
        <p>
          <strong>Token in cookie:</strong>{" "}
          {cookieValue ? `${cookieValue.substring(0, 20)}...` : "None"}
        </p>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg mb-4">
        <h2 className="font-semibold mb-2">Permission Check:</h2>
        <p>
          <strong>Media files (level 0):</strong>{" "}
          {hasPermission("media-files", 0) ? "✅ Yes" : "❌ No"}
        </p>
        <p>
          <strong>Media files (level 1):</strong>{" "}
          {hasPermission("media-files", 1) ? "✅ Yes" : "❌ No"}
        </p>
        <p>
          <strong>Media files (level 2):</strong>{" "}
          {hasPermission("media-files", 2) ? "✅ Yes" : "❌ No"}
        </p>
        <p>
          <strong>Users (level 0):</strong> {hasPermission("users", 0) ? "✅ Yes" : "❌ No"}
        </p>
        <p>
          <strong>Users (level 2):</strong> {hasPermission("users", 2) ? "✅ Yes" : "❌ No"}
        </p>
      </div>

      <div className="bg-yellow-100 p-4 rounded-lg">
        <h2 className="font-semibold mb-2">Instructions for testing middleware:</h2>
        <ol className="list-decimal list-inside space-y-1">
          <li>Open the browser console</li>
          <li>Try accessing directly: /admin/media-files</li>
          <li>Try accessing directly: /admin/users</li>
          <li>Check server console logs</li>
          <li>If the middleware is working, you should see permission check logs</li>
        </ol>
      </div>
    </div>
  );
}

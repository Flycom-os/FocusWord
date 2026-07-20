"use client";

export default function MiddlewareTestPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Middleware Test Page</h1>
      <p className="mb-4">
        If you see this page, either the middleware is not working, or it has authorized you.
      </p>

      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="font-semibold mb-2">Instructions:</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>Open the browser console (F12)</li>
          <li>Check the "Network" and "Console" tabs</li>
          <li>Refresh this page</li>
          <li>If the middleware is working, you should see logs starting with "=== MIDDLEWARE DEBUG ==="</li>
          <li>If there are no logs, the middleware is not starting</li>
        </ol>
      </div>

      <div className="bg-yellow-100 p-4 rounded-lg mt-4">
        <h2 className="font-semibold mb-2">Possible issues:</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>Middleware file is not in the project root</li>
          <li>Next.js is caching the middleware</li>
          <li>You need to restart the server</li>
          <li>Issues with the matcher configuration</li>
        </ul>
      </div>
    </div>
  );
}

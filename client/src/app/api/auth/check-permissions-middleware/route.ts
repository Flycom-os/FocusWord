import { NextRequest, NextResponse } from "next/server";

// This endpoint is used by middleware to check access permissions
// It should make a request to the real API for JWT verification

export async function POST(request: NextRequest) {
  try {
    const { resource, minLevel } = await request.json();

    // Get token from header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);

    // Request to the real API to verify the token and permissions
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1331";

    try {
      const response = await fetch(`${apiUrl}/api/auth/verify-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ resource, minLevel }),
      });

      if (!response.ok) {
        console.log("Backend API verification failed:", response.status);
        return NextResponse.json({ hasPermission: false, error: "Token verification failed" });
      }

      const data = await response.json();
      return NextResponse.json(data);
    } catch (fetchError) {
      console.log("Backend API unavailable, using fallback logic");

      // Fallback: if backend is unavailable, perform basic check
      // This is a temporary measure for development
      if (token.includes("admin") || token.includes("full")) {
        return NextResponse.json({ hasPermission: true, source: "fallback-admin" });
      }

      if (token.includes("guest") || token.includes("user")) {
        // Guests and regular users do not have permissions for protected resources
        return NextResponse.json({ hasPermission: false, source: "fallback-guest" });
      }

      return NextResponse.json({ hasPermission: false, source: "fallback-default" });
    }
  } catch (error) {
    console.error("Error in check-permissions-middleware:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";

// Temporary mockup - in a real application, there should be a JWT token validation here
// and fetching user permissions from the database or token
const MOCK_USER_PERMISSIONS: Record<string, Record<string, number>> = {
  // userId -> { resource -> level }
  "1": {
    "media-files": 2,
    sliders: 2,
    records: 2,
    "record-categories": 2,
    pages: 2,
    users: 2,
    roles: 2,
  },
  "2": {
    "media-files": 1,
    sliders: 1,
    pages: 1,
  },
};

// Temporary function to extract userId from token (mockup)
function extractUserIdFromToken(token: string): string | null {
  // In a real application, there will be JWT verification here
  // For now we just return mock userId based on the token
  if (token === "mock-admin-token") return "1";
  if (token === "mock-user-token") return "2";
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const { resource, minLevel } = await request.json();

    // Get token from header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);

    // Extract userId from token
    const userId = extractUserIdFromToken(token);
    if (!userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Get user permissions
    const userPermissions = MOCK_USER_PERMISSIONS[userId] || {};
    const userPermissionLevel = userPermissions[resource] ?? -1;
    const hasPermission = userPermissionLevel >= minLevel;

    return NextResponse.json({
      hasPermission,
      userPermissionLevel,
      requiredLevel: minLevel,
      userId,
    });
  } catch (error) {
    console.error("Error checking permissions:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

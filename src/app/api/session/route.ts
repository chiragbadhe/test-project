import { NextResponse } from "next/server";

// Simple in-memory store for sessions
const sessions = new Map<string, { endTime: number }>();

export async function POST(request: Request) {
  try {
    const { minutes } = await request.json();
    console.log("Received minutes:", minutes);

    if (!minutes || isNaN(parseInt(minutes)) || parseInt(minutes) <= 0) {
      return NextResponse.json(
        { error: "Valid minutes are required" },
        { status: 400 }
      );
    }

    const milliseconds = parseInt(minutes) * 60 * 1000;
    const endTime = Date.now() + milliseconds;

    // Store session data
    sessions.set("timer-session", { endTime });

    // Set session cookie
    const response = NextResponse.json({
      success: true,
      message: "Session timer started",
      remainingTime: milliseconds,
    });

    response.cookies.set("session", "active", {
      maxAge: milliseconds,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    console.log("Session created successfully");
    return response;
  } catch (error: unknown) {
    console.error("Session creation failed:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to start session timer",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const sessionCookie = request.headers
      .get("cookie")
      ?.includes("session=active");

    if (!sessionCookie) {
      return NextResponse.json(
        { active: false, remainingTime: null },
        { status: 200 }
      );
    }

    const session = sessions.get("timer-session");
    if (!session) {
      return NextResponse.json(
        { active: false, remainingTime: null },
        { status: 200 }
      );
    }

    const remainingTime = Math.max(0, session.endTime - Date.now());

    return NextResponse.json({
      active: remainingTime > 0,
      remainingTime: remainingTime > 0 ? remainingTime : null,
    });
  } catch (error: unknown) {
    console.error("Session check failed:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to check session",
      },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    sessions.delete("timer-session");

    const response = NextResponse.json({
      success: true,
      message: "Session ended",
    });

    response.cookies.delete("session");

    return response;
  } catch (error: unknown) {
    console.error("Session end failed:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to end session",
      },
      { status: 500 }
    );
  }
}

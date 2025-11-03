import { NextRequest, NextResponse } from 'next/server';
import {
  verifyCredentials,
  createSession,
  setSessionCookie,
} from '@/lib/auth';
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 attempts per 15 minutes
    const identifier = getClientIdentifier(request);
    const rateLimitResult = checkRateLimit(identifier, {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 5,
    });

    if (!rateLimitResult.allowed) {
      const resetInSeconds = Math.ceil(
        (rateLimitResult.resetAt - Date.now()) / 1000
      );
      return NextResponse.json(
        {
          error: 'Too many login attempts. Please try again later.',
          resetInSeconds,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { username, password, rememberMe } = body;

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Verify credentials
    const isValid = await verifyCredentials(username, password);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Create session
    const token = await createSession(username, rememberMe === true);

    // Set session cookie
    await setSessionCookie(token, rememberMe === true);

    return NextResponse.json({
      success: true,
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}

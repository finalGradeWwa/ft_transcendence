/**
 * PL: Proxy wylogowania — blacklistuje refresh token w backendzie i czyści cookie same-origin.
 * EN: Logout proxy — blacklists refresh token in backend and clears same-origin cookie.
 */
import { NextRequest, NextResponse } from 'next/server';

const API_URL = (
	process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
).replace(/\/$/, '');

export async function POST(request: NextRequest) {
	const refreshToken = request.cookies.get('refresh_token')?.value;
	const authHeader = request.headers.get('authorization');

	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
	};

	if (authHeader) {
		headers['Authorization'] = authHeader;
	}

	if (refreshToken) {
		headers['Cookie'] = `refresh_token=${refreshToken}`;
	}

	const backendRes = await fetch(`${API_URL}/api/auth/logout/`, {
		method: 'POST',
		headers,
	});

	const response = new NextResponse(null, { status: backendRes.status });

	// PL: Wyczyść cookie refresh_token na odpowiedzi same-origin
	// EN: Clear refresh_token cookie on same-origin response
	response.cookies.delete('refresh_token');

	return response;
}

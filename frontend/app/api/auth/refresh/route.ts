/**
 * PL: Proxy odświeżania tokena — przekazuje refresh cookie do backendu i zwraca nowy access token.
 * EN: Token refresh proxy — forwards refresh cookie to backend and returns new access token.
 */
import { NextRequest, NextResponse } from 'next/server';

const API_URL = (
	process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
).replace(/\/$/, '');

export async function POST(request: NextRequest) {
	const refreshToken = request.cookies.get('refresh_token')?.value;

	if (!refreshToken) {
		return NextResponse.json(
			{ detail: 'No refresh cookie.' },
			{ status: 401 }
		);
	}

	const backendRes = await fetch(`${API_URL}/api/auth/token/refresh/`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Cookie: `refresh_token=${refreshToken}`,
		},
		cache: 'no-store',
	});

	const data = await backendRes.text();

	const response = new NextResponse(data, {
		status: backendRes.status,
		headers: { 'Content-Type': 'application/json' },
	});

	// PL: Przekopiuj Set-Cookie (nowy refresh token po rotacji) z backendu
	// EN: Copy Set-Cookie (new refresh token after rotation) from backend
	const setCookie = backendRes.headers.get('set-cookie');
	if (setCookie) {
		response.headers.set('set-cookie', setCookie);
	}

	return response;
}

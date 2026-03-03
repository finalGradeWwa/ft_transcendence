/**
 * PL: Proxy logowania — przekazuje request do backendu i ustawia cookie same-origin.
 * EN: Login proxy — forwards request to backend and sets cookie on same origin.
 */
import { NextRequest, NextResponse } from 'next/server';

const API_URL = (
	process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
).replace(/\/$/, '');

export async function POST(request: NextRequest) {
	const body = await request.json();

	const backendRes = await fetch(`${API_URL}/api/auth/login/`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body),
	});

	const bodyText = await backendRes.text();
	let data: any = {};
	try {
		data = JSON.parse(bodyText);
	} catch (e) {
		console.error('Failed to parse login response JSON', e);
	}

	const response = new NextResponse(bodyText, {
		status: backendRes.status,
		headers: { 'Content-Type': 'application/json' },
	});

	// PL: Wyodrębnij refresh_token z Set-Cookie backendu i ustaw go jako cookie same-origin
	// EN: Extract refresh_token from backend Set-Cookie and set it as a same-origin cookie
	let cookies: string[] = [];
	// PL: Używamy getSetCookie jeśli dostępne (Node 18+), w przeciwnym razie fallback do split
	// EN: Use getSetCookie if available (Node 18+), otherwise fallback to split
	// @ts-ignore
	if (typeof backendRes.headers.getSetCookie === 'function') {
		// @ts-ignore
		cookies = backendRes.headers.getSetCookie();
	} else {
		const setCookieHeader = backendRes.headers.get('set-cookie');
		if (setCookieHeader) {
			cookies = setCookieHeader.split(/,(?=\s*[^;]+=[^;]+)/);
		}
	}

	if (cookies.length > 0) {
		for (const cookie of cookies) {
			if (cookie.trim().startsWith('refresh_token=')) {
				const cookiePart = cookie.split(';')[0];
				const value = cookiePart.substring(cookiePart.indexOf('=') + 1);

				response.cookies.set('refresh_token', value, {
					httpOnly: true,
					secure: process.env.NODE_ENV === 'production',
					sameSite: 'lax',
					path: '/',
					maxAge: 60 * 60 * 24, // 24h (zgodnie z logiką middleware)
				});
			} else {
				console.log('Login: Found other cookie:', cookie.split('=')[0]);
			}
		}
	}

	// PL: Ustaw access_token jako cookie, aby endpoint refresh (i middleware) go widział od razu po zalogowaniu.
	// EN: Set access_token as a cookie so the refresh endpoint (and middleware) can see it immediately after login.
	if (data && data.access) {
		response.cookies.set('access_token', data.access, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			path: '/',
			maxAge: 60 * 15, // 15 min (standardowy czas życia access tokena)
		});
	}

	return response;
}

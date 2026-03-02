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

	const data = await backendRes.text();

	const response = new NextResponse(data, {
		status: backendRes.status,
		headers: { 'Content-Type': 'application/json' },
	});

	// PL: Przekopiuj Set-Cookie z backendu na odpowiedź same-origin
	// EN: Copy Set-Cookie from backend response to same-origin response
	const setCookie = backendRes.headers.get('set-cookie');
	if (setCookie) {
		response.headers.set('set-cookie', setCookie);
	}

	return response;
}

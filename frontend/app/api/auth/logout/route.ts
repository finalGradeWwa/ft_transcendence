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

	let status: number;

	try {
		const backendRes = await fetch(`${API_URL}/api/auth/logout/`, {
			method: 'POST',
			headers,
		});
		status = backendRes.status;
	} catch (error) {
		console.error('Backend logout call failed. Proceeding to clear cookies.', error);
		// PL: Operacja się powiodła z perspektywy klienta, bo czyścimy sesję.
		// EN: The operation succeeded from the client's perspective because we're clearing the session.
		status = 204; // No Content
	}

	const response = new NextResponse(null, { status });

	// PL: Zawsze czyść ciasteczka, niezależnie od odpowiedzi backendu, aby zapewnić wylogowanie.
	// EN: Always clear cookies, regardless of the backend's response, to ensure logout.
	response.cookies.delete({ name: 'refresh_token', path: '/' });
	// PL: Usuwamy również access_token, jeśli jest ustawiany przez middleware.
	// EN: We also delete the access_token if it's set by the middleware.
	response.cookies.delete({ name: 'access_token', path: '/' });

	return response;
}

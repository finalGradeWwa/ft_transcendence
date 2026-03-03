/**
 * PL: Endpoint dla klienta do pobierania access tokena.
 *     Nie komunikuje się z backendem. Zwraca access token, który został
 *     wcześniej odświeżony i zapisany w cookie przez middleware.
 * EN: Endpoint for the client to retrieve an access token.
 *     It does not communicate with the backend. It returns the access token
 *     that was previously refreshed and stored in a cookie by the middleware.
 */
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
	// PL: Middleware jest odpowiedzialne za odświeżenie i ustawienie 'access_token' w cookie.
	// EN: The middleware is responsible for refreshing and setting the 'access_token' cookie.
	const accessToken = request.cookies.get('access_token')?.value;

	if (accessToken) {
		// PL: Zwróć token, który przygotował middleware.
		// EN: Return the token prepared by the middleware.
		return NextResponse.json({ access: accessToken });
	}

	// PL: Jeśli nie ma tokena, oznacza to, że middleware nie zdołał go odświeżyć (sesja wygasła).
	// EN: If there's no token, it means the middleware failed to refresh it (session expired).
	return NextResponse.json({ detail: 'Access token not found. Session may be expired.' }, { status: 401 });
}

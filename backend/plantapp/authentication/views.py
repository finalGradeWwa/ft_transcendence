from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework.decorators import api_view, permission_classes

from .serializers import UserRegistrationSerializer, ChangePasswordSerializer, LoginSerializer
from users.serializers import UserSerializer
from .jwt_cookies import set_refresh_cookie, clear_refresh_cookie, REFRESH_COOKIE_NAME


# GET /
@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request):
	"""API Root - Welcome endpoint with available routes"""
	return Response({
		"message": "Welcome to the Plant App API",
		"endpoints": {
			"authentication": {
				"register": "/api/auth/register/",
				"login": "/api/auth/login/",
				"logout": "/api/auth/logout/",
				"change_password": "/api/auth/change-password/",
				"refresh_token": "/api/auth/token/refresh/",
				"current_user": "/api/auth/me/"
			},
			"users": {
				"follow": "/users/<user_id>/follow/",
				"unfollow": "/users/<user_id>/unfollow/",
				"followers": "/users/<user_id>/followers/",
				"following": "/users/<user_id>/following/"
			},
			"gardens": "/api/garden/",
			"plants": "/api/plant/",
			"admin": "/admin/"
		}
	})

# POST /api/auth/register/
class RegisterView(APIView):

	permission_classes = [AllowAny]

	def post(self, request):
		serializer = UserRegistrationSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		user = serializer.save()

		refresh = RefreshToken.for_user(user)

		response = Response({
			"user": UserSerializer(user).data,
		}, status=status.HTTP_201_CREATED)
		set_refresh_cookie(response, str(refresh))
		return response


# POST /api/auth/change-password/
class ChangePasswordView(APIView):

	permission_classes = [IsAuthenticated]

	def post(self, request):
		serializer = ChangePasswordSerializer(
			data=request.data,
			context={"request": request}
		)
		serializer.is_valid(raise_exception=True)
		serializer.save()
		return Response(
			{"detail": "Password changed successfully."},
			status=status.HTTP_200_OK
		)


# POST /api/auth/logout/
# logout adds refresh token to blacklist
class LogoutView(APIView):

	permission_classes = [IsAuthenticated]

	def post(self, request):
		refresh_token = request.COOKIES.get(REFRESH_COOKIE_NAME)

		response = Response(status=status.HTTP_205_RESET_CONTENT)

		if not refresh_token:
			clear_refresh_cookie(response)
			return response

		try:
			token = RefreshToken(refresh_token)
			token.blacklist()
		except TokenError:
			# Token may be invalid/expired/already blacklisted; logout should be idempotent.
    		# We still clear the refresh cookie and return 205.
			pass

		clear_refresh_cookie(response)
		return response

# POST /api/auth/login/

class LoginView(APIView):

	permission_classes = [AllowAny]

	def post(self, request):
		serializer = LoginSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)

		user = serializer.validated_data["user"]
		refresh = RefreshToken.for_user(user)

		response = Response({
            "user": UserSerializer(user).data,
        }, status=status.HTTP_200_OK)
		set_refresh_cookie(response, str(refresh))
		return response


# POST /api/auth/token/refresh/
class CookieTokenRefreshView(APIView):

	permission_classes = [AllowAny]

	def post(self, request):
		refresh_token = request.COOKIES.get(REFRESH_COOKIE_NAME)
		if not refresh_token:
			return Response({"detail": "No refresh cookie."}, status=status.HTTP_401_UNAUTHORIZED)

		serializer = TokenRefreshSerializer(data={"refresh": refresh_token})
		try:
			serializer.is_valid(raise_exception=True)
		except TokenError:
			response = Response({"detail": "Invalid refresh token."}, status=status.HTTP_401_UNAUTHORIZED)
			clear_refresh_cookie(response)
			return response

		data = serializer.validated_data
		response = Response({"access": data["access"]}, status=status.HTTP_200_OK)
		new_refresh = data.get("refresh")
		if new_refresh:
			set_refresh_cookie(response, new_refresh)

		return response

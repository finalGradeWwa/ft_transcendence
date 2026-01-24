from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework.decorators import api_view, permission_classes

from .serializers import UserRegistrationSerializer, ChangePasswordSerializer, LoginSerializer
from users.serializers import UserSerializer


# GET /
@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request):
	"""API Root - Welcome endpoint with available routes"""
	return Response({
		"message": "Welcome to the Plant App API",
		"endpoints": {
			"authentication": {
				"register": "/api/register/",
				"login": "/api/auth/login/",
				"logout": "/api/auth/logout/",
				"change_password": "/api/auth/change-password/",
				"token_obtain": "/api/token/",
				"token_refresh": "/api/token/refresh/",
				"token_verify": "/api/token/verify/",
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

		return Response({
			"user": UserSerializer(user).data,
			"tokens": {
				"refresh": str(refresh),
				"access": str(refresh.access_token),
			}
		}, status=status.HTTP_201_CREATED)


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
		refresh_token = request.data.get("refresh")

		if not refresh_token:
			return Response(
				{"error": "Refresh token is required."},
				status=status.HTTP_400_BAD_REQUEST
			)

		try:
			token = RefreshToken(refresh_token)
			token.blacklist()
		except TokenError as e:
			return Response(
				{"error": str(e)},
				status=status.HTTP_400_BAD_REQUEST
			)

		return Response(status=status.HTTP_205_RESET_CONTENT)

# POST /api/auth/login/

class LoginView(APIView):

	permission_classes = [AllowAny]

	def post(self, request):
		serializer = LoginSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)

		user = serializer.validated_data["user"]
		refresh = RefreshToken.for_user(user)

		return Response({
            "user": UserSerializer(user).data,
            "tokens": {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            }
        }, status=status.HTTP_200_OK)

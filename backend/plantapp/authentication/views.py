from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from .serializers import UserRegistrationSerializer, ChangePasswordSerializer, LoginSerializer
from users.serializers import UserSerializer

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

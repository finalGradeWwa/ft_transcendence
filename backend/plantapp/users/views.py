from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .serializers import UserSerializer, UserUpdateSerializer

# GET /api/auth/me/ - get user data
# PATCH /api/auth/me/ - update user profile
class MeView(APIView):

	permission_classes = [IsAuthenticated]

	def get(self, request):
		serializer = UserSerializer(request.user)
		return Response(serializer.data)

	def patch(self, request):
		serializer = UserUpdateSerializer(
			request.user,
			data=request.data,
			partial=True
		)
		serializer.is_valid(raise_exception=True)
		serializer.save()
		return Response(serializer.data)

